const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1';

let token;
let tokenRequest;
const responseCache = new Map();

const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value : '';
const count = (value) => Number.isFinite(value) ? value : 0;
const safeUrl = (value) => {
  try {
    const url = new URL(text(value));
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};
const spotifyUrl = (item) => safeUrl(record(record(item).external_urls).spotify);
const imageUrl = (item) => list(record(item).images).map((image) => safeUrl(record(image).url)).find(Boolean) || '';

export const mapArtists = (payload) => list(record(payload).items)
  .map((item) => ({
    name: text(record(item).name),
    image: imageUrl(item),
    url: spotifyUrl(item),
  }))
  .filter((artist) => artist.name && artist.url);

export const mapPlaylists = (payload) => list(record(payload).items)
  .filter((item) => record(item).public === true)
  .map((item) => ({
    name: text(record(item).name),
    image: imageUrl(item),
    url: spotifyUrl(item),
    tracks: count(record(record(item).tracks).total),
  }))
  .filter((playlist) => playlist.name && playlist.url);

export const mapNowPlaying = (payload) => {
  const source = record(payload);
  const item = record(source.item);
  const album = record(item.album);
  const track = {
    name: text(item.name),
    artists: list(item.artists).map((artist) => text(record(artist).name)).filter(Boolean),
    album: text(album.name),
    image: imageUrl(album),
    url: spotifyUrl(item),
  };

  return {
    playing: Boolean(source.is_playing && track.name && track.url),
    track: track.name && track.url ? track : null,
  };
};

const requestAccessToken = async ({ clientId, clientSecret, refreshToken }) => {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!response.ok) throw new Error('Spotify authentication failed.');

  const body = record(await response.json());
  const accessToken = text(body.access_token);
  if (!accessToken) throw new Error('Spotify returned no access token.');

  const lifetime = Number.isFinite(body.expires_in) ? body.expires_in : 3600;
  token = { value: accessToken, expiresAt: Date.now() + Math.max(60, lifetime - 60) * 1000 };
  return accessToken;
};

const getAccessToken = async (credentials) => {
  if (token?.expiresAt > Date.now()) return token.value;
  tokenRequest ??= requestAccessToken(credentials);
  try {
    return await tokenRequest;
  } finally {
    tokenRequest = undefined;
  }
};

export const spotifyRequest = async (path, cacheKey, maxAgeSeconds, credentials) => {
  const cached = responseCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached.value;

  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${await getAccessToken(credentials)}` },
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error('Spotify data request failed.');

  const value = await response.json();
  responseCache.set(cacheKey, { value, expiresAt: Date.now() + maxAgeSeconds * 1000 });
  return value;
};
