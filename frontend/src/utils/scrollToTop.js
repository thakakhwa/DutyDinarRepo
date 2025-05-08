export function fastScrollToTop(duration = 700) {
  const start = window.pageYOffset;
  const startTime = performance.now();

  function scroll() {
    const now = performance.now();
    const time = Math.min(1, (now - startTime) / duration);
    const timeFunction = time * (2 - time); // easeOutQuad
    window.scrollTo(0, Math.ceil(start * (1 - timeFunction)));

    if (time < 1) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
}
