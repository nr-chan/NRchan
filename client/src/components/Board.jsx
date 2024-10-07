import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Board() {
  const { id } = useParams();
  const [threads, setThreads] = useState([]);
  const board_list=['p','cp', 'n', 's','v', 'k', 'a','c', 'T', 'Sp', 'Ph', 'm', 'G','r', 'd', 'Con', 'GIF', 'Rnt'];
  const links=['prog', 'cp', 'nerd', 'sem','Video Games', 'Khelkud', 'Arambh','Comics & Cartoons', 'Technology', 'Sports','Photography', 'Music', 'Graphic Design','/r/', '/d/', 'Confess', 'GIF', 'Rant']
  const boardData = {
    pol: [
      {
        id: 1,
        title: "Welcome to /pol/ - Politically Incorrect",
        post: "This board is for the discussion of news, world events, political issues, and other related topics. Off-topic threads will be deleted.",
        image: "sticky.jpg",
        imageSize: "1600x1131",
        fileName: "sticky.jpg",
        fileSize: "733 KB"
      },
      {
        id: 2,
        title: "Check the catalog before posting a new thread!",
        post: "Reply to existing threads about a topic instead of starting a new one. Mods will delete obvious duplicate threads.",
        image: "check catalog.jpg",
        imageSize: "452x343",
        fileName: "check catalog.jpg",
        fileSize: "44 KB"
      },
      {
        id: 3,
        title: "/ptg/ - PRESIDENT TRUMP GENERAL",
        post: "PRESIDENT DONALD J TRUMP @POTUS45",
        image: "file.png",
        imageSize: "720x354",
        fileName: "file.png",
        fileSize: "40 KB"
      }
    ]
  };

  useEffect(() => {
    if (id && boardData[id]) {
      setThreads(boardData[id]);
    } else {
      setThreads([]);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">
      {/* Board Navigation */}
      <nav className="bg-[#FAF0E6] p-1 border-b border-[#D9BFB7] flex flex-wrap">
        {board_list.map(board => (
          <a key={board} href={`/board/${links[board_list.indexOf(board)]}`} className="mr-1 text-[#800000] hover:underline">{board} /</a>
        ))}
        <a href="/" className="text-[#800000] hover:underline">[Home]</a>
      </nav>

      {/* Banner Image */}
      <div className="text-center my-2">
        <img src="/placeholder.svg?height=100&width=300" alt="Board banner" className="inline-block" />
      </div>

      {/* Board Title */}
      <h1 className="text-center text-[#CC1105] text-[24px] font-bold my-2">/{board_list[links.indexOf(id)]}/ - {id}</h1>

      {/* Post Form */}
      <form className="max-w-[468px] mx-auto my-4 bg-[#F0E0D6] border border-[#D9BFB7] p-2">
        <table className="w-full">
          <tbody>
            <tr><td className="bg-[#EA8]">Name</td><td><input type="text" defaultValue="Anonymous" readOnly className="w-full bg-[#F0E0D6] border border-[#AAA]" /></td></tr>
            <tr><td className="bg-[#EA8]">Options</td><td><input type="text" className="w-full bg-[#F0E0D6] border border-[#AAA]" /></td></tr>
            <tr>
              <td className="bg-[#EA8]">Subject</td>
              <td className="flex">
                <input type="text" className="flex-grow bg-[#F0E0D6] border border-[#AAA]" />
                <input type="submit" value="Post" className="ml-2 bg-[#F0E0D6] border border-[#AAA] px-2" />
              </td>
            </tr>
            <tr><td className="bg-[#EA8]">Comment</td><td><textarea className="w-full h-24 bg-[#F0E0D6] border border-[#AAA]"></textarea></td></tr>
            <tr><td className="bg-[#EA8]">File</td><td><input type="file" /></td></tr>
          </tbody>
        </table>
      </form>

      {/* Threads */}
      <div className="max-w-[768px] mx-auto">
        {threads.map((thread) => (
          <article key={thread.id} className="bg-[#F0E0D6] border border-[#D9BFB7] p-2 mb-4">
            <div className="flex items-start mb-2">
              <img 
                src={`/placeholder.svg?height=250&width=250`} 
                alt={`Thread image for ${thread.title}`} 
                className="mr-4 border" 
                style={{width: "150px", height: "auto"}} 
              />
              <div>
                <span className="font-bold">File: </span>
                <a href="#" className="text-[#34345C]">{thread.fileName}</a>
                <span className="block text-[8px]">({thread.fileSize}, {thread.imageSize})</span>
              </div>
            </div>
            <div>
              <span className="font-bold text-[#117743]">Anonymous </span>
              <span className="text-[#34345C]">{new Date().toLocaleString()}</span>
              <a href="#" className="ml-2 text-[#34345C]">[Reply]</a>
            </div>
            <h2 className="font-bold mt-2">{thread.title}</h2>
            <p className="mt-2">{thread.post}</p>
          </article>
        ))}
      </div>
    </div>
  );
}