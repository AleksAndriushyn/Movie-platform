using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using MovieVerse.Api.Tmdb;

namespace MovieVerse.Api.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AccessToken = "test-token";

    public FakeTmdbHandler Tmdb { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Tmdb:AccessToken", AccessToken);
        builder.ConfigureTestServices(services =>
            services.AddHttpClient<TmdbClient>().ConfigurePrimaryHttpMessageHandler(() => Tmdb));
    }
}
