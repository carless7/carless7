import assert from 'node:assert/strict';
import test from 'node:test';
import { mapArtists, mapNowPlaying, mapPlaylists } from '../src/lib/spotify.mjs';

test('Spotify payloads are reduced to controlled public fields', () => {
  const external_urls = { spotify: 'https://open.spotify.com/example' };
  const images = [{ url: 'https://i.scdn.co/image/example' }];

  assert.deepEqual(mapArtists({ items: [{ name: 'Artist', images, external_urls, followers: { total: 99 } }] }), [
    { name: 'Artist', image: images[0].url, url: external_urls.spotify },
  ]);
  assert.deepEqual(mapPlaylists({ items: [{ name: 'Playlist', public: true, images, external_urls, tracks: { total: 12 }, owner: { id: 'private' } }] }), [
    { name: 'Playlist', image: images[0].url, url: external_urls.spotify, tracks: 12 },
  ]);
  assert.deepEqual(mapPlaylists({ items: [{ name: 'Private', public: false, external_urls }] }), []);
  assert.deepEqual(mapNowPlaying(null), { playing: false, track: null });
  assert.equal(mapArtists({ items: [{ name: 'Unsafe', external_urls: { spotify: 'javascript:alert(1)' } }] }).length, 0);
});
