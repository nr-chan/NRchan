import React, { useState, useEffect, useRef } from 'react'
import ThreadImage from './Image'
import { useNavigate, useParams } from 'react-router-dom'

import Cookie from './Cookie'
import Cookies from "js-cookie";
import { links, boardList, API_URL, bannerImg, formatDate, formatText, getFileSize, DynamicColorText, STATIC_URL } from '../Defs'
import { Turnstile } from '@marsidev/react-turnstile';
import NRCButton from './NRCButton';

export default function Component() {
  const { id } = useParams()
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)
  const [name, setName] = useState('Anon')
  const [comment, setComment] = useState(null)
  const [replyto, setReplyto] = useState(null)
  const [threadData, setThreadData] = useState({})
  const [sz, setSz] = useState(0)
  const [banner, setBanner] = useState(null)
  const [formVisible, setFormVisible] = useState(false)
  const [formPosition, setFormPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const nav = useNavigate()
  const [token, setToken] = useState('')
  const [uuid, setuuid] = useState(localStorage.getItem('uuid'));
  const [selectedPosts, setSelectedPosts] = useState(new Set())
  const [deletePassword, setDeletePassword] = useState('')
  const replyRefs = useRef({})
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null)
  const [loadingScreen, setLoadingScreen] = useState(false);

  const scrollToReply = (replyId) => {
    if (replyRefs.current[replyId]) {
      replyRefs.current[replyId].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const resize = () => {
    if (sz) {
      setSz(0)
    } else {
      setSz(100)
    }
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

  const handleStart = (e) => {
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    setDragOffset({
      x: clientX - formPosition.x,
      y: clientY - formPosition.y
    })
  }

  const handleMove = (e) => {
    if (isDragging) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      setFormPosition({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y
      })
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)

      // Touch events
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleEnd)
    }

    return () => {
      // Cleanup mouse events
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)

      // Cleanup touch events
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const createthread = async () => {
    if (!captchaToken) {
      alert('Please complete the captcha');
      return;
    }

    const formData = new FormData()
    formData.append('username', name)
    formData.append('image', file)
    formData.append('replyto', replyto)
    formData.append('content', comment)
    formData.append('captchaToken', captchaToken)
    try {
      setLoadingScreen(true);

      const response = await fetch(`${API_URL}/thread/${threadData.id}/reply`, {
        method: 'POST',
        headers: {
          uuid: uuid
        },
        body: formData
      })

      setLoadingScreen(false);
      if (response.status === 200) {
        console.log('File uploaded successfully')
        setFile(null);
        setCaptchaToken(null);
        fetchThreads()
        // Fetch resumes again after successful upload
      } else {
        console.error('Error uploading file:', response.statusText)
      }
    } catch (err) {
      console.error('Network error: ', err)

    } finally {
      setLoadingScreen(false);
    }

  }

  const deleteThread = async (threadID) => {
    if (!token) {
      alert('Login as an admin to delete a thread')
      return
    }
    try {
      setLoadingScreen(true);
      const resposne = await fetch(`${API_URL}/admin/thread/${threadID}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'bearer ' + token
        }
      })
      if (resposne.status === 200) {
        console.log('Thread deleted successfully')
        nav(-1)
      } else {
        const json = await resposne.json()
        console.log('Error deleting the thread', json)
      }
    } catch (err) {
      console.error('Network error: ', err);

    } finally {
      setLoadingScreen(false);
    }

  }
  const deleteReply = async (replyID) => {
    if (!token) {
      alert('Login as an admin to delete a reply')
      return
    }
    try {
      setLoadingScreen(true);
      const resposne = await fetch(`${API_URL}/admin/reply/${replyID}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'bearer ' + token
        }
      })
      if (resposne.status === 200) {
        console.log('Reply deleted successfully')
        fetchThreads()
      } else {
        const json = await resposne.json()
        console.error('Error deleting the reply', json)
      }
    } catch (err) {
      console.error('Network error: ', err);
    } finally {
      setLoadingScreen(false);
    }

  }


  const fetchThreads = async () => {
    try {
    const response = await fetch(`${API_URL}/thread/${id}`);
    const json = await response.json();

    if (!response.ok || !json?.status || !json?.data) {
      nav(-1);
      return;
    }

    setThreadData(json.data);
  } catch (e) {
    console.error('fetchThreads error:', e);
    nav(-1);
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
  const deleteThreadByUser = async (threadID) => {
    if (!uuid) {
      alert('Unable to delete thread: User UUID not found.');
      return;
    }
    try {
      setLoadingScreen(true);
      const response = await fetch(`${API_URL}/thread/${threadID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'uuid': uuid,
        },
      });
      if (response.status === 200) {
        console.log('Thread deleted successfully');
        fetchThreads();
      } else {
        const json = await response.json();
        console.error('Error deleting thread:', json.error);
      }
    } catch (err) {
      console.error('Error: ', err.message);
    } finally {
      setLoadingScreen(false);
    }
  }


  const deleteReplyByUser = async (replyID) => {
    if (!uuid) {
      alert('Unable to delete thread: User UUID not found.');
      return;
    }
    // console.log("UUID sent: ", uuid);
    try {
      setLoadingScreen(true);
      const response = await fetch(`${API_URL}/reply/${replyID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'uuid': uuid,
        },
      });
      if (response.status === 200) {
        console.log('Reply deleted successfully');
        fetchThreads();
      } else {
        const json = await response.json();
        console.error('Error deleting reply:', json.error);
      }
    } catch (err) {
      console.error('Error: ', err.message);
    } finally {
      setLoadingScreen(false);
    }
  }


  useEffect(() => {
    fetchThreads()
    getuuid();
    setToken(localStorage.getItem('nrtoken'))
  }, [])

  useEffect(() => {
    // If no cookie is set, show the disclaimer
    const hasAgreed = Cookies.get("agreedToRules");
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

  const handleCheckboxChange = (postId) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }
  const banUUID = async (uuid_ban) => {
    const response = await fetch(`${API_URL}/banUUID/${uuid_ban}`);
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      alert('Please select posts to delete')
      return
    }

    if (!deletePassword) {
      alert('Please enter a password')
      return
    }
    // POST Request to delete
    fetchThreads()
    setSelectedPosts(new Set())
    setDeletePassword('')
  }
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

    <div className="min-h-screen font-sans text-sm bg-[var(--color-background)]">
      {showDisclaimer && <Cookie onAgree={handleAgree} />}

      {/* Board header */}
      <div className="py-4 text-center">
        <img
          src={`${STATIC_URL}/${banner}.png`}
          width={300}
          height={100}
          alt="Board Header"
          className="mx-auto border border-[var(--color-border)]"
        />
        <hr className="my-4 border-[var(--color-border)]" />
        <h1 className="mt-2 text-4xl font-bold text-[var(--color-primary)]">
          /{threadData.board}/ - {links[boardList.indexOf(threadData.board)]}
        </h1>
      </div>

      <hr className="my-2 border-[var(--color-border)]" />

      {/* Floating reply form */}
      {formVisible && (
        <div
          className="fixed rounded-sm border shadow-lg
            bg-[var(--color-backgroundSecondary)]
            border-[var(--color-border)]"
          style={{
            left: formPosition.x,
            top: formPosition.y,
            width: 'min(400px, 85vw)',
            zIndex: 1000,
          }}
        >
          <div
            className="flex items-center justify-between p-1 border-b cursor-move
              bg-[var(--color-headerBg)]
              border-[var(--color-border)]"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          >
            <span className="text-sm font-bold text-[var(--color-text)]">
              Reply to Thread No.{replyto}
            </span>
            <NRCButton 
              label="×" 
              onClick={() => setFormVisible(false)} 
              bgColor='var(--color-headerAlt)'
              borderColor='var(--color-border)'
            />
          </div>

          <div className="p-2 space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-1 text-sm bg-white border border-[var(--color-border)] h-[20px]"
            />

            <textarea
              placeholder="Comment"
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-24 px-1 text-sm bg-white border resize-y border-[var(--color-border)]"
            />

            <input
              type="text"
              placeholder="Reply to"
              value={replyto}
              onChange={(e) => setReplyto(e.target.value)}
              className="w-full px-1 text-sm bg-white border border-[var(--color-border)] h-[20px]"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <NRCButton
                  label="Choose file"
                  bgColor='var(--color-headerAlt)'
                borderColor='var(--color-border)'
                  onClick={() => document.getElementById('fileInput').click()}
                />
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm break-all">
                  {file ? file.name : 'No file chosen'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <Turnstile
                  options={{ theme: 'light' }}
                  siteKey={import.meta.env.VITE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                />
                <NRCButton
                  label="Post"
                  addClass="px-2 py-1"
                  bgColor='var(--color-headerAlt)'
                  borderColor='var(--color-border)'
                  onClick={() => {
                    createthread()
                    setFormVisible(false)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread */}
      <article className="p-2 m-2 bg-[var(--color-backgroundSecondary)]">
        <div>
          <span className="font-bold text-[var(--color-primary)]">
            No: {threadData.id}
          </span>
          {threadData.image && (
            <span className="text-[var(--color-text)]">
              {' '}
              ({getFileSize(threadData.image.size)},{' '}
              {threadData.image.width}x{threadData.image.height})
            </span>
          )}
        </div>

        <div className="flex items-start m-2">
          {threadData.image?.url?.endsWith('.mp4') ? (
            <video
              controls
              className="border border-[var(--color-border)]"
              style={{ width: `${150 + sz}px` }}
              onClick={resize}
            >
              <source src={threadData.image.url} type="video/mp4" />
            </video>
          ) : (
            <ThreadImage imageData={threadData.image} />
          )}

          <div>
            <input
              type="checkbox"
              checked={selectedPosts.has(threadData.id)}
              onChange={() => handleCheckboxChange(threadData.id)}
            />
            <span className="font-bold px-1 text-[var(--color-success)]">
              {' '}
              {threadData.username && threadData.username !== 'Anon'
                ? threadData.username
                : 'Anon'}
            </span>
            <DynamicColorText posterID={threadData.poster_id || 'FFFFFF'} />{' '}
            <span className="text-[var(--color-textSecondary)]">
              {formatDate(threadData.created_at)}
            </span>

            <span className="flex">
              <NRCButton
                label="Reply"
                bgColor='var(--color-headerAlt)'
                borderColor='var(--color-border)'
                addClass="mt-2"
                onClick={() => {
                  setReplyto(null)
                  setFormVisible(true)
                }}
              />
              <NRCButton
                label="Delete"
                bgColor='var(--color-headerAlt)'
                borderColor='var(--color-border)'
                addClass="mt-2"

                onClick={() =>
                  token
                    ? deleteThread(threadData.id)
                    : deleteThreadByUser(threadData.id)
                }
              />
            </span>
          </div>
        </div>

        <h2 className="mt-2 font-bold text-[var(--color-primary)]">
          {threadData.subject}
        </h2>
        <p className="mt-2 text-[var(--color-text)]">{formatText(threadData.content)}</p>

        {token && (
          <div className="flex justify-end mt-2">
            <NRCButton
              label="Ban uuid"
              bgColor='var(--color-headerAlt)'
              borderColor='var(--color-border)'
              onClick={() => banUUID(threadData.poster_id)}
            />
          </div>
        )}
      </article>

      {/* Replies */}
      {threadData.replies &&
        threadData.replies.map((reply) => (
          <div
            className="flex ml-2"
            key={reply.id}
            ref={(el) => (replyRefs.current[reply.id] = el)}
          >
            <span className="text-gray-400 text-[1.2rem]">{'>>'}</span>

            <article className="pt-4 pr-5 pb-4 pl-5 mr-2 mb-3 ml-1 bg-[var(--color-backgroundSecondary)]">
              <div>
                <input
                  type="checkbox"
                  checked={selectedPosts.has(reply.id)}
                  onChange={() => handleCheckboxChange(reply.id)}
                />
                <span className="font-bold px-1 text-[var(--color-success)]">
                  {' '}
                  {reply.username || 'Anon'}
                </span>
                {reply.image && (
                  <span className="text-[var(--color-text)]">
                    {' '}
                    ({getFileSize(reply.image.size)},{' '}
                    {reply.image.width}x{reply.image.height})
                  </span>
                )}
                <DynamicColorText posterID={reply.poster_id || 'FFFFFF'} />{' '}
                <span className="font-bold text-[var(--color-primary)]">
                  No: {reply.id}
                </span>
                <span className="ml-2 text-[var(--color-textSecondary)]">
                  {formatDate(reply.created_at)}
                </span>
              </div>

              <div className="flex items-start mt-2">
                {reply.image?.url?.endsWith('.mp4') ? (
                  <video
                    controls
                    className="border border-[var(--color-border)]"
                    style={{ width: `${200 + sz}px` }}
                    onClick={resize}
                  >
                    <source src={reply.image.url} type="video/mp4" />
                  </video>
                ) : (
                  reply.image && <ThreadImage imageData={reply.image} />
                )}

                <div>
                  <div className="flex">
                    <NRCButton
                      label="Reply"
                      bgColor='var(--color-headerAlt)'
                      addClass='mb-1'
                      borderColor='var(--color-border)'
                      onClick={() => {
                        setReplyto(reply.id)
                        setFormVisible(true)
                      }}
                    />
                    <NRCButton
                      label="Delete"
                      bgColor='var(--color-headerAlt)'
                      addClass='mb-1'
                      borderColor='var(--color-border)'
                      onClick={() =>
                        token
                          ? deleteReply(reply.id)
                          : deleteReplyByUser(reply.id)
                      }
                    />
                  </div>

                  {reply.parent_reply && (
                    <div
                      className="mt-2 font-bold cursor-pointer text-[var(--color-info)]"
                      onClick={() => scrollToReply(reply.parent_reply)}
                    >
                      {`>>${reply.parent_reply}`}
                    </div>
                  )}

                  <p className="whitespace-pre-line text-[var(--color-text)]">
                    {formatText(reply.content)}
                  </p>
                </div>
              </div>

              {token && (
                <div className="flex justify-end mt-2">
                  <NRCButton
                    label="Ban uuid"
                      bgColor='var(--color-headerAlt)'
                borderColor='var(--color-border)'
                    onClick={() => banUUID(reply.poster_id)}
                  />
                </div>
              )}
            </article>
          </div>
        ))}
    </div>
  </div>
)
}
