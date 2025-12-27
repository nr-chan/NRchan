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
        <div className='flex fixed top-0 z-50 justify-center items-center w-full h-full bg-black opacity-50 ledt-0 bg'>
          <img
            src='https://raw.githubusercontent.com/gist/Unic-X/4d03e1c856c94e613826d662a067d7e8/raw/7e777de663b31e71235b175e6cebfbe456a25b9e/load.svg'
            alt='Loading...'
            className='w-20 h-20 animate-spin'
          />
        </div>
      )}
      <div className='min-h-screen font-sans text-sm bg-[#FFFFEE]'>
        {showDisclaimer && <Cookie onAgree={handleAgree} />}
        {/* Board header */}
        <div className='py-4 text-center'>
          <img src={`${STATIC_URL}/${banner}.png`} width={300} height={100} alt='Board Header' className='mx-auto border border-black' />
          <hr className='my-4 h-[0px] border-[#8a4f4b]' />
          <h1 className='mt-2 text-4xl font-bold text-[#800000]'>/{threadData.board}/ - {links[boardList.indexOf(threadData.board)]}</h1>
        </div>

        <hr className='my-2 h-[0px] border-[#8a4f4b]' />
        {/* form */}
        {formVisible && (
          <div
            className='fixed rounded-sm border shadow-lg bg-[#F0E0D6] border-[#800000]'
            style={{
              left: formPosition.x,
              top: formPosition.y,
              width: 'min(400px, 85vw)',
              zIndex: 1000
            }}
          >
            <div
              className='flex justify-between items-center p-1 border-b cursor-move bg-[#EA8] border-[#800000]'
              onMouseDown={handleStart}
              onTouchStart={handleStart}

            >
              <span className='text-sm font-bold'>Reply to Thread No.{replyto}</span>
              <NRCButton label={"×"} onClick={() => setFormVisible(false)} />
            </div>
            <div className='p-2 space-y-2'>
              <input
                type='text'
                placeholder='Name'
                defaultValue='Anon'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='px-1 w-full text-sm bg-white border border-[#AAA] h-[20px]'
              />
              <textarea
                placeholder='Comment'
                onChange={(e) => setComment(e.target.value)}
                className='px-1 w-full h-24 text-sm bg-white border resize-y border-[#AAA]'
              />
              <input
                type='text'
                placeholder='Reply to'
                defaultValue={replyto}
                value={replyto}
                onChange={(e) => setReplyto(e.target.value)}
                className='px-1 w-full text-sm bg-white border border-[#AAA] h-[20px]'
              />
              <div className='space-y-2'>
                <div className='flex flex-wrap gap-2 items-center'>
                  <NRCButton label={"Choose file"} onClick={() =>
                    document.getElementById('fileInput').click()
                  } />
                  <input
                    id='fileInput'
                    type='file'
                    onChange={handleFileChange}
                    className='hidden'
                  />
                  <span className='mt-2 text-sm break-all'>
                    {file ? file.name : 'No file chosen'}
                  </span>
                </div>
                <div className='flex flex-col gap-2 justify-between items-center sm:flex-row'>
                  <Turnstile
                    options={{
                      theme: 'light',
                    }}
                    siteKey={import.meta.env.VITE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setCaptchaToken(null)}
                  />
                  <NRCButton label={"Post"} addClass='px-2 py-1' onClick={() => {
                    createthread()
                    setFormVisible(false)
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}            {/* Thread */}
        <article key={threadData.id} className='p-2 m-2 bg-[#F0E0D6]'>
          <div>
            <span className='font-bold text-[#800000]'>No: {threadData.id} </span>
            {threadData.image &&
              (<span>({getFileSize(threadData.image.size)}, {threadData.image.width}x{threadData.image.height})
              </span>
              )}
          </div>
          <div className='flex items-start m-2'>
            {threadData.image && threadData.image.url.endsWith('.mp4')
              ? (
                <video
                  controls
                  className='mr-4 border'
                  style={{ width: `${150 + sz}px`, height: 'auto' }}
                  onClick={() => { resize() }}
                >
                  <source src={`${threadData.image.url}`} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              )
              : (
                <ThreadImage imageData={threadData.image} />
              )}
            <div>
              <input
                type='checkbox'
                checked={selectedPosts.has(threadData.id)}
                onChange={() => handleCheckboxChange(threadData.id)}
              />
              <span className='font-bold text-[#117743]'> {(threadData.username && threadData.username !== 'Anonymous') ? threadData.username : 'Anon'} </span>
              <DynamicColorText posterID={threadData.posterID || 'FFFFFF'} /> <span className='text-[#34345C]'>{formatDate(threadData.created_at)}</span>
              <br />
              <div className='flex'>
                <NRCButton label={"Reply"} onClick={() => {
                  setReplyto(null)
                  setFormVisible(true)
                }} />
                <NRCButton label={"Delete"} onClick={() => {
                  if (token) {
                    deleteThread(threadData.id)
                  } else {
                    deleteThreadByUser(threadData.id)
                  }
                }} />
              </div>
            </div>
          </div>

          <h2 className='mt-2 font-bold text-[#800000]'>{threadData.subject}</h2>
          <p className='mt-2'>{formatText(threadData.content)}</p>
          {token && <div className='flex justify-end mt-2'>
            <NRCButton
              label={"Ban uuid"}
              onClick={() => { banUUID(threadData.posterID) }}
            />
          </div>}
        </article>

        {/* Replies */}
        {threadData.replies && threadData.replies.map((reply) => (
          <div className='flex ml-2' key={reply.id} ref={(el) => (replyRefs.current[reply.id] = el)}>

            <span className='text-gray-400 text-[1.2rem]'>{'>>'}</span>
            <span>
              <article key={reply.id} className='pt-4 pr-5 pb-4 pl-5 mr-4 mb-3 ml-1 bg-[#F0E0D6]'>
                <div>
                  <input
                    type='checkbox'
                    checked={selectedPosts.has(reply.id)}
                    onChange={() => handleCheckboxChange(reply.id)}
                  />
                  <span className='font-bold text-[#117743]'> {reply.username ? reply.username : 'Anonymous'} </span>
                  {reply.image && (<span>({getFileSize(reply.image.size)}, {reply.image.width}x{reply.image.height}) </span>)}
                  <DynamicColorText posterID={reply.posterID || 'FFFFFF'} /> <span className='font-bold text-[#800000]'>
                    No: {reply.id}
                  </span>
                  <span className='ml-2 text-[#34345C]'>{formatDate(reply.created_at)}</span>

                </div>
                <div className='flex items-start mt-2'>
                  {reply.image && reply.image.url.endsWith('.mp4')
                    ? (
                      <video
                        controls
                        className='border'
                        style={{ width: `${200 + sz}px`, height: 'auto' }}
                        onClick={() => { resize() }}
                      >
                        <source src={`${reply.image.url}`} type='video/mp4' />
                        Your browser does not support the video tag.
                      </video>
                    )
                    : (
                      reply.image && (
                        <ThreadImage imageData={reply.image} />
                      )
                    )}
                  <div>
                    <div className='flex'>

                      <NRCButton label={"Reply"} onClick={() => {
                        setReplyto(reply.id)
                        setFormVisible(true)
                      }} />
                      <NRCButton label={"Delete"} onClick={() => {
                        if (token) {
                          deleteReply(reply.id)
                        } else {
                          deleteReplyByUser(reply.id)
                        }
                      }} />

                    </div>

                    <br />
                    {reply.parentReply && (
                      <div
                        className='m-2 mt-2 font-bold cursor-pointer text-[#276221]'
                        onClick={() => scrollToReply(reply.parentReply.id)}
                      >
                        {`>>${reply.parentReply.id}`}
                      </div>
                    )}

                    <p className='whitespace-pre-line'>{formatText(reply.content)}</p>
                  </div>
                </div>
                {token && <div className='flex justify-end mt-2'>
                  <NRCButton
                    label={"Ban uuid"}
                    onClick={() => { banUUID(reply.posterID) }}
                  />
                </div>}
              </article>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
