// background.js
let isActive = false;
let currentTabId = null;
let currentStreamId = null;
let settings = { gain: 1, eq: {bass: 0, mid: 0, treble: 0} };

async function hasOffscreenDocument() {
  if ('getContexts' in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    return contexts.length > 0;
  }
  return false;
}

async function setupOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['DISPLAY_MEDIA'],
    justification: 'Audio processing for tab capture'
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.type) {
    case 'toggle':
      isActive = message.active;
      if (isActive) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTabId = tab.id;

        await setupOffscreenDocument();

        currentStreamId = await chrome.tabCapture.getMediaStreamId({
          targetTabId: currentTabId
        });

        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'start',
          streamId: currentStreamId,
          settings: settings
        });
      } else {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'stop'
        });
        if (await hasOffscreenDocument()) {
          await chrome.offscreen.closeDocument();
        }
      }
      sendResponse({success: true});
      break;
    case 'updateGain':
      settings.gain = message.value;
      if (isActive) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'updateGain',
          value: message.value
        });
      }
      break;
    case 'updateEQ':
      settings.eq[message.band] = message.value;
      if (isActive) {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'updateEQ',
          band: message.band,
          value: message.value
        });
      }
      break;
    case 'getStatus':
      sendResponse({isActive: isActive});
      break;
  }
  return true;
});

// Load initial settings from storage
chrome.storage.local.get(['volumeBoosterSettings'], (result) => {
  if (result.volumeBoosterSettings) {
    settings.gain = parseInt(result.volumeBoosterSettings.volumeBoost) / 100 || 1;
    if (result.volumeBoosterSettings.eq) {
      settings.eq = result.volumeBoosterSettings.eq;
    }
  }
});