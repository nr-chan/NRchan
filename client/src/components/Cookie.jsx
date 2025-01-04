import React from "react";
import Cookies from "js-cookie";
import {useNavigate } from 'react-router-dom'

export default function Cookie({ onAgree }) {
  const nav = useNavigate()
  const handleAccept = () => {
    // Set cookie to track agreement for 24 hours
    Cookies.set("agreedToRules", true, { expires: 1 });
    onAgree();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFFFEE] shadow-lg w-80 p-4 ">
        <div className="border-b bg-red-700 border-gray-300 p-2 mb-4 flex justify-between items-center">
          <h2 className="text-lg text-white font-bold">Disclaimer</h2>
        </div>
        <div className="text-sm  space-y-4">
          <p>
            To access this section of the website, you understand and agree to
            the following:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              The content of this website is for mature audiences only and may
              not be suitable for minors.
            </li>
            <li>    
              This website is presented to you AS IS, with no warranty, express
              or implied. By clicking "I Agree," you agree not to hold the
              website responsible for any damages.
            </li>
            <li>
              As a condition of using this website, you agree to comply with
              its rules.
            </li>
          </ol>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAccept}
            className="px-2 py-1 m-1 border bg-white"
          >
           I Agree
          </button>
          <button
            onClick={()=>{nav('/')}}
            className="px-2 py-1 m-1 border bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
