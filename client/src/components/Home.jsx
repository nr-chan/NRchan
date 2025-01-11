import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { links, boardList, API_URL, getSmallImageUrl,DynamicColorText } from '../Defs'

const Home = () => {
  const nav = useNavigate()
  const [threads, setThreads] = useState([])
  const [stats,setStats] =useState([]);
  const [uuidstats,setUUIDstats]=useState([]);
  const [totalThread,settotalThread]=useState(0);
  const [totalPosts,settotalPosts]=useState(0);
  const [uniquePosters,setUniquePosters]=useState(0);

  const fetchStats = async () =>{
    try {
      const response= await fetch(`${API_URL}/boards/data`);
      const data= await response.json();
      data.sort((a, b) => b.totalPosts - a.totalPosts);
      setStats(data);
      settotalThread(data.reduce((sum, item) => sum + item.totalThreads, 0));
      settotalPosts(data.reduce((sum, item) => sum + item.totalPosts, 0));
    }
    catch (error){
      console.error('Error fetching recent threads:', error)
    }
  }
  const fetchUUIDstats = async () =>{
    try {
      const response= await fetch(`${API_URL}/boards/stats`);
      const data= await response.json();
      setUUIDstats(data);
      setUniquePosters(data.length)
    }
    catch (error){
      console.error('Error fetching recent threads:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRecent()
    fetchUUIDstats()
  }, [])

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
      <div className='max-w-[720px] mx-auto bg-[#F0E0D6] text-[#800000] p-2 m-4 border border-[#D9BFB7]'>
        <div className='flex justify-between items-center bg-red-700 py-1 px-2'>
          <h2 className='text-[14px] font-bold text-white'>What is NRchan?</h2>
        </div>
        <p className='mt-2'>
          NRchan is a simple image-based bulletin board where anyone can post comments and share images. There are boards dedicated to a variety of topics, from Japanese animation and culture to videogames, music, and photography. Users do not need to register an account before participating in the community. Feel free to click on a board below that interests you and jump right in!
        </p>
        <p className='mt-2 text-[12px]'>
          Be sure to familiarize yourself with the <a href='/rules' className='text-[#00E] underline'>Rules</a> before posting, and read the <a href='#' className='text-[#00E] underline'>FAQ</a> if you wish to learn more about how to use the site.
        </p>
      </div>

      {/* Boards */}
      <div className='max-w-[720px] mx-auto'>
        <div className='bg-[#FCA] border border-[#B86] py-1 px-2 flex justify-between items-center'>
          <h2 className='text-[15px] font-bold'>Boards</h2>
        </div>
        <div className='border border-[#B86] bg-[#F0E0D6] p-2'>
          <div className='flex flex-wrap -mx-2'>
            {categories.map((category, index) => (
              <div key={index} className='w-1/3 px-2 mb-4'>
                <h3 className='text-[12.09px] underline font-bold text-[#CC1105] mb-1'>{category.title}</h3>
                <ul className='list-none'>
                  {category.boards.map((board, boardIndex) => (
                    <li key={boardIndex} className='text-[11px] leading-tight'>
                      <span
                        className='text-[#800000] hover:underline cursor-pointer'
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
      <div className='max-w-[720px] mx-auto py-4'>
        <div className='bg-[#FCA] border border-[#B86] py-1 px-2 flex justify-between items-center'>
          <h2 className='text-[15px] font-bold'>Popular Threads</h2>
        </div>
        <div className='border border-[#800000] bg-[#FFFFEE] p-2'>
          <div className='grid grid-cols-4 gap-4'>
            {threads.slice(0, 8).map((thread, index) => (
              <div key={index} className='cursor-pointer' onClick={() => nav(`/thread/${thread._id}`)}>
                <div className='border border-[#B86] bg-[#F0E0D6] p-2'>
                  {/* Thread Image */}
                  <div className='h-32 bg-[#F0E0D6] flex items-center justify-center'>
                    {thread.image
                      ? (
                          thread.image.url.endsWith('.mp4')
                            ? (
                              <video
                                className='max-h-full max-w-full object-contain'
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
                                className='max-h-full max-w-full object-contain'
                              />
                              )
                        )
                      : (
                        <div className='text-center text-[11px] text-gray-500'>No Image</div>
                        )}
                  </div>
                  {/* Thread Info */}
                  <div className='p-1 bg-[#FFFFEE]'>
                    <div className='text-[12px] text-[#CC1105] font-bold mb-1'>
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
      <div className="flex flex-wrap max-w-[720px] mx-auto">
        <div className="w-full sm:w-1/2  ">
          <div className="mb-4">
            <div className='bg-[#5599aa] border border-[#06554a] py-1 px-2 mx-1 flex justify-between items-center'>
              <h2 className='text-[15px] font-bold'>Stats</h2>
            </div>
            <div className="bg-[#eeffff] border border-[#06554a] mx-1 p-1 text-red-800">
              <div className='font-bold'>Global</div>
              <div>Total Threads {totalThread}</div>
              <div>Total Posts {totalPosts}</div>
              <div>Unique Posters {uniquePosters}</div> 
            </div>
          </div>
          <div className="mb-4">
            <div className="bg-[#9a64c9] border border-[#06554a] py-1 mx-1 px-2 grid grid-cols-2 ">
            <h2 className='text-[15px] font-bold'>TOP POSTERS</h2>
            <h2 className='text-[15px] font-bold'>POSTS</h2>
          </div>
            <div className="bg-[#f6ecfe]  border border-[#06554a]  mx-1 px-2  text-red-800">
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
        <div className="w-full sm:w-1/2 ">
        {/* Board Stats Table */}
        <div className=" mb-4">
          {/* Table Header */}
          <div className="bg-[#99cc66] border border-[#06554a]  py-1 px-2 grid grid-cols-3 ">
            <h2 className='text-[15px] font-bold'>Board</h2>
            <h2 className='text-[15px] font-bold'>Total Threads</h2>
            <h2 className='text-[15px] font-bold'>Total Posts</h2>
          </div>

          {/* Table Body */}
          <div className="bg-[#eeffee]  border border-[#06554a] p-1 text-red-800">
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
