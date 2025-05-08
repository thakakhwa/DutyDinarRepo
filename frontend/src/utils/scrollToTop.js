export function fastScrollToTop(duration = 700) {
  // Don't scroll if already at top
  if (window.pageYOffset === 0) return;
  
  const start = window.pageYOffset;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function scroll() {
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply cubic easing for smoother deceleration
    const easing = easeOutCubic(progress);
    
    // Use scrollTo with behavior: 'auto' for better performance
    window.scrollTo({
      top: Math.max(0, Math.floor(start * (1 - easing))),
      behavior: 'auto' // Using 'auto' instead of 'smooth' for custom easing
    });

    // Continue animation if not complete
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  // Use requestAnimationFrame for smoother animation
  requestAnimationFrame(scroll);
}