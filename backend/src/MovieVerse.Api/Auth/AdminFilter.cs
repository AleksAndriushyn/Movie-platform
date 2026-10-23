using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Auth;

public static class AdminFilter
{
    /// <summary>
    /// Admin rights are checked against the database on every request, not the cookie,
    /// so revoking them takes effect immediately.
    /// </summary>
    public static RouteGroupBuilder RequireAdmin(this RouteGroupBuilder group)
    {
        group.RequireAuthorization().AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            var userId = http.User.GetUserId();
            var db = http.RequestServices.GetRequiredService<AppDbContext>();

            if (!await db.Users.AnyAsync(u => u.Id == userId && u.IsAdmin, http.RequestAborted))
            {
                return Results.Problem(statusCode: StatusCodes.Status403Forbidden, title: "Moderators only");
            }

            return await next(context);
        });
        return group;
    }
}
