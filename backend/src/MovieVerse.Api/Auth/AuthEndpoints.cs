using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Auth;

public sealed record CurrentUser(int Id, string? Name, string? Email, string? AvatarUrl);

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth").WithTags("Auth");

        // A top-level navigation, not fetch: the browser follows the redirect to Google
        auth.MapGet("/login", (string? returnUrl) =>
            Results.Challenge(
                new AuthenticationProperties { RedirectUri = ReturnUrl.Sanitize(returnUrl) },
                [GoogleDefaults.AuthenticationScheme]))
            .WithName("Login");

        auth.MapPost("/logout", async (HttpContext http) =>
        {
            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        })
            .WithName("Logout");

        app.MapGet("/api/me", (ClaimsPrincipal user) => new CurrentUser(
                user.GetUserId(),
                user.FindFirstValue(ClaimTypes.Name),
                user.FindFirstValue(ClaimTypes.Email),
                user.FindFirstValue(AuthClaims.Picture)))
            .RequireAuthorization()
            .WithTags("Auth")
            .WithName("GetCurrentUser");

        // Self-service erasure: removes the user and, by cascade, everything they saved
        app.MapDelete("/api/me", async (HttpContext http, ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var userId = user.GetUserId();
            await db.Users.Where(u => u.Id == userId).ExecuteDeleteAsync(ct);
            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        })
            .RequireAuthorization()
            .WithTags("Auth")
            .WithName("DeleteCurrentUser");

        return app;
    }
}

public static class ReturnUrl
{
    /// <summary>
    /// Keeps only same-site paths ("/movie/550"), so the login endpoint can't be used
    /// as an open redirect to "//evil.example" or "https://evil.example".
    /// </summary>
    public static string Sanitize(string? returnUrl)
    {
        if (string.IsNullOrEmpty(returnUrl) || returnUrl[0] != '/')
        {
            return "/";
        }

        if (returnUrl.Length > 1 && (returnUrl[1] == '/' || returnUrl[1] == '\\'))
        {
            return "/";
        }

        return returnUrl;
    }
}
