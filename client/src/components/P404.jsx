import React, { useState} from 'react';

import {board_list,API_URL} from '../Defs'

export default function P404() {
  const [token, setToken] = useState("");
  return (
    <div className="min-h-screen bg-[#FFFFEE] text-[#800000] font-sans text-[10px]">

            {/* Header */}
            <header className="flex justify-center p-2">
              <img 
                src={`${API_URL}/images/banner.png`} 
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
