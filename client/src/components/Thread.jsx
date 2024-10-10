import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
export default function Component() {
  const { id } = useParams();
    const board_list=['p','cp', 'n', 's','v', 'k', 'a','c', 'T', 'Sp', 'Ph', 'm', 'G','r', 'd', 'Con', 'GIF', 'Rnt','pol'];
    const links=['prog', 'cp', 'nerd', 'sem','Video Games', 'Khelkud', 'Arambh','Comics & Cartoons', 'Technology', 'Sports','Photography', 'Music', 'Graphic Design','/r/', '/d/', 'Confess', 'GIF', 'Rant','politics']
    const [file, setFile] = useState(null);
    const [name, setName] = useState("anon");
    const [comment, setComment] = useState(null);
    const [replyto, setReplyto] = useState(null);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const createthread = async () => {
        const replydata={
        content:comment,
        replyto:replyto,
    }
    console.log(replydata);

    const response = await fetch(`http://localhost:3000/thread/${threadData._id}/reply`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      content:comment,
      replyto:replyto,
      })
    });

    if (response.status === 200) {
      console.log('File uploaded successfully');
      // Fetch resumes again after successful upload
    } else {
        console.error('Error uploading file:', response.statusText);
    }
};

const td = {
    id: 484162649,
    image: "images (1).jpg",
    imageSize: "8 KB",
    imageDimensions: "225x224",
    name: "Anonymous",
    subject: "a;owjsef;l as;jog",
    content: "Russian government-owned 2ch bans you if you post about the exchange rate and inflation, since mid-2022\n\nThings must be going good there",
    created: "14:53:00",
    posterID: "1231u1bu",
    replies: [
        {
            id: 484163033,
            content: "Ukrainian refugee got banned on Russian for politics in /b and came to complain on 4chan.",
            created: "15:03:03",
            posterID: "1231hsfd",
            isOP: false,
            parentReply: "109231931328912319201",
            image: null,
      },
      {
          id: 484163062,
          name: "Anonymous",
          content: "you're banned for posting about rubble exchange rate & inflation on the politics board too",
          created: "15:03:03",
          posterID: "1231hsfd",
          isOP: false,
          parentReply: "109231931328912319201",
          image: null,
        },
        {
            id: 484163066,
        name: "Anonymous",
        content: "Russia has really fucked your Polish nigger mind. You come to 4chan to post about 2ch claiming you are doing because of Russia. Goddamn",
        created: "15:03:03",
        posterID: "1231hsfd",
        isOP: false,
        parentReply: "109231931328912319201",
        image: null,
    },
    {
        id: 484163086,
        name: "Anonymous",
        content: "Russians won't post under their own flags here, its a huge indicator on how badly things are going",
        created: "15:03:03",
        posterID: "1231hsfd",
        isOP: false,
        parentReply: "109231931328912319201",
        image: null,
      },
      {
        id: 484163138,
        name: "Anonymous",
        content: "They do every day numb nuts. They're some of the best posters.",
        created: "15:03:03",
        posterID: "1231hsfd",
        isOP: false,
        parentReply: "109231931328912319201",
        image: null,
      },
    ]
};
const [threadData, setThreadData] = useState(td);
const fetchThreads=async()=>{
    const response = await fetch(`http://localhost:3000/thread/${id}`);
    const data = await response.json();
    console.log(data);
    setThreadData(data);
}
useEffect(() => {
    fetchThreads();
},[]);


const boards = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'gif', 'h', 'hr', 'k', 'm', 'o', 'p', 'r', 's', 't', 'u', 'v', 'vg', 'vm', 'vmg', 'vr', 'vrpg', 'vst'];

  return (
    <div className="bg-[#FFFFEE] min-h-screen font-sans text-sm">
      {/* Top navigation */}
      <div className="bg-[#fedcba] p-1 text-xs flex flex-wrap gap-1 border-b border-[#d9bfb7]">
      <nav className="bg-[#fedcba]flex flex-wrap">
        {board_list.map(board => (
          <a key={board} href={`/board/${links[board_list.indexOf(board)]}`} className="mr-1 text-[#800000] hover:underline">{board} /</a>
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
        <h1 className="text-4xl text-[#800000] font-bold mt-2">/pol/ - Politically Incorrect</h1>
      </div>

      {/* form */}
      <div className="max-w-[468px] mx-auto my-4 bg-[#F0E0D6] border border-[#D9BFB7] p-2">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="bg-[#EA8]">Name</td>
              <td>
                <input type="text" defaultValue="Anonymous" onChange={(e) => setName(e.target.value)} className="w-full bg-[#F0E0D6] border border-[#AAA]" />
              </td>
            </tr>
            <tr><td className="bg-[#EA8]">Comment</td><td><textarea className="w-full h-24 bg-[#F0E0D6] border border-[#AAA]" onChange={(e) => setComment(e.target.value)}></textarea></td></tr>
            <tr><td className="bg-[#EA8]">File</td><td><input type="file" onChange={handleFileChange} /></td></tr>
            <tr><td className="bg-[#EA8]">Replyto</td><td><input className="w-full bg-[#F0E0D6] border border-[#AAA]" type="text" value={replyto} onChange={handleFileChange} /></td></tr>
            <tr>
              <td className="flex">
                <input type="submit" onClick={()=>createthread()} value="Post" className="ml-2 bg-[#F0E0D6] border border-[#AAA] px-2" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Thread */}
      <article key={threadData.id} className=" p-2 mb-4">
            <div>
                <span className="font-bold text-[#800000]">ThreadID: {threadData._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
                <span className="block text-[8px]">(600, 450)</span>
            </div>
            <div className="flex items-start mb-2">
              <img 
                src={threadData.image}
                alt={`Thread image for ${threadData.title}`} 
                className="mr-4 border" 
                style={{width: "150px", height: "auto"}} 
              />
              <div>
              <span className="font-bold text-[#117743]">Anonymous </span>
              <span className="font-bold text-grey-600">(ID: {threadData.posterID}) </span>
              <span className="text-[#34345C]">{threadData.created}</span>
              <br/>
              <span>to view this thread</span>
              <a href="#" className="ml-2 text-[#34345C]">[click here]</a>
            </div>
            </div>
            
            <h2 className="font-bold text-[#800000] mt-2">{threadData.subject}</h2>
            <p className="mt-2">{threadData.content}</p>
      </article>
      

      {/* Replies */}
      {threadData.replies.map((reply) => (
        <>
        <span>{`>>`}</span>

        <article key={reply._id} className="bg-[#F0E0D6] border border-[#D9BFB7] p-2 ml-5">
          <div>
                <span className="font-bold text-[#800000]">ReplyID: {reply._id} </span>
                {/* <a href="#" className="text-[#34345C]">{thread.fileName}</a> */}
                <span className="block text-[8px]">(600, 450)</span>
            </div>
            <div className="flex items-start mb-2">
              <img 
                src={reply.image} 
                className="mr-4 border" 
                style={{width: "150px", height: "auto"}} 
              />
              <div>
              <span className="font-bold text-[#117743]">Anonymous </span>
              <span className="font-bold text-grey-600">(ID: {reply.posterID}) </span>
              <span className="text-[#34345C]">{reply.created}</span>
              <br/>
              {console.log(reply)}
              {reply.parentReply && (<div className="font-bold text-[#276221]"> {`>>`}{reply.parentReply._id}   </div>)}
              <a className="ml-2 text-[#34345C]" onClick={()=>{setReplyto(reply._id)}}>[reply]</a>
            </div>
            </div>
          <p className="whitespace-pre-line">{reply.content}</p>

        </article>
        </>
      ))}

      {/* Footer */}
      <div className="text-center my-4 text-2xl text-blue-600 font-bold">
        Happy Birthday 4chan!
      </div>
    </div>
  );
}
