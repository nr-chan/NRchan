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
   burichan: {
    name: 'Burichan',
    colors: {
      primary: '#D24C9F',
      secondary: '#D24C9F',

      background: '#ffe6f2be',
      backgroundSecondary: '#ffd4e8be',
      backgroundTertiary: '#fff0f8be',

      surface: '#ffffff',

      headerBg: '#D24C9F',
      headerAlt: '#FFC1DD',
      headerInfo: '#D24C9F',

      text: '#000000',
      textSecondary: '#7A003C',
      textMuted: '#555555',
      link: '#0000EE',

      borderThin: '#E0A8C8',
      border: '#A00050',

      success: '#2E8B57',
      error: '#B03030',
      warning: '#ef9940',
      info: '#D24C9F',
    },
  },

  yotsubaB: {
    name: 'Yotsuba B',
    colors: {
      primary: '#B03030',
      secondary: '#B03030',

      background: '#F0E0D6',
      backgroundSecondary: '#EEDACB',
      backgroundTertiary: '#FFF1E8',

      surface: '#ffffff',

      headerBg: '#B03030',
      headerAlt: '#FFD6C9',
      headerInfo: '#B03030',

      text: '#000000',
      textSecondary: '#800000',
      textMuted: '#555555',
      link: '#0000EE',

      borderThin: '#C8A89E',
      border: '#800000',

      success: '#117743',
      error: '#B03030',
      warning: '#ef9940',
      info: '#B03030',
    },
  },

  midnight: {
    name: 'Midnight',
    colors: {
      primary: '#9AB3FF',
      secondary: '#C5C8C6',

      background: '#0F0F12',
      backgroundSecondary: '#1A1C20',
      backgroundTertiary: '#25272C',

      surface: '#121317',

      headerBg: '#1E2030',
      headerAlt: '#4f67afec',
      headerInfo: '#9AB3FF',

      text: '#C5C8C6',
      textSecondary: '#9AA0A6',
      textMuted: '#777777',
      link: '#9AB3FF',

      borderThin: '#2E3240',
      border: '#3A3F5C',

      success: '#20b668',
      error: '#d33230',
      warning: '#ef9940',
      info: '#9AB3FF',
    },
  },
}

export const defaultTheme = 'default';