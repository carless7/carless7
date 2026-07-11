import { getSecret } from 'astro:env/server';

const requiredSecret = (name: string) => {
  const value = getSecret(name);
  if (!value) throw new Error('Spotify credentials are not configured.');
  return value;
};

export const getSpotifyCredentials = () => ({
  clientId: requiredSecret('SPOTIFY_CLIENT_ID'),
  clientSecret: requiredSecret('SPOTIFY_CLIENT_SECRET'),
  refreshToken: requiredSecret('SPOTIFY_REFRESH_TOKEN'),
});
