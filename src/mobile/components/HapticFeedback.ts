// Haptic Feedback helper for mobile controllers

export const triggerHaptic = (pattern: number | number[] = 30) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
};

export const hapticPatterns = {
  tap: 25,
  success: [40, 60, 40],
  error: [80, 40, 80],
  diceRoll: [20, 30, 20, 30, 50],
  buzzer: 60,
  cardPlay: 35,
};
