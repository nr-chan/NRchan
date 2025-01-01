import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {links, board_list,URL, board_img} from '../Defs'

export default function P404() {
    const [token, setToken] = useState("");
  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">
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
            {/* Header */}
            <header className="flex justify-center p-2">
              <img 
                src={`${URL}/images/banner.png`} 
                alt="NRchan Logo" 
                className="h-28"
              />
            </header>
      <div className="text-center  my-2">
        <div className="text-[40px] font-bold text-[#800000] mt-20">
          WOMP WOMP KID
        </div>
        <div className="font-bold text-[80px] text-[#117743]">
          404
        </div>
      </div>
    </div>
  );
}
