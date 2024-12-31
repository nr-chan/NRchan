import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { links, board_list, URL, board_img,formatText,formatDate } from "../Defs";

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
  const [collapsedThreads, setCollapsedThreads] = useState({});
  
  const fetchThreads = async () => {
    const response = await fetch(`${URL}/board/${id}`);
    if(response.status !== 200){
      nav('/404')
    }
    const data = await response.json();
    setThreads(data);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const createthread = async () => {
    const formData = new FormData();

    if (!subject || !subject.trim()) {
      alert("Subject cannot be empty!");
      return;
    }

    if (!comment || !comment.trim()) {
      alert("Content cannot be empty!");
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
        fetchThreads();
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };


  const getIP = async () => {
    const response = await fetch('https://api.ipify.org?format=json');
    const json = await response.json();
    setUserIP(json.ip);
  }
  
  const toggleThreadCollapse = (threadId) => {
    setCollapsedThreads((prev) => ({
      ...prev,
 

            [threadId]: !prev[threadId],
    }));
  };

  useEffect(() => {
    getIP();
    fetchThreads();
    if (!banner) {
      setBanner(board_img[Math.floor(Math.random() * board_img.length)]);
    }
  }, [id]);

  return (
  <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">
    {/* Top Navigation */}
    <div className="bg-[#fedcba] p-1 text-xs flex flex-wrap gap-1 border-b border-[#d9bfb7]">
      <nav className="flex flex-wrap">
        {board_list.map((board) => (
          <a
            key={board}
            href={`/board/${board}`}
            className="mr-1 text-[#800000] hover:underline"
          >
            {board} /
          </a>
        ))}
        <a href="/" className="text-[#800000] hover:underline">
          [Home]
        </a>
      </nav>
      <div className="ml-auto">
        <a href="#" className="text-[#800000] hover:underline mr-2">
          Settings
        </a>
        <a href="#" className="text-[#800000] hover:underline mr-2">
          Search
        </a>
        <a href="#" className="text-[#800000] hover:underline mr-2">
          Mobile
        </a>
        <a href="#" className="text-[#800000] hover:underline mr-2">
          Home
        </a>
        {token === "" || token === null ? (
          <a
            href="#"
            onClick={() => {
              nav("/login");
            }}
            className="text-[#800000] hover:underline"
          >
            Login
          </a>
        ) : (
          <a href="#" onClick={logout} className="text-[#800000] hover:underline">
            Logout
          </a>
        )}
      </div>
    </div>

    {/* Banner */}
    <div className="text-center my-2">
      <img
        src={`${URL}/images/${banner}.png`}
        alt="Board banner"
        className="inline-block"
      />
    </div>

    {/* Board Title */}
    <h1 className="text-center text-4xl text-[#800000] font-bold mt-2">
      /{id}/ - {links[board_list.indexOf(id)]}
    </h1>

    {/* Post Form */}
    <div className="max-w-[468px] mx-auto my-4 bg-[#F0E0D6] border border-[#D9BFB7] p-2">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="bg-[#EA8]">Name</td>
            <td>
              <input
                type="text"
                defaultValue="Anonymous"
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F0E0D6] border border-[#AAA]"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-[#EA8]">Subject</td>
            <td className="flex">
              <input
                type="text"
                onChange={(e) => setSubject(e.target.value)}
                className="flex-grow bg-[#F0E0D6] border border-[#AAA]"
              />
              <button
                type="submit"
                onClick={() => createthread()}
                className="ml-2 bg-[#EA8] border border-[#800000] px-2 hover:bg-[#F0E0D6]"

              >Post</button>
            </td>
          </tr>
          <tr>
            <td className="bg-[#EA8]">Comment</td>
            <td>
              <textarea
                className="w-full h-24 bg-[#F0E0D6] border border-[#AAA]"
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </td>
          </tr>
          <tr>
            <td className="bg-[#EA8]">File</td>
            <td>
              <input type="file" onChange={handleFileChange} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Threads */}
    <div className="max-w-[768px] mx-auto">
      {threads.map((thread) => (
        <div key={thread._id} className="mb-4">
          {collapsedThreads[thread._id] ? (
            <article className="bg-[#F0E0D6] border border-[#D9BFB7] p-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleThreadCollapse(thread._id)}
                  className="text-[#800000] font-bold"
                >
                  <img alt="H" class="extButton threadHideButton" 
                    src={`${URL}/images/plus.png`}
                  />
                </button>
                <span className="font-bold">ThreadID: {thread._id}</span>
              </div>
            </article>
          ) : (
            <article className="bg-[#F0E0D6] border border-[#D9BFB7] p-2">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => toggleThreadCollapse(thread._id)}
                  className="text-[#800000] font-bold"
                >
                  <img alt="H" class="extButton threadHideButton" 
                    src={`${URL}/images/minus.png`}
                  />
                </button>
                <span className="font-bold">ThreadID: {thread._id}</span>
              </div>
              
              <div className="flex items-start mb-2">
                {thread.image && thread.image.endsWith(".mp4") ? (
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
                  <span className="font-bold text-[#117743]">
                    {thread.username ? thread.username : "Anonymous"}{" "}
                  </span>
                  <span className="font-bold text-grey-600">
                    (ID: {thread.posterID}){" "}
                  </span>
                  <span className="text-[#34345C]">{formatDate(thread.created)}</span>
                  <br />
                  View this thread  <a
                    href={"/thread/"+thread._id}
                    className="text-[#34345C]"
                  >
                     [click here]
                  </a>
                </div>
              </div>

              <h2 className="font-bold mt-2">{thread.subject}</h2>
              <p className="mt-2">{formatText(thread.content)}</p>

              {/* Replies */}
              <div className="mt-4">
                {thread.replies.map((reply) => (
                  <div
                    key={reply._id}
                    className="border border-[#D9BFB7] p-2 mb-2"
                  >
                    <span className="font-bold text-[#117743]">
                      {reply.username || "Anonymous"}{" "}
                    </span>
                    <span className="font-bold text-grey-600">
                        (ID: {reply.posterID}){" "}
                    </span>
                    <span className="text-[#34345C]">{formatDate(reply.created)}</span>
                    {reply.image && (
                      <div className="mt-2">
                        <img
                          src={reply.image}
                          alt="Reply"
                          className="border"
                          style={{ width: "100px", height: "auto" }}
                        />
                      </div>
                    )}
                    <p className="mt-2">{reply.content}</p>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      ))}
    </div>
  </div>
 );
}
