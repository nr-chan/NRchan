// themes.js
export const themes = {
  default: {
    name: 'Default',
    colors: {
      /* Core */
      primary: '#d33230',          // persian-red
      secondary: '#d33230',        // havelock-blue

      /* Backgrounds */
      background: '#fcfaeb',       // citrine-white
      backgroundSecondary: '#f0e0d6', // mandys-pink
      backgroundTertiary: '#FFFFEE',  // classic board bg

      /* Surfaces */
      surface: '#ffffff',

      /* Headers / bars */
      headerBg: '#d32f2f',         // jaffa
      headerAlt: '#ffccaa',        // light peach
      headerInfo: '#60a2d8',       // havelock-blue

      /* Text */
      text: '#000000',
      textSecondary: '#800000',
      textMuted: '#666666',
      link: '#CC1105',             // blue

      /* Borders */
      borderThin: "#D9BFB7",
      border: '#8b2016',           // falu-red

      /* Status */
      success: '#117743',          // dark green
      error: '#d33230',            // persian-red
      warning: '#ef9940',          // jaffa
      info: '#60a2d8',             // havelock-blue
    },
  },

  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a2d8',          // havelock-blue
      secondary: '#ebebebff',

      background: '#1d1f21',
      backgroundSecondary: '#282a2e',
      backgroundTertiary: '#3b3b3bff',

      surface: '#181818',

      headerBg: '#535377',
      headerAlt: '#8986aaff',
      headerInfo: '#60a2d8',

      text: '#c5c8c6',
      textSecondary: '#cccccc',
      textMuted: '#999999',
      link: '#60a2d8',

      border: '#8986aaff',
      borderThin: "#666477ff",


      success: '#20b668ff',
      error: '#d33230',
      warning: '#ef9940',
      info: '#60a2d8',
    },
  },
}

export const defaultTheme = 'default';