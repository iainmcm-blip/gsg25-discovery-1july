/* GSG25 Discovery — Tailwind (Play CDN) config */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        green:   '#8EC640',
        sky:     '#29ABE2',
        deep:    '#145DAB',
        orange:  '#F89821',
        red:     '#E41F27',
        ink:     '#0E1B2C',
        navy:    '#0B1730',
        surface: '#F6F8FB',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose2: '68ch',
      },
      letterSpacing: {
        tightish: '-0.02em',
      },
    },
  },
};
