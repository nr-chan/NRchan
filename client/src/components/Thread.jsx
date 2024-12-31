import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {links, board_list,URL, board_img} from '../Defs'

export default function Component() {
    const { id } = useParams();
    const [file, setFile] = useState(null);
    const [name, setName] = useState("Anonymous");
    const [comment, setComment] = useState(null);
    const [replyto, setReplyto] = useState(null);
    const [threadData, setThreadData] = useState({});
    const [sz, setSz] = useState(0);
    const [banner, setBanner] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [expandedImages, setExpandedImages] = useState({});
    const nav = useNavigate();
    const [token, setToken] = useState("");
    const [userIP, setUserIP] = useState("");
    const toggleImageSize = (id) => {
      setExpandedImages((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const resize=()=>{
      if(sz){
        setSz(0);
      }
      else{
        setSz(100);
      }
    }

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
    
    const formatDate = (dateString) => {
      try{
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(date);
      }catch{
        return dateString      
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
    formData.append("username", name); 
    formData.append("image", file); 
    formData.append("replyto",replyto);
    formData.append("content", comment);
    const response = await fetch(`${URL}/thread/${threadData._id}/reply`, {
      method: "POST",
      headers: {
        ip: userIP,
      },
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

    const deleteThread = async (threadID) => {
          if(!token){
            alert("Login as an admin to delete a thread");
            return;
          }
          const resposne = await fetch(`${URL}/admin/thread/${threadID}`, {
            method: "DELETE",
            headers: {
              "Authorization": 'bearer ' + token,
            },
          });
          if (resposne.status === 200) {
            console.log('Thread deleted successfully');
            nav(-1);
          } else {
            const json = await resposne.json();
            console.log("Error deleting the thread", json);
          }
      }
      const deleteReply = async (replyID) => {
          if(!token){
            alert("Login as an admin to delete a reply");
            return;
          }
          const resposne = await fetch(`${URL}/admin/reply/${replyID}`, {
            method: "DELETE",
            headers: {
              "Authorization": 'bearer ' + token,
            },
          });
          if (resposne.status === 200) {
            console.log('Reply deleted successfully');
            fetchThreads();
          } else {
            const json = await resposne.json();
            console.log("Error deleting the reply", json);
          }
      }
    const logout = () => {
        localStorage.removeItem("nrtoken");
        setToken("");
      }

    const fetchThreads=async()=>{
        const response = await fetch(`${URL}/thread/${id}`);
        const data = await response.json();
        setThreadData(data);
    }
    
    const getIP = async () => {
        const response = await fetch('https://api.ipify.org?format=json');
        const json = await response.json();
        setUserIP(json.ip);
    }
    useEffect(() => {
        fetchThreads();
        getIP();
        setToken(localStorage.getItem("nrtoken"));
    },[]);
    
    useEffect(() => {
     if (!banner) {
      setBanner(board_img[Math.floor(Math.random() * board_img.length)]);
    }
  },[id]);


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
        <div className="ml-auto">
          <a href="#" className="text-[#800000] hover:underline mr-2">Settings</a>
          <a href="#" className="text-[#800000] hover:underline mr-2">Search</a>
          <a href="#" className="text-[#800000] hover:underline mr-2">Mobile</a>
          <a href="#" className="text-[#800000] hover:underline mr-2">Home</a>
          {(token === "" || token === null)
            ?
            <a href="#" onClick={() => {nav('/login')}} className="text-[#800000] hover:underline">Login</a>
            :
            <a href="#" onClick={logout} className="text-[#800000] hover:underline">Logout</a>
          }
        </div>
      </div>

      {/* Board header */}
      <div className="text-center my-4">
        <img src={`${URL}/images/${banner}.png`} width={300} height={100} alt="Board Header" className="mx-auto" />
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
      <article key={threadData.id} className="p-2 mb-4 bg-[#F0E0D6]">
            <div>
              <span className="font-bold text-[#800000]">ThreadID: {threadData._id} </span>
            </div>
            <div className="flex items-start mb-2">
              {threadData.image && threadData.image.endsWith('.mp4') ? (
                <video 
                  controls 
                  className="mr-4 border" 
                  style={{ width: `${150+sz}px`, height: "auto" }}
                  onClick={()=>{resize()}}
                >
                  <source src={`${threadData.image}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                threadData.image && (
                  <img
                    src={`${threadData.image}`}
                    alt={`Thread image for ${threadData.title}`}
                    className="mr-4 border"
                    style={{ width: `${150+sz}px`, height: "auto" }}
                    onClick={()=>{resize()}}
                  />
                )
              )}
              <div>
              <span className="font-bold text-[#117743]">{threadData.username?threadData.username:"Anonymous"} </span>
              <span className="font-bold text-grey-600">(ID: {threadData.posterID}) </span>
              <span className="text-[#34345C]">{formatDate(threadData.created)}</span>
              <br/>
              <button className="text-red-500" onClick={()=>{setReplyto(null)
                  setFormVisible(true);
              }}>[reply]</button>
              <button className="text-red-500" onClick={() => {
                  deleteThread(threadData._id);
              }}>[delete]</button>
            </div>
            </div>
            
            <h2 className="font-bold text-[#800000] mt-2">{threadData.subject}</h2>
            <p className="mt-2">{threadData.content}</p>
      </article>
      

      {/* Replies */}
      {threadData.replies && threadData.replies.map((reply) => (
        <div className='flex ml-4'>

        <span>{`>> `}</span>
        <span>
        <article key={reply._id} className="bg-[#F0E0D6]  pl-10 pr-10 pt-4 pb-4 mb-3 ml-1  ">
          <div>
          <span className="font-bold text-[#117743]">{reply.username?reply.username : "Anonymous"} </span>
          <span className="font-bold text-grey-600">(ID: {reply.posterID}) </span>
                <span className="font-bold text-[#800000]">ReplyID: {reply._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
            </div>
            <div className="flex items-start mb-2">
              {reply.image && (<img
                src={`${reply.image}`}
                className="mr-4 border cursor-pointer"
                style={{
                  width: expandedImages[reply._id] ? "250px" : "150px",
                  height: "auto",
                }}
                onClick={() => toggleImageSize(reply._id)}
              />)}
              <div>
              
              <span className="text-[#34345C]">{formatDate(reply.created)}</span>

              <br/>
              {reply.parentReply && (<span className="font-bold text-[#276221] mr-5"> {`>>`}{reply.parentReply._id}   </span>)}
              <button className="text-red-500" onClick={()=>{setReplyto(reply._id)
                  setFormVisible(true);
              }}>[reply]</button>
              <button className="text-red-500" onClick={() => {
                  deleteReply(reply._id);
              }}>[delete]</button>
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
