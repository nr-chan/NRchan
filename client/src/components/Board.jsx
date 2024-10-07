import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = () => {
  const { id } = useParams();
  const [threads, setThreads] = useState([]);

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
      setThreads([{ id: 0, title: "No threads available", post: "No threads found for this board." }]);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F0E0D6] text-[#800000] font-mono">
      {/* Board Header */}
      <header className="py-2 bg-[#D7BEB6] border-b-2 border-[#A89D97] text-center">
        <h1 className="text-2xl font-bold text-red-700">/{id}/ - {id.charAt(0).toUpperCase() + id.slice(1)}</h1>
      </header>

      {/* Threads List */}
      <div className="max-w-4xl mx-auto p-4">
        {threads.map((thread) => (
          <div key={thread.id} className="mb-8 border border-[#D3B8A6] bg-[#FFFBE6] p-4 shadow-md text-sm">
            {/* Image + File Details */}
            {thread.image && (
              <div className="flex items-start mb-2">
                <img
                  src={`/path_to_images/${thread.image}`}
                  alt={thread.fileName}
                  className="mr-4 border"
                  style={{ width: "150px", height: "auto" }}
                />
                <div className="text-[#707070]">
                  <span>File: <a href={`/path_to_images/${thread.image}`} className="text-blue-600">{thread.fileName}</a></span><br />
                  <span>({thread.fileSize}, {thread.imageSize})</span>
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="mb-2">
              <span className="font-bold text-red-700">Anonymous </span>
              <span>ID: <span className="text-purple-600">[RandomID]</span> </span>
              <span className="text-gray-600 text-xs"> [Date]</span>
            </div>
            <div className="font-semibold text-[#D20000]">{thread.title}</div>
            <p className="text-sm text-[#000]">{thread.post}</p>

            {/* Post Actions */}
            <div className="text-xs text-right mt-2">
              <a href="#" className="text-blue-600 mr-4">[Reply]</a>
              <a href="#" className="text-blue-600">[Quote]</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
