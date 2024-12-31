import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {links, board_list,URL, board_img} from '../Defs'

export default function Board() {
  const { id } = useParams();
  const [threads, setThreads] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("Anonymous");
  const [subject, setSubject] = useState(null);
  const [comment, setComment] = useState(null);
  const [banner, setBanner] = useState(null);
  const [token, setToken] = useState("");
  const [userIP, setUserIP] = useState("");

  const fetchThreads=async()=>{
    const response = await fetch(`${URL}/board/${id}`);
    const data = await response.json();
    setThreads(data);
  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const createthread = async () => {
    const formData = new FormData();

    if (!subject || !subject.trim()) {
        alert('Subject cannot be empty!');
        return;
    }

    if (!comment || !comment.trim()) {
        alert('Content cannot be empty!');
        return;
    }
    formData.append("username", name); 
    formData.append("image", file); 
    formData.append("board", id);
    formData.append("subject", subject);
    formData.append("content", comment);

    try {
        const response = await fetch(`${URL}/thread`, {
            method: "POST",
            headers: {
              ip: userIP,
            },
            body: formData, 
        });

        if (response.status === 200) {
            console.log('File uploaded successfully');
            fetchThreads();
        } else {
            console.error('Error uploading file:', response.statusText);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
  };


  const getIP = async () => {
    const response = await fetch('https://api.ipify.org?format=json');
    const json = await response.json();
    setUserIP(json.ip);
  }

  useEffect(() => {
    getIP();
    fetchThreads();
    // setThreads(boardData.politics);
     if (!banner) {
      setBanner(board_img[Math.floor(Math.random() * board_img.length)]);
    }
  },[id]);

  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">
      {/* Board Navigation */}
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

      {/* Banner Image */}
      <div className="text-center my-2">
        <img src={`${URL}/images/${banner}.png`} alt="Board banner" className="inline-block" />
      </div>

      {/* Board Title */}
      <h1 className="text-center text-4xl text-[#800000] font-bold mt-2">/{id}/ - {links[board_list.indexOf(id)]}</h1>

      {/* Post Form */}
      <div className="max-w-[468px] mx-auto my-4 bg-[#F0E0D6] border border-[#D9BFB7] p-2">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="bg-[#EA8]">Name</td>
              <td>
                <input type="text" defaultValue="Anonymous" onChange={(e) => setName(e.target.value)} className="w-full bg-[#F0E0D6] border border-[#AAA]" />
              </td>
            </tr>
            <tr>
              <td className="bg-[#EA8]">Subject</td>
              <td className="flex">
                <input type="text" onChange={(e) => setSubject(e.target.value)}className="flex-grow bg-[#F0E0D6] border border-[#AAA]" />
                <input type="submit" onClick={()=>createthread()} value="Post" className="ml-2 bg-[#F0E0D6] border border-[#AAA] px-2" />
              </td>
            </tr>
            <tr><td className="bg-[#EA8]">Comment</td><td><textarea className="w-full h-24 bg-[#F0E0D6] border border-[#AAA]" onChange={(e) => setComment(e.target.value)}></textarea></td></tr>
            <tr><td className="bg-[#EA8]">File</td><td><input type="file" onChange={handleFileChange} /></td></tr>
          </tbody>
        </table>
      </div>

      {/* Threads */}
      <div className="max-w-[768px] mx-auto">
        {threads.map((thread) => (
          <article key={thread.id} className="bg-[#F0E0D6] border border-[#D9BFB7] p-2 mb-4">
            <div>
                <span className="font-bold">ThreadID: {thread._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
                <span className="block text-[8px]">(600, 450)</span>
            </div>
            <div className="flex items-start mb-2">
            {thread.image && thread.image.endsWith('.mp4') ? (
                <video 
                  controls 
                  className="mr-4 border" 
                  style={{ width: "150px", height: "auto" }}
                >
                  <source src={`${thread.image}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                thread.image && (
                  <img
                    src={`${thread.image}`}
                    alt={`Thread image for ${thread.title}`}
                    className="mr-4 border"
                    style={{ width: "150px", height: "auto" }}
                  />
                )
              )}
              <div>
              <span className="font-bold text-[#117743]">{thread.username ? thread.username:"Anonymous"} </span>
              <span className="font-bold text-grey-600">(ID: {thread.posterID}) </span>
              <span className="text-[#34345C]">{thread.created}</span>
              <br/>
              <span>to view this thread</span>
              <a href={"/thread/"+thread._id} className="ml-2 text-[#34345C]">[click here]</a>
            </div>
            </div>
            
            <h2 className="font-bold mt-2">{thread.subject}</h2>
            <p className="mt-2">{thread.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
