export const FLOW_CONSTANTS = {
  NODE_DIMENSIONS: {
    width: 260,
    height: 180,
    gap: 80,
  },
  CANVAS: {
    defaultHeight: 400, // Reduced height to fit nodes better
    minZoom: 0.4,
    maxZoom: 1.75,
    fitViewPadding: 0.1, // Less padding for better fit
  },
  ANIMATION_DURATIONS: {
    statusTransition: 300,
    ripple: 1300,
    ringOut: 1500,
    downgrade: 1500,
    scaleIn: 700,
    pop: 1100,
    pulseSlow: 1600,
  },
  COLORS: {
    status: {
      pending: '#f59e0b',
      partial: '#3b82f6',
      complete: '#10b981',
      error: '#ef4444',
    },
    node: {
      source: '#3b82f6',
      transform: '#8b5cf6',
      destination: '#10b981',
    },
    edge: {
      transformToDestination: '#be185d',
    },
  },
  RESPONSIVE: {
    verticalBreakpoint: 720,
  },
} as const;

export const HAPTIC_FEEDBACK = {
  light: 8,
  medium: 20,
  heavy: 50,
} as const;
