using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Auth;
using MovieVerse.Api.Data;
using MovieVerse.Api.Movies;

namespace MovieVerse.Api.Reviews;

public sealed record ReviewAuthor(string? Name, string? AvatarUrl);

public sealed record ReviewDto(
    int Id,
    ReviewAuthor Author,
    string Body,
    bool ContainsSpoilers,
    int? AuthorRating,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    bool IsOwn,
    bool ReportedByMe);

public sealed record ReviewPage(int Page, IReadOnlyList<ReviewDto> Results, int TotalPages, int TotalResults);

public sealed record OwnReview(
    int Id,
    string Body,
    bool ContainsSpoilers,
    ReviewStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

/// <summary>Wraps the author's own review, which may not exist yet.</summary>
public sealed record OwnReviewResponse(OwnReview? Review);

public sealed record WriteReviewRequest(
    [property: Required, StringLength(Review.MaxBodyLength)] string Body,
    bool ContainsSpoilers);

public sealed record ReportReviewRequest(ReportReason Reason);

public static class ReviewEndpoints
{
    public const int PageSize = 10;
    public const int MaxNewReviewsPerDay = 20;

    /// <summary>Reports from this many different users hide a review until a moderator looks at it.</summary>
    public const int ReportsToHide = 3;

    public static IEndpointRouteBuilder MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        // Public: anyone can read; a signed-in reader also learns which reviews are theirs or reported by them
        app.MapGet("/api/movies/{movieId:int}/reviews", async (
                [Range(1, int.MaxValue)] int movieId,
                ClaimsPrincipal user,
                AppDbContext db,
                [Range(1, int.MaxValue)] int page = 1,
                CancellationToken ct = default) =>
        {
            int? viewerId = user.Identity?.IsAuthenticated == true ? user.GetUserId() : null;
            var query = db.Reviews.Where(r => r.MovieId == movieId && r.Status == ReviewStatus.Visible);

            var total = await query.CountAsync(ct);
            var results = await query
                .OrderByDescending(r => r.CreatedAtUtc)
                .ThenByDescending(r => r.Id)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(r => new ReviewDto(
                    r.Id,
                    new ReviewAuthor(r.User!.Name, r.User.AvatarUrl),
                    r.Body,
                    r.ContainsSpoilers,
                    db.Ratings
                        .Where(rating => rating.UserId == r.UserId && rating.MovieId == r.MovieId)
                        .Select(rating => (int?)rating.Score)
                        .FirstOrDefault(),
                    r.CreatedAtUtc,
                    r.UpdatedAtUtc,
                    r.UserId == viewerId,
                    r.Reports.Any(report => report.ReporterUserId == viewerId)))
                .ToListAsync(ct);

            return new ReviewPage(page, results, (total + PageSize - 1) / PageSize, total);
        })
            .WithTags("Reviews")
            .WithName("GetMovieReviews");

        var mine = app.MapGroup("/api/me/reviews").WithTags("Reviews").RequireAuthorization();

        // The author's own review in any status, so they can edit it and see if it was hidden
        mine.MapGet("/{movieId:int}", async (int movieId, ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            var review = await db.Reviews
                .Where(r => r.UserId == userId && r.MovieId == movieId)
                .Select(r => new OwnReview(r.Id, r.Body, r.ContainsSpoilers, r.Status, r.CreatedAtUtc, r.UpdatedAtUtc))
                .SingleOrDefaultAsync(ct);
            return new OwnReviewResponse(review);
        })
            .WithName("GetOwnReview");

        mine.MapPut("/{movieId:int}", async (
                [Range(1, int.MaxValue)] int movieId,
                WriteReviewRequest request,
                ClaimsPrincipal user,
                AppDbContext db,
                MovieCatalog catalog,
                CancellationToken ct) =>
        {
            var body = request.Body.Trim();
            if (body.Length < Review.MinBodyLength)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["body"] = [$"A review needs at least {Review.MinBodyLength} characters."],
                });
            }

            var userId = user.GetUserId();
            var now = DateTime.UtcNow;
            var review = await db.Reviews.SingleOrDefaultAsync(r => r.UserId == userId && r.MovieId == movieId, ct);

            if (review is not null)
            {
                if (review.Status == ReviewStatus.Removed)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status409Conflict,
                        title: "Review removed",
                        detail: "A moderator removed this review, so it can't be edited.");
                }

                // Editing keeps the status: a hidden review stays hidden until a moderator decides
                review.Body = body;
                review.ContainsSpoilers = request.ContainsSpoilers;
                review.UpdatedAtUtc = now;
            }
            else
            {
                var since = now.AddDays(-1);
                if (await db.Reviews.CountAsync(r => r.UserId == userId && r.CreatedAtUtc > since, ct) >= MaxNewReviewsPerDay)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status429TooManyRequests,
                        title: "Too many reviews",
                        detail: $"You can post up to {MaxNewReviewsPerDay} reviews a day.");
                }

                // Unknown movie ids surface as 404 from TMDB via the exception handler
                await catalog.GetSummaryAsync(movieId, ct);

                review = new Review
                {
                    UserId = userId,
                    MovieId = movieId,
                    Body = body,
                    ContainsSpoilers = request.ContainsSpoilers,
                    Status = ReviewStatus.Visible,
                    CreatedAtUtc = now,
                };
                db.Reviews.Add(review);
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new OwnReview(
                review.Id, review.Body, review.ContainsSpoilers, review.Status, review.CreatedAtUtc, review.UpdatedAtUtc));
        })
            .WithName("WriteReview");

        mine.MapDelete("/{movieId:int}", async (int movieId, ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            // A removed review stays, so deleting it can't be used to post the same thing again
            await db.Reviews
                .Where(r => r.UserId == userId && r.MovieId == movieId && r.Status != ReviewStatus.Removed)
                .ExecuteDeleteAsync(ct);
            return Results.NoContent();
        })
            .WithName("DeleteOwnReview");

        app.MapPost("/api/reviews/{reviewId:int}/reports", async (
                int reviewId,
                ReportReviewRequest request,
                ClaimsPrincipal user,
                AppDbContext db,
                CancellationToken ct) =>
        {
            if (!Enum.IsDefined(request.Reason))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["reason"] = ["Unknown reason."],
                });
            }

            var userId = user.GetUserId();
            var review = await db.Reviews
                .Where(r => r.Id == reviewId && r.Status == ReviewStatus.Visible)
                .Select(r => new { r.UserId, AlreadyReported = r.Reports.Any(x => x.ReporterUserId == userId) })
                .SingleOrDefaultAsync(ct);

            if (review is null)
            {
                return Results.NotFound();
            }

            if (review.UserId == userId)
            {
                return Results.Problem(statusCode: StatusCodes.Status400BadRequest, title: "You can't report your own review");
            }

            if (!review.AlreadyReported)
            {
                db.ReviewReports.Add(new ReviewReport
                {
                    ReviewId = reviewId,
                    ReporterUserId = userId,
                    Reason = request.Reason,
                    CreatedAtUtc = DateTime.UtcNow,
                });

                try
                {
                    await db.SaveChangesAsync(ct);
                }
                catch (DbUpdateException)
                {
                    // the same user double-submitted; one report counts once
                    db.ChangeTracker.Clear();
                }

                await db.Reviews
                    .Where(r => r.Id == reviewId && r.Status == ReviewStatus.Visible && r.Reports.Count >= ReportsToHide)
                    .ExecuteUpdateAsync(set => set.SetProperty(r => r.Status, ReviewStatus.Hidden), ct);
            }

            return Results.NoContent();
        })
            .RequireAuthorization()
            .WithTags("Reviews")
            .WithName("ReportReview");

        return app;
    }
}
