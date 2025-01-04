export const boardList = ['p', 'mm', 'v', 'c', 'a', 'Sp', 'Ph', 'm', 'f', 'par', 'ka', 'np', 'GIF', 'Rnt', 'pol', 'cs']

export const links = [
  'Programming',
  'Meth-Math',
  'Video Games',
  'Cricket',
  'Arambh',
  'Sports',
  'Photography',
  'Music',
  'Food',
  'Paranormal',
  'Khoobsurat Aurate',
  'Nasha Paani',
  'GIF',
  'Rant',
  'Politics',
  'CS Trends'
]

export const bannerImg = ['fumo', 'lurking', 'joint', 'bhabha']

export const API_URL = import.meta.env.VITE_API_URL

export const fetchThreads = async () => {
  const response = await fetch(`${API_URL}/thread/${id}`)
  const data = await response.json()
  console.log(data)
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
  return `${url.substring(0, lastDotIndex)}s${url.substring(lastDotIndex)}`
}

export const getFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
