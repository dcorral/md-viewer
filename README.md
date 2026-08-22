# md-viewer

A split-screen markdown previewer. Raw markdown on the left, formatted on the right.

Live at [md.dcorral.com](https://md.dcorral.com).

## What it does

- Paste or type markdown and see it rendered as you go
- Expand either side to full screen, `Esc` to go back
- **Paste** button, or just `Ctrl`/`Cmd`+`V` into the left pane
- Open a `.md` file, or drop one anywhere on the page
- **Example** button to load a sample document
- Follows your system light or dark setting

That is the whole thing. There are no accounts, no settings and no export.

## Privacy

Everything runs in the browser. Files you open are read locally and never uploaded, and nothing is
saved anywhere - close the tab and it is gone.

## Running it

There is no build step. Serve the directory with any static web server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

The full-screen toggle is the only stateful logic, so it has a test:

```sh
node test-toggle.js
```

It runs the real `app.js` against a stubbed DOM. Note it covers behaviour, not layout - the CSS is
not tested.

## Built with

- [marked](https://github.com/markedjs/marked) for parsing (MIT)
- [DOMPurify](https://github.com/cure53/DOMPurify) to clean the output before it is displayed (MIT)

Both are vendored in `vendor/` so the page has no external requests and works offline.

Total size is about 26 KB gzipped.
