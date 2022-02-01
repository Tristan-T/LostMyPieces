const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
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
      'test': "#ad846c"
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
