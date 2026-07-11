import type { APIRoute } from 'astro';
import { getSpotifyCredentials } from '../../../lib/spotify-env';
import { mapPlaylists, spotifyRequest } from '../../../lib/spotify.mjs';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = await spotifyRequest('/me/playlists?limit=8', 'playlists', 3600, getSpotifyCredentials());
    return Response.json({ ok: true, playlists: mapPlaylists(data) }, {
      headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' },
    });
  } catch (error) {
    console.error('[spotify] playlists unavailable:', error instanceof Error ? error.message : 'unknown error');
    return Response.json({ ok: false, error: 'Public playlists are unavailable.' }, { status: 503 });
  }
};
