using System.Globalization;
using System.Security.Claims;

namespace MovieVerse.Api.Auth;

public static class AuthClaims
{
    /// <summary>Our database user id, added at sign-in.</summary>
    public const string UserId = "mv:uid";

    public const string Picture = "picture";

    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(UserId)
            ?? throw new InvalidOperationException("Authenticated user has no user id claim."),
            CultureInfo.InvariantCulture);
}
