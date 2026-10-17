using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;

namespace MovieVerse.Api.Tmdb;

/// <summary>
/// Thin typed HttpClient over the TMDB v3 API. Returns raw JSON so the frontend
/// keeps consuming the TMDB response shape it already knows.
/// </summary>
public sealed class TmdbClient(HttpClient httpClient)
{
    public async Task<string> GetJsonAsync(
        string path,
        IReadOnlyDictionary<string, string?> query,
        CancellationToken cancellationToken)
    {
        var uri = QueryHelpers.AddQueryString(path, query);

        using var response = await httpClient.GetAsync(uri, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new TmdbException(response.StatusCode, ReadStatusMessage(body));
        }

        return body;
    }

    // TMDB error bodies look like { "status_code": 34, "status_message": "..." }
    private static string? ReadStatusMessage(string body)
    {
        try
        {
            using var document = JsonDocument.Parse(body);
            return document.RootElement.TryGetProperty("status_message", out var message)
                ? message.GetString()
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
