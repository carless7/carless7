import type { APIRoute } from 'astro';
import { getSpotifyCredentials } from '../../../lib/spotify-env';
import { mapNowPlaying, spotifyRequest } from '../../../lib/spotify.mjs';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = await spotifyRequest('/me/player/currently-playing', 'now-playing', 15, getSpotifyCredentials());
    return Response.json({ ok: true, ...mapNowPlaying(data) }, {
      headers: { 'Cache-Control': 'public, max-age=10, stale-while-revalidate=20' },
    });
  } catch (error) {
    console.error('[spotify] now playing unavailable:', error instanceof Error ? error.message : 'unknown error');
    return Response.json({ ok: false, error: 'Current playback is unavailable.' }, { status: 503 });
  }
};
