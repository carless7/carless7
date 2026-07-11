# Custom cursor asset

The global CSS in `src/layouts/Layout.astro` uses the included SVG cursor:

```css
cursor: url('/cursors/retro-pointer.svg') 4 2, auto;
```

If you want maximum legacy-style compatibility, add a real Windows `.cur` file here too:

```text
public/cursors/retro-pointer.cur
```

Then add it before the SVG in `Layout.astro`:

```css
cursor: url('/cursors/retro-pointer.cur'), url('/cursors/retro-pointer.svg') 4 2, auto;
```

Keep cursor assets around `32x32` pixels and set the hotspot close to the top-left pointer tip.
