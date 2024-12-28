import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {links, board_list,URL} from '../Defs'

const Home = () => {
  const nav = useNavigate();
  const [threads, setThreads] = useState([]);
  
  useEffect(() => {
    fetchRecent();
  }, []);

 const fetchRecent = async () => {
    try {
      const response = await fetch(`${URL}/recent`);
      const data = await response.json();
      setThreads(data.data);
    } catch (error) {
      console.error('Error fetching recent threads:', error);
    }
  };

  const categories = [
    { title: 'Academics', boards: ['Programming', 'Competitive Programming', 'Nerd', 'Semester','Politics'] },
    { title: 'Sports/ Games', boards: ['Video Games', 'Khelkud', 'Arambh'] },
    { title: 'Interests', boards: ['Comics & Cartoons', 'Technology', 'Sports'] },
    { title: 'Creative', boards: ['Photography', 'Music', 'Graphic Design'] },
    { title: 'Adult (NSFW)', boards: ['randi', 'dick', 'Confess', 'GIF', 'Rant'] },
  ];

  const toboard = (board) => {
    nav(`/board/${board_list[links.indexOf(board)]}`);
    console.log(board);
  }


  const getPreviewText = (content) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">
      {/* Header */}
      <header className="flex justify-center p-2">
        <img 
          src={`${URL}/images/banner.png`} 
          alt="NRchan Logo" 
          className="h-16"
        />
      </header>

      {/* Info Box */}
      <div className="max-w-[720px] mx-auto bg-[#F0E0D6] text-[#800000] p-2 m-4 border border-[#D9BFB7]">
        <div className="flex justify-between items-center bg-red-700 py-1 px-2">
          <h2 className="text-[12px] font-bold text-white">What is NRchan?</h2>
        </div>
        <p className="mt-2 text-[11px]">
          NRchan is a simple image-based bulletin board where anyone can post comments and share images. There are boards dedicated to a variety of topics, from Japanese animation and culture to videogames, music, and photography. Users do not need to register an account before participating in the community. Feel free to click on a board below that interests you and jump right in!
        </p>
        <p className="mt-2 text-[11px]">
          Be sure to familiarize yourself with the <a href="#" className="text-[#00E] underline">Rules</a> before posting, and read the <a href="#" className="text-[#00E] underline">FAQ</a> if you wish to learn more about how to use the site.
        </p>
      </div>

      {/* Boards */}
      <div className="max-w-[720px] mx-auto">
        <div className="bg-[#FCA] border border-[#B86] py-1 px-2 flex justify-between items-center">
          <h2 className="text-[12px] font-bold">Boards</h2>
        </div>
        <div className="border border-[#B86] bg-[#F0E0D6] p-2">
          <div className="flex flex-wrap -mx-2">
            {categories.map((category, index) => (
              <div key={index} className="w-1/3 px-2 mb-4">
                <h3 className="text-[11px] font-bold text-[#CC1105] mb-1">{category.title}</h3>
                <ul className="list-none">
                  {category.boards.map((board, boardIndex) => (
                    <li key={boardIndex} className="text-[11px] leading-tight">
                      <span 
                        className="text-[#800000] hover:underline cursor-pointer"
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
      <div className="max-w-[720px] mx-auto m-4">
        <div className="bg-[#FCA] border border-[#B86] py-1 px-2 flex justify-between items-center">
          <h2 className="text-[12px] font-bold">Popular Threads</h2>
        </div>
        <div className="border border-[#800000] bg-[#FFFFEE] p-2">
          <div className="grid grid-cols-4 gap-4">
            {threads.slice(0, 8).map((thread, index) => (
              <div key={index} className="cursor-pointer" onClick={() => nav(`/thread/${thread._id}`)}>
                <div className="border border-[#B86] bg-[#F0E0D6] p-2">
                  {/* Thread Image */}
                  <div className="h-32 bg-[#F0E0D6] flex items-center justify-center">
                    {thread.image ? (
                      <img 
                        src={`${URL}/uploads/${thread.image}`} 
                        alt={thread.subject || 'Thread image'} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-[11px] text-gray-500">No Image</div>
                    )}
                  </div>
                  {/* Thread Info */}
                  <div className="p-1 bg-[#FFFFEE]">
                    <div className="text-[11px] text-[#CC1105] font-bold mb-1">
                      /{thread.board}/
                    </div>
                    <div className="text-[10px] text-[#800000]">
                      {getPreviewText(thread.subject)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

