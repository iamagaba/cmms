// src/theme/animations.ts
// Professional reusable animation utilities for Ant Design CMMS

export const animations = {
  // Smooth scale on hover
  scaleHover: {
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },

  // Fade in with slide up
  fadeInUp: {
    animation: 'fadeInUp 0.5s ease-out',
    '@keyframes fadeInUp': {
      from: {
        opacity: 0,
        transform: 'translateY(20px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },

  // Pulse effect for important elements
  pulse: {
    animation: 'pulse 2s ease-in-out infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
  },
};
