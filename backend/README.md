# MovieVerse API

ASP.NET Core 10 API behind the MovieVerse frontend. For now it proxies the TMDB endpoints
the site uses, so the TMDB token never reaches the browser, and caches responses in memory.

| Endpoint | TMDB call | Cached for |
| --- | --- | --- |
| `GET /api/movies/popular?page=` | `movie/popular` | 15 min |
| `GET /api/movies/search?query=&page=` | `search/movie` | 5 min |
| `GET /api/movies/{id}` | `movie/{id}?append_to_response=credits,videos` | 1 h |
| `GET /api/genres` | `genre/movie/list` | 24 h |
| `GET /api/genres/{id}/movies?page=` | `discover/movie?with_genres=` | 15 min |
| `GET /health` | — | — |

Responses are TMDB's JSON unchanged; errors are [ProblemDetails](https://www.rfc-editor.org/rfc/rfc9457).
`page` must be 1–500 and `query` at most 100 characters. Requests are rate limited to 120 per minute per client IP.
The OpenAPI document is served at `/openapi/v1.json` in Development.

## Local development

Requires the .NET 10 SDK. Store your [TMDB API Read Access Token](https://www.themoviedb.org/settings/api) in user secrets once:

```bash
dotnet user-secrets set "Tmdb:AccessToken" "<token>" --project backend/src/MovieVerse.Api
```

Then, from the repository root, run the API (http://localhost:5080) and the frontend together:

```bash
npm run dev:all
```

The Vite dev server proxies `/api` to the API. Run the tests with `dotnet test backend`.

## Deployment (Azure App Service, Free F1)

1. Create a **Web App**: Publish *Code*, Runtime stack *.NET 10 (LTS)*, OS *Linux*, pricing plan *Free F1*.
2. In the app's **Settings → Environment variables**, add `Tmdb__AccessToken` with the TMDB token.
3. In **Settings → Configuration**, turn on *SCM Basic Auth Publishing Credentials*, then download the
   publish profile from the app's **Overview** page.
4. In the GitHub repository, add the secret `AZURE_WEBAPP_PUBLISH_PROFILE` (the publish profile file's contents)
   and the variable `AZURE_WEBAPP_NAME` (the app name). The `Backend` workflow deploys every push to `main`
   that touches `backend/`; run it manually the first time.
5. Point the frontend at the API: in `vercel.json`, add a rewrite from `/api/:path*` to
   `https://<default domain>/api/:path*` above the SPA fallback.

The Free tier sleeps when idle, so the first request after a pause takes a few seconds.
