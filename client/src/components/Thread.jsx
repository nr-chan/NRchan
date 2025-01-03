import React, { useState, useEffect, useRef } from 'react';
import ThreadImage from './Image';
import { useNavigate, useParams } from 'react-router-dom';
import {links, board_list,API_URL, board_img,formatDate,formatText, getFileSize} from '../Defs'

export default function Component() {
    const { id } = useParams();
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [name, setName] = useState("Anon");
    const [comment, setComment] = useState(null);
    const [replyto, setReplyto] = useState(null);
    const [threadData, setThreadData] = useState({});
    const [sz, setSz] = useState(0);
    const [banner, setBanner] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [formPosition, setFormPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const nav = useNavigate();
    const [token, setToken] = useState("");
    const [userIP, setUserIP] = useState("");
    const [selectedPosts, setSelectedPosts] = useState(new Set());
    const [deletePassword, setDeletePassword] = useState('');
    const [fileOnlyDelete, setFileOnlyDelete] = useState(false);
    const replyRefs = useRef({});

    const scrollToReply = (replyId) => {
      if (replyRefs.current[replyId]) {
        replyRefs.current[replyId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  
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
    
    const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        setFile(file);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
        break;
      }
    }
  };

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
    formData.append("username", name); 
    formData.append("image", file); 
    formData.append("replyto",replyto);
    formData.append("content", comment);

    const response = await fetch(`${API_URL}/thread/${threadData._id}/reply`, {
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
          const resposne = await fetch(`${API_URL}/admin/thread/${threadID}`, {
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
          const resposne = await fetch(`${API_URL}/admin/reply/${replyID}`, {
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


    const fetchThreads=async()=>{
        const response = await fetch(`${API_URL}/thread/${id}`);
        const data = await response.json();
        if(response.status !== 200){
          nav('/404')
        }
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
      window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };

    },[id]);

    const handleCheckboxChange = (postId) => {
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      }); 
    };

    const handleBulkDelete = async () => {
        if (selectedPosts.size === 0) {
            alert('Please select posts to delete');
            return;
        }

        if (!deletePassword) {
            alert('Please enter a password');
            return;
        }
        //POST Request to delete 
        fetchThreads();
        setSelectedPosts(new Set());
        setDeletePassword('');

  }

  return (
    <div className="bg-[#FFFFEE] min-h-screen font-sans text-sm">

      {/* Board header */}
      <div className="text-center py-4">
        <img src={`${API_URL}/images/${banner}.png`} width={300} height={100} alt="Board Header" className="mx-auto border border-black" />
        <hr className='h-[0px] border-[#8a4f4b] my-4'/>
        <h1 className="text-4xl text-[#800000] font-bold mt-2">/{threadData.board}/ - {links[board_list.indexOf(threadData.board)]}</h1>
      </div>

        <hr className='h-[0px] border-[#8a4f4b] my-2'/>
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
              defaultValue={"Anon"}
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
      <article key={threadData.id} className="p-2 m-4 bg-[#F0E0D6]">
            <div>
              <span className="font-bold text-[#800000]">No: {threadData._id} </span>
                {threadData.image && ( <span>({getFileSize(threadData.image.size)}, {threadData.image.width}x{threadData.image.height})
              </span>) }
            </div>
            <div className="flex items-start m-2">
              {threadData.image && threadData.image.url.endsWith('.mp4') ? (
                <video 
                  controls 
                  className="mr-4 border" 
                  style={{ width: `${150+sz}px`, height: "auto" }}
                  onClick={()=>{resize()}}
                >
                  <source src={`${threadData.image.url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <ThreadImage imageData={threadData.image}/>
              )}
              <div>
              <input 
                  type="checkbox"
                  checked={selectedPosts.has(threadData._id)}
                  onChange={() => handleCheckboxChange(threadData._id)}
              />
              <span className="font-bold text-[#117743]"> {(threadData.username && threadData.username!="Anonymous")?threadData.username:"Anon"} </span>
              <span className="font-bold text-grey-600">({threadData.posterID}) </span>
              <span className="text-[#34345C]">{formatDate(threadData.created)}</span>
              <br/>
              <button className="text-red-500 pr-2" onClick={()=>{setReplyto(null)
                  setFormVisible(true);
              }}>[Reply]</button>
              <button className="text-red-500" onClick={() => {
                  deleteThread(threadData._id);
              }}>[delete]</button>
            </div>
            </div>
            
            <h2 className="font-bold text-[#800000] mt-2">{threadData.subject}</h2>
            <p className="mt-2">{formatText(threadData.content)}</p>
      </article>
      

      {/* Replies */}
      {threadData.replies && threadData.replies.map((reply) => (
        <div className="flex ml-4" key={reply._id} ref={(el) => (replyRefs.current[reply._id] = el)}>

        <span className='text-[1.2rem] text-gray-400'>{`>>`}</span>
        <span>
        <article key={reply._id} className="bg-[#F0E0D6] pl-5 pr-5 pt-4 pb-4 mb-3 ml-1 mr-4 ">
          <div>
          <input 
            type="checkbox"
            checked={selectedPosts.has(reply._id)}
            onChange={() => handleCheckboxChange(reply._id)}
          />
          <span className="font-bold text-[#117743]"> {reply.username?reply.username : "Anonymous"} </span>
          <span className="font-bold text-grey-600">({reply.posterID}) </span>
                <span className="font-bold text-[#800000]">
                    <button onClick={()=>{setReplyto(reply._id)
                        setFormVisible(true);
                    }}>No: {reply._id}</button>
                </span> {reply.image && ( <span>({getFileSize(reply.image.size)}, {reply.image.width}x{reply.image.height})
              </span>) }
            </div>
            <div className="flex items-start mt-2">
            {reply.image && reply.image.url.endsWith('.mp4') ? (
                <video 
                  controls 
                  className="mr-4 border" 
                  style={{ width: `${150+sz}px`, height: "auto" }}
                  onClick={()=>{resize()}}
                >
                  <source src={`${reply.image.url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                reply.image && (<div className="mr-4">
                        <ThreadImage imageData={reply.image} />
                </div>)
              )}
              <div>
              
              <span className="text-[#34345C]">{formatDate(reply.created)}</span>

              <br/>
              {reply.parentReply && (
                    <div
                      className="font-bold text-[#276221] m-2 mt-2 cursor-pointer"
                      onClick={() => scrollToReply(reply.parentReply._id)}
                    >
                      {`>>${reply.parentReply._id}`}
                    </div>
                  )}
              {/* {reply.parentReply && (<span className="font-bold text-[#276221] mr-5"> {`>>`}{reply.parentReply._id}   </span>)} */}
              
              {token && <button className="text-red-500" onClick={() => {
                  deleteReply(reply._id);
                }}>[delete]</button>
              }
               <p className="whitespace-pre-line">{formatText(reply.content)}</p>
            </div>
            </div>

        </article>
        </span>
        </div>
      ))}
    
    <div className="bottom-0 left-0 right-0 border-t border-[#800000] p-2">
        <form className="flex items-center gap-4 justify-end" onSubmit={(e) => {
            e.preventDefault();
            handleBulkDelete();
        }}>
            <input 
                type="hidden" 
                name="mode" 
                value="usrdel"
            />
            <span>Delete Post(s):</span>
            <label className="flex items-center gap-1">
                <input 
                    type="checkbox"
                    name="onlyimgdel"
                    checked={fileOnlyDelete}
                    onChange={(e) => setFileOnlyDelete(e.target.checked)}
                />
                File Only
            </label>
            <input 
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="px-2 py-1 border border-[#8a4f4b]"
            />
            <button
                type="submit"
                className="bg-[#EA8] border border-[#800000] px-4 py-1 hover:bg-[#F0E0D6]"
            >
                Delete
            </button>
        </form>
      </div>
    </div>
  );
}
