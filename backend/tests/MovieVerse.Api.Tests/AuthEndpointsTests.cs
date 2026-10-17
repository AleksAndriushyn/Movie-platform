using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MovieVerse.Api.Auth;
using MovieVerse.Api.Data;

namespace MovieVerse.Api.Tests;

public sealed class AuthEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task Me_WithoutSession_Returns401InsteadOfRedirect()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        var response = await client.GetAsync("/api/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithSession_ReturnsProfileFromClaims()
    {
        var user = await _factory.AddUserAsync("google-1");

        var me = await _factory.CreateClientFor(user).GetFromJsonAsync<CurrentUser>("/api/me");

        Assert.Equal(user.Id, me?.Id);
        Assert.Equal("Test User", me?.Name);
        Assert.Equal("https://example.com/avatar.png", me?.AvatarUrl);
    }

    [Fact]
    public async Task Login_RedirectsToGoogleWithCallbackOnPublicOrigin()
    {
        _factory.Settings["App:PublicOrigin"] = "https://movies.example";
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        var response = await client.GetAsync("/api/auth/login?returnUrl=/movie/550");

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        var location = response.Headers.Location!.ToString();
        Assert.StartsWith("https://accounts.google.com/", location);
        Assert.Contains("redirect_uri=https%3A%2F%2Fmovies.example%2Fapi%2Fauth%2Fsignin-google&", location);
    }

    [Fact]
    public async Task Logout_ClearsAuthCookie()
    {
        var response = await _factory.CreateClient().PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie => cookie.StartsWith("mv_auth=;"));
    }

    [Fact]
    public async Task DeleteMe_RemovesUserAndTheirDataOnly()
    {
        _factory.Tmdb.Respond("movie/550?append_to_response=credits,videos", """{"id":550,"title":"Fight Club","vote_average":8.4}""");
        var alice = await _factory.AddUserAsync("google-alice");
        var bob = await _factory.AddUserAsync("google-bob");
        var aliceClient = _factory.CreateClientFor(alice);
        await aliceClient.PutAsync("/api/me/lists/favorites/550", null);
        await aliceClient.PutAsJsonAsync("/api/me/ratings/550", new { score = 9 });
        await _factory.CreateClientFor(bob).PutAsync("/api/me/lists/favorites/550", null);

        var response = await aliceClient.DeleteAsync("/api/me");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie => cookie.StartsWith("mv_auth=;"));
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.False(await db.Users.AnyAsync(u => u.Id == alice.Id));
        Assert.False(await db.ListItems.AnyAsync(i => i.UserId == alice.Id));
        Assert.False(await db.Ratings.AnyAsync(r => r.UserId == alice.Id));
        Assert.True(await db.ListItems.AnyAsync(i => i.UserId == bob.Id));
    }

    [Fact]
    public async Task DeleteMe_WithoutSession_Returns401()
    {
        var response = await _factory.CreateClient().DeleteAsync("/api/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("/movie/550", "/movie/550")]
    [InlineData("/search?query=alien", "/search?query=alien")]
    [InlineData(null, "/")]
    [InlineData("", "/")]
    [InlineData("https://evil.example", "/")]
    [InlineData("//evil.example", "/")]
    [InlineData("/\\evil.example", "/")]
    public void ReturnUrl_KeepsOnlySameSitePaths(string? input, string expected) =>
        Assert.Equal(expected, ReturnUrl.Sanitize(input));
}
