# Architecture

Super Volume Booster & Equalizer is a Manifest V3 Chrome extension for local tab audio processing.

## Main components

| File | Purpose |
|---|---|
| `manifest.json` | Extension metadata, permissions, icons, and entry points. |
| `background.js` | Service worker that controls the extension state and starts/stops audio processing. |
| `popup.html` | Popup interface with volume and equalizer controls. |
| `popup.js` | UI logic, settings persistence, and messages to the background worker. |
| `offscreen.html` | Minimal offscreen document for Manifest V3 background audio processing. |
| `offscreen.js` | Web Audio API graph: capture source, filters, gain node, and output. |

## Audio pipeline

```text
Active tab audio
   ↓
chrome.tabCapture
   ↓
MediaStreamSource
   ↓
BiquadFilterNode: bass / lowshelf / 60 Hz
   ↓
BiquadFilterNode: mid / peaking / 1 kHz
   ↓
BiquadFilterNode: treble / highshelf / 10 kHz
   ↓
GainNode: up to 600%
   ↓
AudioContext.destination
```

## Privacy-oriented design

The extension avoids external communication and does not include analytics. User settings are stored locally through `chrome.storage.local`.

## Permission design

The extension uses only the permissions required for local tab audio processing:

- `activeTab`;
- `tabCapture`;
- `storage`;
- `offscreen`.
