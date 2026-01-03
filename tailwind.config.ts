import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'industrial': {
          dark: '#0a0a0f',
          metal: '#1a1a2e',
          accent: '#00aaff',
        },
      },
    },
  },
  plugins: [],
};

export default config;
