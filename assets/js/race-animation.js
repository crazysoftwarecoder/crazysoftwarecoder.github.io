// Rubber Duck Animation
class DuckAnimation {
  constructor() {
    this.duck = document.getElementById('rubber-duck');
    this.balloon = document.getElementById('duck-speech-balloon');
    this.latestPostsSection = document.getElementById('latest-posts');
    this.isIntersecting = false;
    this.animationEnabled = true;

    this.init();
  }

  init() {
    if (!this.duck || !this.latestPostsSection) return;

    this.setupIntersectionObserver();
    this.setupScrollListener();
    this.addInteractivity();
    this.setupBalloonBehavior();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isIntersecting = entry.isIntersecting;
        this.updateAnimationBehavior();
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(this.latestPostsSection);
  }

  setupScrollListener() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  handleScroll() {
    if (!this.animationEnabled) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollProgress = scrollY / (documentHeight - viewportHeight);

    // Add bobbing animation when user scrolls
    if (scrollProgress > 0.2) {
      this.duck.classList.add('bobbing');
    } else {
      this.duck.classList.remove('bobbing');
    }
  }

  updateAnimationBehavior() {
    if (this.isIntersecting) {
      // When latest posts are visible, speed up the duck
      this.duck.style.animationDuration = '20s';
      this.duck.classList.add('bobbing');
    } else {
      // Default speed
      this.duck.style.animationDuration = '30s';
      this.duck.classList.remove('bobbing');
    }
  }

  addInteractivity() {
    // Duck interactions
    this.duck.addEventListener('mouseenter', () => {
      this.duck.style.animationPlayState = 'paused';
      this.duck.style.transform = 'scale(1.2) rotate(10deg)';
      this.showBalloon();
    });

    this.duck.addEventListener('mouseleave', () => {
      if (this.animationEnabled) {
        this.duck.style.animationPlayState = 'running';
      }
      this.duck.style.transform = '';
      this.hideBalloon();
    });

    this.duck.addEventListener('click', () => {
      this.makeSound();
      this.toggleAnimation();
    });

    // Double-click to reset position
    this.duck.addEventListener('dblclick', () => {
      this.resetDuckPosition();
    });
  }

  makeSound() {
    // Play quack sound from assets/music
    try {
      const audio = new Audio('/assets/music/duck_quack.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio creation failed:', e);
    }

    // Visual feedback for "quack"
    const originalSize = this.duck.style.transform;
    this.duck.style.transform = 'scale(1.3) rotate(-15deg)';

    setTimeout(() => {
      this.duck.style.transform = originalSize;
    }, 200);

    // Add a temporary "quack" indicator
    const quack = document.createElement('div');
    quack.textContent = '🦆 Quack!';
    quack.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1001;
      animation: fadeInOut 1.5s ease-out forwards;
    `;

    // Add fadeInOut animation if it doesn't exist
    if (!document.querySelector('#duck-quack-styles')) {
      const style = document.createElement('style');
      style.id = 'duck-quack-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          50% { opacity: 1; transform: translateX(-50%) translateY(-5px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-15px); }
        }
      `;
      document.head.appendChild(style);
    }

    this.duck.appendChild(quack);
    setTimeout(() => quack.remove(), 1500);
  }

  toggleAnimation() {
    this.animationEnabled = !this.animationEnabled;

    if (this.animationEnabled) {
      this.duck.style.animationPlayState = 'running';
      this.duck.classList.remove('paused');
    } else {
      this.duck.style.animationPlayState = 'paused';
      this.duck.classList.add('paused');
    }
  }

  resetDuckPosition() {
    // Temporarily stop animation and reset to start
    this.duck.style.animation = 'none';
    this.duck.style.bottom = '80px';
    this.duck.style.left = '50px';
    this.duck.style.transform = 'translateX(0) rotate(0deg)';

    // Restart animation after a brief moment
    setTimeout(() => {
      this.duck.style.animation = 'duckFloat 30s ease-in-out infinite';
      if (this.duck.classList.contains('bobbing')) {
        this.duck.style.animation += ', duckBob 2s ease-in-out infinite';
      }
    }, 100);
  }

  // Method to dynamically update animation paths based on page layout
  updateAnimationPaths() {
    const latestPostsRect = this.latestPostsSection.getBoundingClientRect();
    const footerElement = document.querySelector('.wrapper-footer');
    const footerRect = footerElement ? footerElement.getBoundingClientRect() : null;

    // Create dynamic keyframes based on actual positions
    const style = document.createElement('style');
    style.id = 'duck-dynamic-animation';
    style.textContent = `
      @keyframes duckFloatDynamic {
        0% {
          bottom: ${footerRect ? window.innerHeight - footerRect.top + 20 : 80}px;
          transform: translateX(0) rotate(0deg);
        }
        25% {
          bottom: ${window.innerHeight - latestPostsRect.bottom + 100}px;
          transform: translateX(${window.innerWidth * 0.3}px) rotate(-5deg);
        }
        50% {
          bottom: ${window.innerHeight - latestPostsRect.top + 50}px;
          transform: translateX(${window.innerWidth * 0.6}px) rotate(3deg);
        }
        75% {
          bottom: ${window.innerHeight - latestPostsRect.bottom + 80}px;
          transform: translateX(${window.innerWidth * 0.8}px) rotate(-2deg);
        }
        100% {
          bottom: ${footerRect ? window.innerHeight - footerRect.top + 20 : 80}px;
          transform: translateX(${window.innerWidth - 150}px) rotate(0deg);
        }
      }
    `;

    // Remove existing dynamic style if it exists
    const existingStyle = document.getElementById('duck-dynamic-animation');
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    // Apply the dynamic animation
    this.duck.style.animation = 'duckFloatDynamic 30s ease-in-out infinite';
    if (this.duck.classList.contains('bobbing')) {
      this.duck.style.animation += ', duckBob 2s ease-in-out infinite';
    }
  }
}

// Initialize when DOM is loaded - only on home page
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the home page and duck exists
  const duck = document.getElementById('rubber-duck');
  if (duck) {
    const duckAnimation = new DuckAnimation();

    // Update paths when window is resized
    window.addEventListener('resize', () => {
      setTimeout(() => duckAnimation.updateAnimationPaths(), 100);
    });
  }
});

// Add the balloon behavior methods to the DuckAnimation class
DuckAnimation.prototype.setupBalloonBehavior = function() {
  if (!this.balloon) return;

  // Show balloon briefly when duck first appears, then hide it
  setTimeout(() => {
    this.showBalloon();
    setTimeout(() => {
      this.hideBalloon();
    }, 3000); // Show for 3 seconds initially
  }, 1000); // Wait 1 second after page load
};

DuckAnimation.prototype.showBalloon = function() {
  if (this.balloon) {
    this.balloon.classList.add('show');
  }
};

DuckAnimation.prototype.hideBalloon = function() {
  if (this.balloon) {
    this.balloon.classList.remove('show');
  }
};