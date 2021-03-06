const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      orange: colors.orange,
      red: colors.red,
      sky: colors.sky,
      blue: colors.blue,
      teal: colors.teal,
      slate: colors.slate,
      neutral: colors.neutral,
      zinc: colors.zinc,
      stone: colors.stone,
      'pannel-dark': {
        light: "#0e0e10",
        dark: "#0C0C10",
        DEFAULT: "#ECECF4"
      },
      'pannel-light': {
        light: "#FFFFFF",
        dark: "#121214",
        DEFAULT: "#FFFFFF"
      },
      'pannel-blue': {
        light: "#8121ff",
        dark: "#8121ff",
        DEFAULT: "#8121ff"
      },
      'pannel-back': {
        light: "#F8F8FE",
        dark: "#1C1C20",
        DEFAULT: "#F8F8FE"
      },
      'text': {
        light: "#FFFFFF",
        dark: "#0C0C10",
        DEFAULT: "#FFFFFF"
      },
    },
    borderWidth: {
      DEFAULT: '1px',      
      '0': '0',      
      '2': '2px',      
      '3': '3px',      
      '4': '4px',      
      '6': '6px',      
      '8': '8px',
      'thin': '0.1vw'
    }
  },
  plugins: [],
}
