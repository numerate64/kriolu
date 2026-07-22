# Kriolu Dictionary

A static English and Kriolu dictionary for quick lookup, published with GitHub Pages and installable as a small progressive web app. It combines entries from the English-Kriolu Dictionary and the 1994 *Disonariu Kabuverdianu* reference into a fast browser search experience.

The app is designed for lightweight everyday use: open the page, type an English or Kriolu term, and scan matching entries without a backend server or account.

## Published Page

```text
https://numerate64.github.io/kriolu/
```

## Features

- Search English, Kriolu, and Sanpajudu fields from one input.
- Rank exact and prefix English matches ahead of broader English/Kriolu matches.
- Show part of speech, Sanpajudu variants, and source labels when present.
- Provide light and dark themes with the preference saved locally in the browser.
- Include a Kriolu word of the day with the current date.
- Support installable PWA behavior with a manifest, icons, and a service worker.

## Word Of The Day

The daily word is selected entirely in the browser from `dictionary.json`.

Selection rules:

- Entries must have a Kriolu word and an English definition.
- Very long definitions and unsuitable vulgar entries are filtered out.
- Cross-reference-only entries such as "see ..." are skipped.
- Duplicate Kriolu words are deduplicated so repeated source entries do not repeat the displayed word.
- The remaining pool is placed into a deterministic pseudo-random shuffled schedule.
- The schedule advances once per local day and does not repeat a normalized Kriolu word until the full eligible pool has been used.

The random-looking order is deterministic on purpose: every visitor gets the same word for the same local date, while the list still feels shuffled rather than alphabetical.

## Files

- `index.html`, `styles.css`, `app.js` - app shell, styling, search, and rendering.
- `dictionary.json` - dictionary data loaded by the browser.
- `manifest.webmanifest`, `service-worker.js`, `icons/` - PWA support.
- `README-iPhone.md` - iPhone installation notes.

## Local Preview

From the parent workspace folder:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/kriolu/
```

This path matters because the app uses `/kriolu/...` asset URLs to match GitHub Pages.

## Updating Vocabulary

Update `dictionary.json`, then preview locally before publishing. The app expects an array of entries with fields like:

```json
{
  "english": "Water",
  "kriolu": "Água",
  "partOfSpeech": "n",
  "sanpajudu": "Auga",
  "source": "English-Kriolu Dictionary"
}
```

After vocabulary or app changes, bump the service-worker cache name in `service-worker.js` when users need browsers to refresh cached assets.

## Publishing

The repo publishes through GitHub Pages using the workflow in `.github/workflows/pages.yml`. Push changes to `main`; the workflow deploys the static files to:

```text
https://numerate64.github.io/kriolu/
```
