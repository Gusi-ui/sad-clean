import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/favicon.svg' }],
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#3b82f6' }],
  },
};
// no newline
