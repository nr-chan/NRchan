export const boardList = ['p', 'mm', 'v', 'c', 'incel', 'sp', 'ph', 'm', 'f', 'ps', 'ka', 'np', 'gif', 'rnt', 'nz4l', 'ca','b']

export const links = [
  'Programming',
  'Meth-Math',
  'Video Games',
  'Cricket',
  'Incel',
  'Sports',
  'Photography',
  'Music',
  'Food',
  'Penis',
  'Khoobsurat Aurate',
  'Nasha Paani',
  'GIF',
  'Rant',
  'Goon HQ',
  'Crypto-Anarchism',
  'Raand'
]

export const bannerImg = ['fumo', 'lurking', 'joint', 'bhabha', 'gentooo','mrgarlic','soy','agatha','criket','femi','lebran','opisgay','sports',
                          'anime', 'kanojo', 'pakisporty', 'touhou', 'bitches', 'statue', 'dollar', 'reaw', 'bunker'
]

export const API_URL = import.meta.env.VITE_API_URL
export const STATIC_URL = import.meta.env.VITE_STATIC_URL


export const fetchThreads = async () => {
  const response = await fetch(`${API_URL}/thread/${id}`)
  const data = await response.json()
  setThreadData(data)
}

export const formatDate = (dateString) => {
  try {
    const now = new Date()
    const past = new Date(dateString)
    const diff = now - past // Difference in milliseconds

    // Time units in milliseconds
    const msInMinute = 60 * 1000
    const msInHour = 60 * msInMinute
    const msInDay = 24 * msInHour
    const msInWeek = 7 * msInDay
    const msInMonth = 30 * msInDay

    if (diff < msInMinute) {
      const seconds = Math.floor(diff / 1000)
      return `${seconds} seconds ago`
    } else if (diff < msInHour) {
      const minutes = Math.floor(diff / msInMinute)
      return `${minutes} minutes ago`
    } else if (diff < msInDay) {
      const hours = Math.floor(diff / msInHour)
      return `${hours} hours ago`
    } else if (diff < msInWeek) {
      const days = Math.floor(diff / msInDay)
      return `${days} days ago`
    } else if (diff < msInMonth) {
      const weeks = Math.floor(diff / msInWeek)
      return `${weeks} weeks ago`
    } else {
      const months = Math.floor(diff / msInMonth)
      return `${months} months ago`
    }
  } catch {
    return dateString
  }
}

export const formatText = (content) => {
  if (!content) return null

  const parts = content.split(/```/)

  return parts.map((part, index) => {
    // Handle code blocks (odd indexes)
    if (index % 2 === 1) {
      if (parts.length % 2 === 0 && index === parts.length - 1) {
        part = '```' + part
        return <span key={index}>{part}</span>
      }
      return (
        <code
          key={index}
          className='block bg-gray-800 text-white rounded-md p-2'
        >
          {part}
        </code>
      )
    }

    // Handle regular text (even indexes)
    return part.split('\n').map((line, lineIndex) => {
      if (line.trim().startsWith('>')) {
        return (
          <span key={`${index}-${lineIndex}`} style={{ color: '#789922' }}>
            {line}
            <br />
          </span>
        )
      } else {
        return (
          <span key={`${index}-${lineIndex}`}>
            {line}
            <br />
          </span>
        )
      }
    })
  })
}

export const getSmallImageUrl = (url) => {
  const lastDotIndex = url.lastIndexOf('.')
  return `${url.substring(0, lastDotIndex)}${url.substring(lastDotIndex)}`
}

export const getFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function normalizeToHex(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Convert the hash to a hex string and extract the last 6 characters
  const hex = (hash & 0xFFFFFF).toString(16).toUpperCase();
  return hex.padStart(6, '0'); // Ensure it's always 6 characters
}

function calculateTextColor(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 128 ? 'black' : 'white';
}

export function DynamicColorText({ posterID }) {
  let hex = normalizeToHex(posterID)

  const bgColor = `#${hex}`;

  const textColor = calculateTextColor(hex);
    
  return (
    <span
      className="font-bold px-1 rounded"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {posterID}
    </span>
  );
}

export async function UpdateCount(up, threadID) {
  const response = await fetch(`${API_URL}/votes/${threadID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      up,
      'uuid': localStorage.getItem('uuid'),
    })
  });
}

export async function GetVoteCount(threadID) {
  const response = await fetch(`${API_URL}/votes/${threadID}`, {
    method: 'GET'
  })
  const respJson = await response.json();
  return respJson.data;
}
