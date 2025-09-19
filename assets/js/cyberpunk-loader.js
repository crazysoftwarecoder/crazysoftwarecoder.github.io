class CyberpunkLoader {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');
    this.phases = [
      { id: 'phase-1', text: '► Scanning neural pathways...', duration: 800 },
      { id: 'phase-2', text: '► Decrypting data streams...', duration: 1000 },
      { id: 'phase-3', text: '► Establishing connection...', duration: 900 },
      { id: 'phase-4', text: '► Loading interface...', duration: 700 },
      { id: 'phase-5', text: '► Welcome to the system.', duration: 600 }
    ];

    this.currentPhase = 0;
    this.progress = 0;
    this.isFirstLoad = this.checkFirstLoad();

    this.init();
  }

  checkFirstLoad() {
    // Check if this is the first load using sessionStorage
    const hasLoaded = sessionStorage.getItem('cyberpunk-loaded');
    if (!hasLoaded) {
      sessionStorage.setItem('cyberpunk-loaded', 'true');
      return true;
    }
    return false;
  }

  init() {
    // Only show loading screen on first page load
    if (!this.isFirstLoad) {
      this.hideLoader();
      return;
    }

    // Hide the main content initially
    document.body.style.overflow = 'hidden';

    // Start the loading sequence after a short delay
    setTimeout(() => {
      this.startLoading();
    }, 500);
  }

  startLoading() {
    this.runPhase(0);
  }

  runPhase(phaseIndex) {
    if (phaseIndex >= this.phases.length) {
      this.completeLoading();
      return;
    }

    const phase = this.phases[phaseIndex];
    const phaseElement = document.getElementById(phase.id);

    // Activate current phase
    phaseElement.classList.add('active');

    // Calculate progress
    const progressIncrement = 100 / this.phases.length;
    const targetProgress = (phaseIndex + 1) * progressIncrement;

    // Animate progress bar
    this.animateProgress(this.progress, targetProgress, phase.duration);

    // Complete phase after duration
    setTimeout(() => {
      phaseElement.classList.remove('active');
      phaseElement.classList.add('completed');
      this.progress = targetProgress;
      this.runPhase(phaseIndex + 1);
    }, phase.duration);
  }

  animateProgress(startProgress, endProgress, duration) {
    const startTime = performance.now();
    const progressDiff = endProgress - startProgress;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentProgress = startProgress + (progressDiff * easeOutCubic);

      this.updateProgress(currentProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  updateProgress(progress) {
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${Math.round(progress)}%`;
  }

  completeLoading() {
    // Final progress update
    this.updateProgress(100);

    // Wait a moment, then fade out
    setTimeout(() => {
      this.fadeOut();
    }, 800);
  }

  fadeOut() {
    this.loadingScreen.classList.add('fade-out');

    // Remove loading screen after fade animation
    setTimeout(() => {
      this.hideLoader();
    }, 800);
  }

  hideLoader() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'none';
    }
    document.body.style.overflow = '';

    // Trigger any post-load animations or effects
    this.triggerPostLoadEffects();
  }

  triggerPostLoadEffects() {
    // Add a subtle entrance animation to the main content
    const mainContent = document.getElementById('main');
    if (mainContent) {
      mainContent.style.opacity = '0';
      mainContent.style.transform = 'translateY(20px)';

      // Animate in
      setTimeout(() => {
        mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
      }, 100);
    }

    // Trigger duck animation if on home page
    const duck = document.getElementById('rubber-duck');
    if (duck) {
      setTimeout(() => {
        duck.style.animation = 'duckBounce 0.8s ease-out';
      }, 600);
    }
  }

  // Force show loader (for testing or manual triggers)
  static forceShow() {
    sessionStorage.removeItem('cyberpunk-loaded');
    location.reload();
  }
}

// Auto-start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CyberpunkLoader();
});

// Add some console easter eggs for cyberpunk theme
console.log('%c► NEURAL LINK ESTABLISHED', 'color: #00ffff; font-size: 16px; font-weight: bold;');
console.log('%c► Welcome to the matrix, fellow hacker', 'color: #ff00ff; font-size: 12px;');
console.log('%c► Type CyberpunkLoader.forceShow() to see the loading screen again', 'color: #00ff00; font-size: 10px;');