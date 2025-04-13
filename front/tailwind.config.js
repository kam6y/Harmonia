/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ['var(--font-geist-sans)'], // ✅ カスタムフォントを追加
        geistMono: ['var(--font-geist-mono)'],
      },
      colors: {
        brand: {
          darkBlue: '#004259',
          teal: '#178394',
          cyan: '#00A3B3',
          orange: '#F29759',
          coral: '#FC7F7A',
          lightGray: '#F1F4F5',
        },
      },
      fontFamily: {
        jost: 'var(--font-jost)', // JostフォントをTailwindで使用
      },
    },
  },
  plugins: [],
  darkMode: 'media',
};