// Main animation function
export const animateBubble = (
  start,
  end,
  startSize,
  endSize,
  onUpdate,
  onComplete
) => {
  const BUBBLE_SPEED = 400; // pixels per second
  const SIZE_TRANSITION_DURATION = 200; // Size transition happens in first 200ms

  // Calculate distance and total time based on speed
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const totalTime = (distance / BUBBLE_SPEED) * 1000; // convert to milliseconds

  let startTime = null;

  const animate = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;

    // Calculate movement progress (0 to 1)
    const moveProgress = Math.min(elapsedTime / totalTime, 1);

    // Calculate size progress (0 to 1) - complete in first SIZE_TRANSITION_DURATION ms
    const sizeProgress = Math.min(elapsedTime / SIZE_TRANSITION_DURATION, 1);

    // Calculate current position
    const currentX = start.x + dx * moveProgress;
    const currentY = start.y + dy * moveProgress;

    // Calculate current size - reaches final size quickly
    const currentSize = {
      width: startSize.width + (endSize.width - startSize.width) * sizeProgress,
      height:
        startSize.height + (endSize.height - startSize.height) * sizeProgress,
      fontSize: endSize.fontSize, // Use final font size immediately
    };

    onUpdate({ x: currentX, y: currentY }, currentSize);

    if (moveProgress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  };

  requestAnimationFrame(animate);
};
