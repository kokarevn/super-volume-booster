// popup.js
class VolumeBooster {
  constructor() {
    this.isActive = false;
    this.initializeElements();
    this.loadSettings();
    this.setupEventListeners();
    this.getCurrentStatus();
  }

  initializeElements() {
    this.volumeBoost = document.getElementById('volumeBoost');
    this.boostValue = document.getElementById('boostValue');
    this.toggleBoost = document.getElementById('toggleBoost');
    this.status = document.getElementById('status');

    this.eqSliders = document.querySelectorAll('.eq-slider');
    this.bassValue = document.getElementById('bassValue');
    this.midValue = document.getElementById('midValue');
    this.trebleValue = document.getElementById('trebleValue');
  }

  setupEventListeners() {
    this.volumeBoost.addEventListener('input', () => {
      const value = this.volumeBoost.value;
      this.boostValue.textContent = value + '%';
      this.sendMessage({type: 'updateGain', value: parseInt(value) / 100});
      this.saveSettings();
    });

    this.toggleBoost.addEventListener('click', () => {
      this.toggleAudioProcessing();
    });

    this.eqSliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        this.updateEQDisplay(e.target);
        this.sendMessage({type: 'updateEQ', band: e.target.dataset.band, value: parseInt(e.target.value)});
        this.saveSettings();
      });
    });

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyEQPreset(e.target.dataset.preset);
      });
    });
  }

  async toggleAudioProcessing() {
    const newActive = !this.isActive;
    this.sendMessage({type: 'toggle', active: newActive});
    this.isActive = newActive;
    this.updateUI();
  }

  updateEQDisplay(slider) {
    const band = slider.dataset.band;
    const value = parseInt(slider.value);
    document.getElementById(band + 'Value').textContent = value + 'dB';
  }

  applyEQPreset(preset) {
    const presets = {
      bass: { bass: 12, mid: 0, treble: -5 },
      treble: { bass: -5, mid: 0, treble: 12 },
      rock: { bass: 8, mid: 5, treble: 8 },
      flat: { bass: 0, mid: 0, treble: 0 }
    };

    const presetValues = presets[preset];
    if (!presetValues) return;

    Object.keys(presetValues).forEach(band => {
      const slider = document.querySelector(`.eq-slider[data-band="${band}"]`);
      if (slider) {
        slider.value = presetValues[band];
        this.updateEQDisplay(slider);
        this.sendMessage({type: 'updateEQ', band, value: presetValues[band]});
      }
    });

    this.saveSettings();
  }

  updateUI() {
    if (this.isActive) {
      this.toggleBoost.textContent = 'Выключить усиление';
      this.status.textContent = '🟢 Усиление активно';
      this.status.className = 'status active';
    } else {
      this.toggleBoost.textContent = 'Включить усиление';
      this.status.textContent = '🔴 Усиление выключено';
      this.status.className = 'status inactive';
    }
  }

  saveSettings() {
    const settings = {
      volumeBoost: this.volumeBoost.value,
      eq: {
        bass: document.querySelector('[data-band="bass"]').value,
        mid: document.querySelector('[data-band="mid"]').value,
        treble: document.querySelector('[data-band="treble"]').value
      }
    };

    chrome.storage.local.set({ volumeBoosterSettings: settings });
  }

  loadSettings() {
    chrome.storage.local.get(['volumeBoosterSettings'], (result) => {
      if (result.volumeBoosterSettings) {
        const settings = result.volumeBoosterSettings;

        this.volumeBoost.value = settings.volumeBoost || 100;
        this.boostValue.textContent = this.volumeBoost.value + '%';

        if (settings.eq) {
          Object.keys(settings.eq).forEach(band => {
            const slider = document.querySelector(`[data-band="${band}"]`);
            if (slider) {
              slider.value = settings.eq[band];
              this.updateEQDisplay(slider);
            }
          });
        }
      }
    });
  }


  getCurrentStatus() {
    chrome.runtime.sendMessage({type: 'getStatus'}, (response) => {
      if (response) {
        this.isActive = response.isActive;
        this.updateUI();
      }
    });
  }

  sendMessage(message) {
    chrome.runtime.sendMessage(message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VolumeBooster();
});
