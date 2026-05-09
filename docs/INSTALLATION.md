# Installation Guide

## Install from source in Chrome

1. Download or clone the repository.
2. Open Chrome.
3. Go to `chrome://extensions/`.
4. Enable **Developer mode** in the top-right corner.
5. Click **Load unpacked**.
6. Select the project folder.
7. Pin the extension to the toolbar.
8. Open a tab with audio and click the extension icon.

## Update after changes

After editing files:

1. Go to `chrome://extensions/`.
2. Find the extension card.
3. Click the reload icon.
4. Refresh the tab with audio.

## Troubleshooting

### The extension does not appear

Check that `manifest.json` is located in the selected folder.

### Icons do not load

Make sure the icon files are located in the same paths that are declared in `manifest.json`.

Recommended structure:

```text
icons/
├── icon16.png
├── icon48.png
└── icon128.png
```

### Audio does not change

Try:

- refresh the tab with audio;
- turn the extension off and on again;
- reload the extension from `chrome://extensions/`;
- check the browser console for errors.
