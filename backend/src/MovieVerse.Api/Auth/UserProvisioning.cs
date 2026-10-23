using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Auth;

/// <summary>Creates or refreshes our user record when Google sign-in completes.</summary>
public static class UserProvisioning
{
    public static async Task OnCreatingTicketAsync(OAuthCreatingTicketContext context)
    {
        var identity = context.Identity
            ?? throw new InvalidOperationException("Google sign-in produced no identity.");
        var subject = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("Google sign-in produced no subject.");

        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var ct = context.HttpContext.RequestAborted;
        var now = DateTime.UtcNow;

        var user = await db.Users.SingleOrDefaultAsync(u => u.GoogleSubject == subject, ct);
        if (user is null)
        {
            user = new User { GoogleSubject = subject, CreatedAtUtc = now };
            db.Users.Add(user);
        }

        user.Email = identity.FindFirst(ClaimTypes.Email)?.Value;
        user.Name = identity.FindFirst(ClaimTypes.Name)?.Value;
        user.AvatarUrl = identity.FindFirst(AuthClaims.Picture)?.Value;
        user.LastLoginAtUtc = now;

        await db.SaveChangesAsync(ct);

        identity.AddClaim(new Claim(AuthClaims.UserId, user.Id.ToString(CultureInfo.InvariantCulture)));
        if (user.IsAdmin)
        {
            identity.AddClaim(new Claim(AuthClaims.Admin, "true"));
        }
    }
}
