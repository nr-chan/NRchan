import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {links, board_list,URL} from '../Defs'

export default function Component() {
  const { id } = useParams();   
    
    const [file, setFile] = useState(null);
    const [name, setName] = useState("Anonymous");
    const [comment, setComment] = useState(null);
    const [replyto, setReplyto] = useState(null);
    const [threadData, setThreadData] = useState({});
    const [sz, setSz] = useState(0);
    
    const [formVisible, setFormVisible] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const resize=()=>{
      if(sz){
        setSz(0);
      }
      else{
        setSz(100);
      }
    }

    // Add these new functions for drag functionality
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - formPosition.x,
        y: e.clientY - formPosition.y
      });
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        setFormPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const createthread = async () => {
        const replydata={
        content:comment,
        replyto:replyto,
    }
    const formData = new FormData();

    formData.append("image", file); 
    formData.append("replyto",replyto);
    formData.append("content", comment);
    const response = await fetch(`${URL}/thread/${threadData._id}/reply`, {
      method: "POST",
      body: formData
    });

    if (response.status === 200) {
      console.log('File uploaded successfully');
      setFile(null);
      fetchThreads();
      // Fetch resumes again after successful upload
    } else {
        console.error('Error uploading file:', response.statusText);
    }
};


const fetchThreads=async()=>{
    const response = await fetch(`${URL}/thread/${id}`);
    const data = await response.json();
    setThreadData(data);
}
useEffect(() => {
    fetchThreads();
},[]);

  return (
    <div className="bg-[#FFFFEE] min-h-screen font-sans text-sm">
      {/* Top navigation */}
      <div className="bg-[#fedcba] p-1 text-xs flex flex-wrap gap-1 border-b border-[#d9bfb7]">
      <nav className="bg-[#fedcba]flex flex-wrap">
        {board_list.map(board => (
          <a key={board} href={`/board/${board}`} className="mr-1 text-[#800000] hover:underline">{board} /</a>
        ))}
        <a href="/" className="text-[#800000] hover:underline">[Home]</a>
      </nav>
        <a href="#" className="text-[#800000] hover:underline">Edit</a>
        <div className="ml-auto">
          <a href="#" className="text-[#800000] hover:underline mr-2">Settings</a>
          <a href="#" className="text-[#800000] hover:underline mr-2">Search</a>
          <a href="#" className="text-[#800000] hover:underline mr-2">Mobile</a>
          <a href="#" className="text-[#800000] hover:underline">Home</a>
        </div>
      </div>

      {/* Board header */}
      <div className="text-center my-4">
        <img src="/placeholder.svg?height=100&width=300" width={300} height={100} alt="Board Header" className="mx-auto" />
        <h1 className="text-4xl text-[#800000] font-bold mt-2">/{threadData.board}/ - {links[board_list.indexOf(threadData.board)]}</h1>
      </div>

      {/* form */}
      {formVisible && (
        <div 
          className="fixed bg-[#F0E0D6] border border-[#800000] shadow-lg rounded-sm"
          style={{ 
            left: formPosition.x, 
            top: formPosition.y,
            width: '300px',
            zIndex: 1000
          }}
        >
          <div 
            className="bg-[#EA8] border-b border-[#800000] p-1 flex justify-between items-center cursor-move"
            onMouseDown={handleMouseDown}
          >
            <span className="text-sm font-bold">Reply to Thread No.{replyto}</span>
            <button 
              onClick={() => setFormVisible(false)}
              className="hover:text-[#800000] px-1"
            >
              ×
            </button>
          </div>
          
          <div className="p-2 space-y-2">
            <input
              type="text"
              placeholder="Name"
              defaultValue={"Anonymous"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#AAA] px-1 text-sm h-[20px]"
            />
            
            <textarea
              placeholder="Comment"
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#AAA] px-1 h-24 text-sm resize-y"
            />
            <input
              type="text"
              placeholder="Reply to"
              defaultValue={replyto}
              value={replyto}
              onChange={(e) => setReplyto(e.target.value)}
              className="w-full bg-white border border-[#AAA] px-1 text-sm h-[20px]"
            />
            
            <div className="flex items-center justify-between bg-[#F0E0D6]">
              <div className="flex-grow flex items-center">
                <button
                  className="bg-[white] border border-[#AAA] text-sm px-2 py-0.5"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Choose file
                </button>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm ml-2">
                  {file ? file.name : 'No file chosen'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  createthread();
                  setFormVisible(false);
                }}
                className="bg-[#EA8] border border-[#800000] px-2 py-1 text-sm hover:bg-[#F0E0D6]"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread */}
      <article key={threadData.id} className=" p-2 mb-4">
            <div>
                <span className="font-bold text-[#800000]">ThreadID: {threadData._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
                <span className="block text-[8px]">(600, 450)</span>
            </div>
            <div className="flex items-start mb-2">
              {threadData.image && (<img 
                src={`${URL}/uploads/${threadData.image}`}
                alt={`Thread image for ${threadData.title}`} 
                className="mr-4 border" 
                style={{width: `${150 + sz}px`, height: "auto"}} 
                onClick={()=>{resize()}}
              />)}
              <div>
              <span className="font-bold text-[#117743]">Anonymous </span>
              <span className="font-bold text-grey-600">(ID: {threadData.posterID}) </span>
              <span className="text-[#34345C]">{threadData.created}</span>
              <br/>
              <button className="text-red-500" onClick={()=>{setReplyto(null)
                  setFormVisible(true);
              }}>[reply]</button>
            </div>
            </div>
            
            <h2 className="font-bold text-[#800000] mt-2">{threadData.subject}</h2>
            <p className="mt-2">{threadData.content}</p>
      </article>
      

      {/* Replies */}
      {threadData.replies && threadData.replies.map((reply) => (
        <div className='flex'>

        <span>{`>> `}</span>
        <span>
        <article key={reply._id} className="bg-[#F0E0D6]  pl-10 pr-10 pt-4 pb-4 mb-3 ml-1  ">
          <div>
          <span className="font-bold text-[#117743]">Anonymous </span>
          <span className="font-bold text-grey-600">(ID: {reply.posterID}) </span>
                <span className="font-bold text-[#800000]">ReplyID: {reply._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
            </div>
            <div className="flex items-start mb-2">
              {reply.image && (<img 
                src={`${URL}/uploads/${reply.image}`} 
                className="mr-4 border" 
                style={{width: "150px", height: "auto"}} 
              />)}
              <div>
              
              <span className="text-[#34345C]">{reply.created}</span>

              <br/>
              {reply.parentReply && (<span className="font-bold text-[#276221] mr-5"> {`>>`}{reply.parentReply._id}   </span>)}
              <button className="text-red-500" onClick={()=>{setReplyto(reply._id)
                  setFormVisible(true);
              }}>[reply]</button>
               <p className="whitespace-pre-line">{reply.content}</p>
            </div>
            </div>

        </article>
        </span>
        </div>
      ))}

    </div>
  );
}
