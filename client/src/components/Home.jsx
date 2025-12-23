import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { links, boardList, API_URL, getSmallImageUrl, DynamicColorText } from '../Defs'

const Home = () => {
  const nav = useNavigate()
  const [threads, setThreads] = useState([])
  const [stats, setStats] = useState([]);
  const [uuidstats, setUUIDstats] = useState([]);
  const [totalThread, settotalThread] = useState(0);
  const [totalPosts, settotalPosts] = useState(0);
  const [uniquePosters, setUniquePosters] = useState(0);
  const [activeDevices, setActiveDevices] = useState(0);
  let socket;
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/boards/data`);
      const data = await response.json();
      data.sort((a, b) => b.totalPosts - a.totalPosts);
      setStats(data);
      settotalThread(data.reduce((sum, item) => sum + item.totalThreads, 0));
      settotalPosts(data.reduce((sum, item) => sum + item.totalPosts, 0));
    }
    catch (error) {
      console.error('Error fetching recent threads:', error)
    }
  }
  const fetchUUIDstats = async () => {
    try {
      const response = await fetch(`${API_URL}/boards/stats`);
      const data = await response.json();
      setUUIDstats(data);
      setUniquePosters(data.length)
    }
    catch (error) {
      console.error('Error fetching recent threads:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRecent()
    fetchUUIDstats()
    const deviceId = localStorage.getItem('uuid');
  

  }, [API_URL])


  const fetchRecent = async () => {
    try {
      const response = await fetch(`${API_URL}/recent`)
      const data = await response.json()
      setThreads(data.data)
    } catch (error) {
      console.error('Error fetching recent threads:', error)
    }
  }

  const categories = [
    { title: 'Discussion', boards: ['Programming', 'Meth-Math', 'Politics', 'CS Trends'] },
    { title: 'Sports/ Games', boards: ['Video Games', 'Cricket', 'Arambh'] },
    { title: 'Random', boards: ['Photography', 'Music', 'Food', 'Paranormal'] },
    { title: 'Adult (NSFW)', boards: ['Khoobsurat Aurate', 'Nasha Paani', 'GIF', 'Rant'] }
  ]

  const toboard = (board) => {
    nav(`/board/${boardList[links.indexOf(board)]}`)
  }

  const getPreviewText = (content) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  return (
    <div className='bg-[#FFFFEE]'>
      {/* Header */}
      <header className='flex justify-center p-2'>
        <img
          src={`${API_URL}/images/banner.png`}
          alt='NRchan Logo'
          className='h-28'
        />
      </header>

      {/* Info Box */}
      <div className='p-2 m-4 mx-auto border max-w-[720px] bg-[#F0E0D6] text-[#800000] border-[#D9BFB7]'>
        <div className='flex justify-between items-center py-1 px-2 bg-red-700'>
          <h2 className='font-bold text-white text-[14px]'>What is NRchan?</h2>
        </div>
        <p className='mt-2'>
          NRchan is a simple image-based bulletin board where anyone can post comments and share images. There are boards dedicated to a variety of topics, from Japanese animation and culture to videogames, music, and photography. Users do not need to register an account before participating in the community. Feel free to click on a board below that interests you and jump right in!
        </p>
        <p className='mt-2 text-[12px]'>
          Be sure to familiarize yourself with the <a href='/rules' className='underline text-[#00E]'>Rules</a> before posting, and read the <a href='#' className='underline text-[#00E]'>FAQ</a> if you wish to learn more about how to use the site.
        </p>
      </div>

      {/* Boards */}
      <div className='mx-auto max-w-[720px]'>
        <div className='flex justify-between items-center py-1 px-2 border bg-[#FCA] border-[#B86]'>
          <h2 className='font-bold text-[15px]'>Boards</h2>
        </div>
        <div className='p-2 border border-[#B86] bg-[#F0E0D6]'>
          <div className='flex flex-wrap -mx-2'>
            {categories.map((category, index) => (
              <div key={index} className='px-2 mb-4 w-1/3'>
                <h3 className='mb-1 font-bold underline text-[12.09px] text-[#CC1105]'>{category.title}</h3>
                <ul className='list-none'>
                  {category.boards.map((board, boardIndex) => (
                    <li key={boardIndex} className='leading-tight text-[11px]'>
                      <span
                        className='cursor-pointer hover:underline text-[#800000]'
                        onClick={() => toboard(board)}
                      >
                        {board}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Threads Section */}
      <div className='py-4 mx-auto max-w-[720px]'>
        <div className='flex justify-between items-center py-1 px-2 border bg-[#FCA] border-[#B86]'>
          <h2 className='font-bold text-[15px]'>Popular Threads</h2>
        </div>
        <div className='p-2 border border-[#800000] bg-[#FFFFEE]'>
          <div className='grid grid-cols-4 gap-4'>
            {threads.slice(0, 8).map((thread, index) => (
              <div key={index} className='cursor-pointer' onClick={() => nav(`/thread/${thread._id}`)}>
                <div className='p-2 border border-[#B86] bg-[#F0E0D6]'>
                  {/* Thread Image */}
                  <div className='flex justify-center items-center h-32 bg-[#F0E0D6]'>
                    {thread.image
                      ? (
                        thread.image.url.endsWith('.mp4')
                          ? (
                            <video
                              className='object-contain max-w-full max-h-full'
                              controls={false}
                              muted
                              onMouseOver={(e) => e.target.play()}
                              onMouseOut={(e) => e.target.pause()}
                            >
                              <source src={`${thread.image.url}`} type='video/mp4' />
                            </video>
                          )
                          : (
                            <img
                              src={`${getSmallImageUrl(thread.image.url)}`}
                              alt={thread.subject || 'Thread image'}
                              className='object-contain max-w-full max-h-full'
                            />
                          )
                      )
                      : (
                        <div className='text-center text-gray-500 text-[11px]'>No Image</div>
                      )}
                  </div>
                  {/* Thread Info */}
                  <div className='p-1 bg-[#FFFFEE]'>
                    <div className='mb-1 font-bold text-[12px] text-[#CC1105]'>
                      /{thread.board}/
                    </div>
                    <div className='text-[11px] text-[#800000]'>
                      {getPreviewText(thread.subject)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="flex flex-wrap mx-auto max-w-[720px]">
        <div className="w-full sm:w-1/2">
          <div className="mb-4">
            <div className='flex justify-between items-center py-1 px-2 mx-1 border bg-[#5599aa] border-[#06554a]'>
              <h2 className='font-bold text-[15px]'>Stats</h2>
            </div>
            <div className="p-1 mx-1 text-red-800 border bg-[#eeffff] border-[#06554a]">
              <div className='font-bold'>Global</div>
              <div className='grid grid-cols-3 border-b border-gray-200'>
                <div>Total Threads  </div><div>{totalThread}</div> <div></div>
                <div>Total Posts   </div><div>{totalPosts}</div><div></div>
                <div>Unique User </div><div>{uniquePosters}</div> <div></div>
                <div>Active Devices </div><div>  {activeDevices}</div><div></div>
              </div>

            </div>
          </div>
          <div className="mb-4">
            <div className="grid grid-cols-2 py-1 px-2 mx-1 border bg-[#9a64c9] border-[#06554a]">
              <h2 className='font-bold text-[15px]'>TOP POSTERS</h2>
              <h2 className='font-bold text-[15px]'>POSTS</h2>
            </div>
            <div className="px-2 mx-1 text-red-800 border bg-[#f6ecfe] border-[#06554a]">
              {uuidstats.slice(0, 5).map((stat, index) => (
                <div
                  key={stat.board}
                  className="grid grid-cols-2 border-b border-gray-200"
                >
                  <div className="text-teal-600">{stat.posterID}</div>
                  {/* <div><DynamicColorText posterID={stat.posterID || 'FFFFFF'} /></div> */}
                  <div>{stat.totalCount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2">
          {/* Board Stats Table */}
          <div className="mb-4">
            {/* Table Header */}
            <div className="grid grid-cols-3 py-1 px-2 border bg-[#99cc66] border-[#06554a]">
              <h2 className='font-bold text-[15px]'>Board</h2>
              <h2 className='font-bold text-[15px]'>Total Threads</h2>
              <h2 className='font-bold text-[15px]'>Total Posts</h2>
            </div>

            {/* Table Body */}
            <div className="p-1 text-red-800 border bg-[#eeffee] border-[#06554a]">
              {stats.map((stat, index) => (
                <div
                  key={stat.board}
                  className="grid grid-cols-3 border-b border-gray-200"
                >
                  <div className="text-teal-600">/{stat.board}/</div>
                  <div>{stat.totalThreads}</div>
                  <div>{stat.totalPosts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
