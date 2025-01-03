import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { links, board_list, API_URL, board_img, formatText, formatDate, getFileSize } from "../Defs";
import ThreadImage from "./Image";

export default function Board() {
  const nav = useNavigate();
  const { id } = useParams();
  const [threads, setThreads] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [name, setName] = useState("Anonymous");
  const [subject, setSubject] = useState(null);
  const [comment, setComment] = useState(null);
  const [banner, setBanner] = useState(null);
  const [token, setToken] = useState("");
  const [userIP, setUserIP] = useState("");
  const [collapsedThreads, setCollapsedThreads] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 5;
  
  const fetchThreads = async () => {
    const response = await fetch(`${API_URL}/board/${id}`);
    if(response.status !== 200 || !board_list.includes(id)){
      nav('/404')
    }
    const data = await response.json();
    setThreads(data);
  };

  const logout = () => {
    localStorage.removeItem("nrtoken");
    setToken("");
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleLockThread = async (threadId) => {
    try {
      const response = await fetch(`${API_URL}/lock/${threadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        fetchThreads();
      } else {
        console.error('Failed to toggle lock status');
      }
    } catch (error) {
      console.error('Error toggling lock status:', error);
    }
  };

  const handlePinThread = async (threadId) => {
    try {
      const response = await fetch(`${API_URL}/pin/${threadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        fetchThreads();
      } else {
        console.error('Failed to toggle pin status');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
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
      const response = await fetch(`${API_URL}/thread`, {
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
    setToken(localStorage.getItem("nrtoken"));

    if (!banner) {
      setBanner(board_img[Math.floor(Math.random() * board_img.length)]);
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [id]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(threads.length / threadsPerPage)) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(threads.length / threadsPerPage);
  const currentThreads = threads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  );

  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px] pb-8">
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
          {(token === "" || token === null)
            ?
            <a href="/login" className="text-[#800000] hover:underline">Login</a>
            :
            <a href="#" onClick={logout} className="text-[#800000] hover:underline">Logout</a>
          }
        </div>
      </div>

      {/* Banner */}
      <div className="text-center my-2">
        <img
          src={`${API_URL}/images/${banner}.png`}
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
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {file && <span className="ml-2">Selected: {file.name}</span>}          
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Threads */}
      <div className="max-w-[768px] mx-auto">
        {currentThreads.map((thread) => (
          <div key={thread._id} className="mb-4">
            <article className="bg-[#F0E0D6] border border-[#D9BFB7] p-2">
              {collapsedThreads[thread._id] ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleThreadCollapse(thread._id)}
                    className="text-[#800000] font-bold"
                  >
                    <img alt="H" className="extButton threadHideButton"
                      src={`${API_URL}/images/plus.png`}
                    />
                  </button>
                  <span className="font-bold">ThreadID: {thread._id}</span>
                    {thread.image && ( <span>({getFileSize(thread.image.size)}, {thread.image.width}x{thread.image.height})
                    </span>) }
                  {thread.locked && <img src="/closed.png" alt="Locked" className="h-4 w-4" />}
                  {thread.sticky && <img src="/sticky.gif" alt="Pinned" className="h-4 w-4" />}
                  {token && (
                    <>
                      <button
                        onClick={() => handleLockThread(thread._id)}
                        className="text-[#800000] font-bold hover:underline"
                      >
                        {thread.locked ? 'Unlock' : 'Lock'}
                      </button>
                      <button
                        onClick={() => handlePinThread(thread._id)}
                        className="text-[#800000] font-bold hover:underline"
                      >
                        {thread.sticky ? 'Unpin' : 'Pin'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleThreadCollapse(thread._id)}
                      className="text-[#800000] font-bold"
                    >
                      <img alt="H" className="extButton threadHideButton"
                        src={`${API_URL}/images/minus.png`}
                      />
                    </button>
                    <span className="font-bold">ThreadID: {thread._id}</span>
                    {thread.image && ( <span>({getFileSize(thread.image.size)}, {thread.image.width}x{thread.image.height})
                                            </span>
                                    ) }
                    {thread.locked && <img src="/closed.png" alt="Locked" className="h-4 w-4" />}
                    {thread.sticky && <img src="/sticky.gif" alt="Pinned" className="h-4 w-4" />}
                    {token && (
                      <>
                        <button
                          onClick={() => handleLockThread(thread._id)}
                          className="text-[#800000] font-bold hover:underline"
                        >
                          {thread.locked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          onClick={() => handlePinThread(thread._id)}
                          className="text-[#800000] font-bold hover:underline"
                        >
                          {thread.sticky ? 'Unpin' : 'Pin'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-start mb-2">
                    {thread.image && thread.image.url.endsWith(".mp4") ? (
                      <div className="mr-4 max-w-[150px]">
                        <video
                          controls
                          className="w-full h-auto border"
                        >
                          <source src={`${thread.image}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                        thread.image && (<div className="mr-4">
                          <ThreadImage allowExpand={false} imageData={thread.image} />
                        </div>)
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
                      View this thread <a
                        href={"/thread/" + thread._id}
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
                    {thread.replies.slice(-3).map((reply) => (
                      <div
                        key={reply._id}
                        className="border border-[#D9BFB7] p-2 mb-2"
                      >
                        <span className='text-[1.25rem] text-gray-400'>{`>> `}</span>
                        <span className="font-bold text-[#117743]">
                          {reply.username || "Anonymous"}{" "}
                        </span>
                        <span className="font-bold text-grey-600">
                          (ID: {reply.posterID}){" "}
                        </span>
                        <span className="text-[#34345C]">{formatDate(reply.created)}</span>
                        
                        {reply.image && (
                          <div className="mt-2">
                            {reply.image.url.endsWith(".mp4") ? (
                              <div className="mr-4 max-w-[150px]">
                                <video
                                  controls
                                  className="w-full h-auto border"
                                >
                                  <source src={`${reply.image}`} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            ) : (
                              <img
                                src={`${reply.image}`}
                                alt={`reply image for ${reply.title}`}
                                className="mr-4 border object-contain"
                                style={{
                                  maxWidth: "150px",
                                  height: "auto"
                                }}
                                loading="lazy"
                              />
                            )}
                          </div>
                        )}
                        <p className="mt-2">{formatText(reply.content)}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </article>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 bg-[#F0E0D6] border border-[#D9BFB7] disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 mx-1 border ${
                currentPage === i + 1
                  ? "bg-[#800000] text-white"
                  : "bg-[#F0E0D6] border-[#D9BFB7]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 bg-[#F0E0D6] border border-[#D9BFB7] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
