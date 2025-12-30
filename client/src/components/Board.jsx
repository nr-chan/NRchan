import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { links, boardList, API_URL, bannerImg, formatText, formatDate, getFileSize, DynamicColorText, GetVoteCount, STATIC_URL } from '../Defs'
import ThreadImage from './Image'
import { VoteCount } from './Votes'
import Cookie from './Cookie'
import Cookies from "js-cookie";
import { Turnstile } from '@marsidev/react-turnstile'
import NRCButton from './NRCButton';

export default function Board() {
  const nav = useNavigate()
  const { id } = useParams()
  const [threads, setThreads] = useState([])
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)
  const [name, setName] = useState('Anon')
  const [subject, setSubject] = useState(null)
  const [comment, setComment] = useState(null)
  const [banner, setBanner] = useState(null)
  const [token, setToken] = useState('')
  const [uuid, setuuid] = useState(localStorage.getItem('uuid'));
  const [collapsedThreads, setCollapsedThreads] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const threadsPerPage = 5
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const fetchThreads = async () => {
    const response = await fetch(`${API_URL}/board/${id}`)
    const json = await response.json()
    if (response.status !== 200 || !boardList.includes(id)) {
      nav('/404')
    }
    setThreads(json.data)
  }

  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        setFile(file)
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
        }
        break
      }
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleLockThread = async (threadId) => {
    try {
      const response = await fetch(`${API_URL}/admin/lock/${threadId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchThreads()
      } else {
        console.error('Failed to toggle lock status')
      }
    } catch (error) {
      console.error('Error toggling lock status:', error)
    }
  }

  const handlePinThread = async (threadId) => {
    try {
      setLoadingScreen(true);
      const response = await fetch(`${API_URL}/admin/pin/${threadId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchThreads()
      } else {
        console.error('Failed to toggle pin status')
      }
    } catch (error) {
      console.error('Error toggling pin status:', error)
    } finally {

      setLoadingScreen(false);
    }
  }

  const createthread = async () => {
    if (!captchaToken) {
      alert('Please complete the captcha');
      return;
    }

    console.log(captchaToken)

    const formData = new FormData()

    if (!subject || !subject.trim()) {
      alert('Subject cannot be empty!')
      return
    }

    if (!comment || !comment.trim()) {
      alert('Content cannot be empty!')
      return
    }

    formData.append('username', name)
    formData.append('image', file)
    formData.append('board', id)
    formData.append('subject', subject)
    formData.append('content', comment)
    formData.append('captchaToken', captchaToken)

    try {
      setLoadingScreen(true);
      const response = await fetch(`${API_URL}/thread`, {
        method: 'POST',
        headers: {
          uuid: uuid
        },
        body: formData
      })

      if (response.status === 200) {
        setCaptchaToken(null);
        fetchThreads()
      } else {
        console.error('Error uploading file:', response.statusText)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoadingScreen(false);
    }
  }

  const getuuid = async () => {
    if (!uuid) {
      const response = await fetch(`${API_URL}/getuuid`);
      const json = await response.json()
      localStorage.setItem('uuid', json.data);
      setuuid(json.data);
    }
  }

  const toggleThreadCollapse = (threadId) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [threadId]: !prev[threadId]
    }))
  }

  useEffect(() => {
    getuuid();
    fetchThreads()
    setToken(localStorage.getItem('nrtoken'))
    const hasAgreed = Cookies.get("agreedToRules");

    // If no cookie is set, show the disclaimer
    if (!hasAgreed) {
      setShowDisclaimer(true);
    }
    if (!banner) {
      setBanner(bannerImg[Math.floor(Math.random() * bannerImg.length)])
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [id])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(threads.length / threadsPerPage)) {
      setCurrentPage(page)
    }
  }

  const totalPages = Math.ceil(threads.length / threadsPerPage)
  const currentThreads = threads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  )
  const handleAgree = () => {
    setShowDisclaimer(false); // Close disclaimer when user agrees
  };


  return (
  <div>
    {loadingScreen && (
      <div className="fixed top-0 z-50 flex items-center justify-center w-full h-full bg-black opacity-50">
        <img
          src="https://raw.githubusercontent.com/gist/Unic-X/4d03e1c856c94e613826d662a067d7e8/raw/7e777de663b31e71235b175e6cebfbe456a25b9e/load.svg"
          alt="Loading..."
          className="w-20 h-20 animate-spin"
        />
      </div>
    )}

    <div className="pb-8 min-h-screen font-sans text-[10px]
      bg-[var(--color-background)]
      text-[var(--color-text)]"
    >
      {showDisclaimer && <Cookie onAgree={handleAgree} />}

      {/* Banner */}
      <div className="my-2 text-center">
        <img
          src={`${STATIC_URL}/${banner}.png`}
          alt="Board banner"
          className="inline-block border border-[var(--color-border)]"
        />
        <hr className="my-4 border-[var(--color-border)]" />
      </div>

      {/* Board Title */}
      <h1 className="mt-2 text-4xl font-bold text-center text-[var(--color-primary)]">
        /{id}/ - {links[boardList.indexOf(id)]}
      </h1>

      {/* Post Form */}
      <div className="p-2 my-4 mx-auto border max-w-[468px]
        bg-[var(--color-backgroundSecondary)]
        border-[var(--color-border)]"
      >
        <table className="w-full">
          <tbody>
            <tr>
              <td className="bg-[var(--color-headerAlt)]">Name</td>
              <td>
                <input
                  type="text"
                  defaultValue="Anon"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border
                    bg-[var(--color-backgroundSecondary)]
                    border-[var(--color-borderThin)]"
                />
              </td>
            </tr>

            <tr>
              <td className="bg-[var(--color-headerAlt)]">Subject</td>
              <td>
                <input
                  type="text"
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border
                    bg-[var(--color-backgroundSecondary)]
                    border-[var(--color-borderThin)]"
                />
              </td>
            </tr>

            <tr>
              <td className="bg-[var(--color-headerAlt)]">Comment</td>
              <td>
                <textarea
                  className="w-full h-24 border
                    bg-[var(--color-backgroundSecondary)]
                    border-[var(--color-borderThin)]"
                  onChange={(e) => setComment(e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td className="bg-[var(--color-headerAlt)]">File</td>
              <td>
                <input
                  type="file"
                  className="px-2"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {file && (
                  <span className="ml-2">Selected: {file.name}</span>
                )}
              </td>
            </tr>

            <tr>
              <td className="bg-[var(--color-headerAlt)]"></td>
              <td>
                <div className="py-2 px-2">
                  <Turnstile
                    options={{ theme: 'light' }}
                    siteKey={import.meta.env.VITE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setCaptchaToken(null)}
                  />
                  <NRCButton
                    label="Post"
                      bgColor='var(--color-headerAlt)'
                      borderColor='var(--color-border)'
                    addClass="px-2 py-1"
                    onClick={createthread}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-4 border-[var(--color-border)]" />

      {/* Threads */}
      <div className="mx-auto max-w-[768px]">
        {currentThreads.map((thread) => (
          <div key={thread.id} className="mb-4">
            <article className="p-2 border
              bg-[var(--color-backgroundSecondary)]
              border-[var(--color-borderThin)]"
            >
              {collapsedThreads[thread.id] ? (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => toggleThreadCollapse(thread.id)}
                    className="font-bold text-[var(--color-primary)]"
                  >
                    <img
                      alt="H"
                      className="extButton threadHideButton"
                      src={`${STATIC_URL}/plus.png`}
                    />
                  </button>

                  <span className="font-bold">
                    ThreadID: {thread.id}
                  </span>

                  <VoteCount threadID={thread.id} />

                  {thread.image && (
                    <span>
                      ({getFileSize(thread.image.size)},{' '}
                      {thread.image.width}x{thread.image.height})
                    </span>
                  )}

                  {thread.locked && (
                    <img src="/closed.png" alt="Locked" className="w-4 h-4" />
                  )}
                  {thread.sticky && (
                    <img src="/sticky.gif" alt="Pinned" className="w-4 h-4" />
                  )}

                  {token && (
                    <>
                      <NRCButton
                        label={thread.locked ? 'Unlock' : 'Lock'}
                        addClass="font-bold mb-2"
                        bgColor='var(--color-headerAlt)'
                      borderColor='var(--color-border)'
                        onClick={() => handleLockThread(thread.id)}
                      />
                      <NRCButton
                        label={thread.sticky ? 'Unpin' : 'Pin'}
                        addClass="font-bold mb-2"
                        onClick={() => handlePinThread(thread.id)}
                      />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 items-center mb-2">
                    <button
                      onClick={() => toggleThreadCollapse(thread.id)}
                      className="font-bold text-[var(--color-primary)]"
                    >
                      <img
                        alt="H"
                        className="extButton threadHideButton"
                        src={`${STATIC_URL}/minus.png`}
                      />
                    </button>

                    <span className="font-bold">
                      ThreadID: {thread.id}
                    </span>

                    <VoteCount threadID={thread.id} />

                    {thread.image && (
                      <span>
                        ({getFileSize(thread.image.size)},{' '}
                        {thread.image.width}x{thread.image.height})
                      </span>
                    )}

                    {thread.locked && (
                      <img src="/closed.png" alt="Locked" className="w-4 h-4" />
                    )}
                    {thread.sticky && (
                      <img src="/sticky.gif" alt="Pinned" className="w-4 h-4" />
                    )}

                    {token && (
                      <>
                        <NRCButton
                          label={thread.locked ? 'Unlock' : 'Lock'}
                          addClass="font-bold mb-2"
                          bgColor='var(--color-headerAlt)'
                          borderColor='var(--color-border)'
                          onClick={() => handleLockThread(thread.id)}
                        />
                        <NRCButton
                          label={thread.sticky ? 'Unpin' : 'Pin'}
                          addClass="font-bold mb-2"
                          bgColor='var(--color-headerAlt)'
                          borderColor='var(--color-border)'
                          onClick={() => handlePinThread(thread.id)}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-start mb-2">
                    {thread.image && thread.image.url.endsWith('.mp4') ? (
                      <div className="mr-4 max-w-[150px]">
                        <video controls className="w-full h-auto border">
                          <source src={thread.image.url} type="video/mp4" />
                        </video>
                      </div>
                    ) : (
                      thread.image && (
                        <div className="mr-4">
                          <ThreadImage allowExpand={false} imageData={thread.image} />
                        </div>
                      )
                    )}

                    <div>
                      <span className="font-bold text-[var(--color-success)]">
                        {thread.username || 'Anon'}{' '}
                      </span>
                      <DynamicColorText posterID={thread.poster_id || 'FFFFFF'} />
                      <span className="ml-1 text-[var(--color-textSecondary)]">
                        {formatDate(thread.created_at)}
                      </span>
                      <br />
                      To view complete thread{' '}
                      <a href={`/thread/${thread.id}`}>
                        <NRCButton 
                          bgColor='var(--color-headerAlt)'
                          borderColor='var(--color-border)'
                          label="Click here" />
                      </a>
                    </div>
                  </div>

                  <h2 className="mt-2 font-bold">
                    {thread.subject}
                  </h2>
                  <p className="mt-2">{formatText(thread.content)}</p>

                  {/* Replies preview */}
                  <div className="mt-4">
                    {thread.replies &&
                      thread.replies.slice(-3).map((reply) => (
                        <div
                          key={reply.id}
                          className="p-2 mb-2 border border-[var(--color-borderThin)]"
                        >
                          <span className="text-gray-400 text-[1.25rem]">{'>> '}</span>
                          <span className="font-bold text-[var(--color-success)]">
                            {reply.username || 'Anon'}{' '}
                          </span>
                          <DynamicColorText posterID={reply.poster_id || 'FFFFFF'} />
                          <span className="ml-1 text-[var(--color-textSecondary)]">
                            {formatDate(reply.created_at)}
                          </span>

                          {reply.image && (
                            <div className="mt-2">
                              {reply.image.url.endsWith('.mp4') ? (
                                <div className="mr-4 max-w-[150px]">
                                  <video controls className="w-full h-auto border">
                                    <source src={reply.image.url} type="video/mp4" />
                                  </video>
                                </div>
                              ) : (
                                <ThreadImage
                                  imageData={reply.image}
                                  allowExpand={false}
                                />
                              )}
                            </div>
                          )}

                          <p className="mt-2">
                            {formatText(reply.content)}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </article>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 border
              bg-[var(--color-backgroundSecondary)]
              border-[var(--color-border)]
              disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 mx-1 border ${
                currentPage === i + 1
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-backgroundSecondary)] border-[var(--color-border)]'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 border
              bg-[var(--color-backgroundSecondary)]
              border-[var(--color-border)]
              disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>
)

}
