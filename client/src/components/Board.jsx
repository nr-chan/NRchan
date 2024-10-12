import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {links, board_list,URL} from '../Defs'

export default function Board() {
  const { id } = useParams();
  const [threads, setThreads] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("anon");
  const [subject, setSubject] = useState(null);
  const [comment, setComment] = useState(null);


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

    formData.append("image", file); 
    formData.append("board", links[board_list.indexOf(id)]);
    formData.append("subject", subject);
    formData.append("content", comment);

    try {
        const response = await fetch(`${URL}/thread`, {
            method: "POST",
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

  useEffect(() => {
    fetchThreads();
    // setThreads(boardData.politics);
  },[id]);

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
            {thread.image &&   /* Null check for image */
              <img 
                src={`${URL}/uploads/${thread.image}`} 
                alt={`Thread image for ${thread.title}`} 
                className="mr-4 border" 
                style={{width: "150px", height: "auto"}} 
              />
            }
              <div>
              <span className="font-bold text-[#117743]">Anonymous </span>
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
