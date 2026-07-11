import type { APIRoute } from 'astro';
import { getSpotifyCredentials } from '../../../lib/spotify-env';
import { mapArtists, spotifyRequest } from '../../../lib/spotify.mjs';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = await spotifyRequest('/me/top/artists?time_range=medium_term&limit=8', 'top-artists', 1800, getSpotifyCredentials());
    return Response.json({ ok: true, artists: mapArtists(data) }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' },
    });
  } catch (error) {
    console.error('[spotify] top artists unavailable:', error instanceof Error ? error.message : 'unknown error');
    return Response.json({ ok: false, error: 'Top-artist data is unavailable.' }, { status: 503 });
  }
};
