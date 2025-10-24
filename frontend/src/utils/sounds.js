// Som de digitação (gerado via Web Audio API)
class TypingSoundManager {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.intervalId = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTypingSound() {
    if (!this.audioContext) this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  startTyping() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.intervalId = setInterval(() => {
      this.playTypingSound();
    }, 150);
  }

  stopTyping() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const typingSound = new TypingSoundManager();