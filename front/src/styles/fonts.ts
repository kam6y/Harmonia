import localFont from 'next/font/local';

export const jost = localFont({
  src: [
    {
      path: '../../public/fonts/Jost-VariableFont_wght.ttf',
      weight: '100 900', // 可変フォントの重み範囲
      style: 'normal',
    },
  ],
  variable: '--font-jost', // Tailwindで使うためのカスタム変数
});