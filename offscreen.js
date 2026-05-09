// offscreen.js
let audioContext = null;
let source = null;
let gainNode = null;
let biquadFilters = {};
let stream = null;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'start':
      try {
        const constraints = {
          audio: {
            mandatory: {
              chromeMediaSource: 'tab',
              chromeMediaSourceId: message.streamId
            }
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        audioContext = new AudioContext();

        gainNode = audioContext.createGain();

        biquadFilters.bass = audioContext.createBiquadFilter();
        biquadFilters.bass.type = 'lowshelf';
        biquadFilters.bass.frequency.value = 60;

        biquadFilters.mid = audioContext.createBiquadFilter();
        biquadFilters.mid.type = 'peaking';
        biquadFilters.mid.frequency.value = 1000;
        biquadFilters.mid.Q.value = 1;

        biquadFilters.treble = audioContext.createBiquadFilter();
        biquadFilters.treble.type = 'highshelf';
        biquadFilters.treble.frequency.value = 10000;

        source = audioContext.createMediaStreamSource(stream);
        source.connect(biquadFilters.bass);
        biquadFilters.bass.connect(biquadFilters.mid);
        biquadFilters.mid.connect(biquadFilters.treble);
        biquadFilters.treble.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Apply settings
        gainNode.gain.value = message.settings.gain;
        biquadFilters.bass.gain.value = message.settings.eq.bass;
        biquadFilters.mid.gain.value = message.settings.eq.mid;
        biquadFilters.treble.gain.value = message.settings.eq.treble;

        console.log('Audio processing started in offscreen');
      } catch (error) {
        console.error('Error in offscreen start:', error);
      }
      break;
    case 'stop':
      if (source) {
        source.disconnect();
        source = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      if (audioContext) {
        await audioContext.close();
        audioContext = null;
      }
      console.log('Audio processing stopped in offscreen');
      break;
    case 'updateGain':
      if (gainNode) {
        gainNode.gain.value = message.value;
      }
      break;
    case 'updateEQ':
      if (biquadFilters[message.band]) {
        biquadFilters[message.band].gain.value = message.value;
      }
      break;
  }
});