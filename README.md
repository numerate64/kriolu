# Kriolu Dictionary

A browser-based English and Kriolu dictionary for quick lookup. The app is static and installable as a small progressive web app.

## Published Page

```text
https://numerate64.github.io/kriolu/
```

## Files

- `index.html`, `styles.css`, `app.js` - app shell, styling, search, and rendering.
- `dictionary.json` - dictionary data loaded by the browser.
- `manifest.webmanifest`, `service-worker.js`, `icons/` - PWA support.
- `README-iPhone.md` - iPhone installation notes.

## Local Preview

```sh
python3 -m http.server 8000
```

Updating vocabulary means editing `dictionary.json` and redeploying the static site.
