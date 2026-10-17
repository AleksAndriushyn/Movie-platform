using System.Net.Http.Headers;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;
using MovieVerse.Api.Infrastructure;
using MovieVerse.Api.Movies;
using MovieVerse.Api.Tmdb;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.AddExceptionHandler<UpstreamExceptionHandler>();
builder.Services.AddHealthChecks();
builder.Services.AddHybridCache();

builder.Services
    .AddOptions<TmdbOptions>()
    .Bind(builder.Configuration.GetSection(TmdbOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddHttpClient<TmdbClient>((services, client) =>
    {
        var options = services.GetRequiredService<IOptions<TmdbOptions>>().Value;
        client.BaseAddress = new Uri(options.BaseUrl);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.AccessToken);
    })
    // retries transient 5xx/408/429 with backoff, plus timeouts and a circuit breaker
    .AddStandardResilienceHandler();

builder.Services.AddScoped<MovieCatalog>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(http =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientIp(http),
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1) }));
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapHealthChecks("/health").DisableRateLimiting();
app.MapMovieEndpoints();

app.Run();

// Requests arrive through the Vercel rewrite and Azure's front end, so the
// client IP is the first X-Forwarded-For entry rather than the socket address
static string GetClientIp(HttpContext http)
{
    var forwardedFor = http.Request.Headers["X-Forwarded-For"].ToString();
    if (!string.IsNullOrEmpty(forwardedFor))
    {
        return forwardedFor.Split(',')[0].Trim();
    }

    return http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

public partial class Program;
