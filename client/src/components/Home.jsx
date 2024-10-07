import React from 'react';
import { useNavigate } from "react-router-dom";
const Home = () => {
  const nav = useNavigate();
  const categories = [
    { title: 'Academics', boards: ['prog', 'cp', 'nerd', 'sem'] },
    { title: 'Sports/ Games', boards: ['Video Games', 'Khelkud', 'Arambh'] },
    { title: 'Interests', boards: ['Comics & Cartoons', 'Technology', 'Auto', 'Sports', 'Weapons'] },
    { title: 'Creative', boards: ['Photography', 'Music', 'Graphic Design'] },
    { title: 'Adult (NSFW)', boards: ['/r/', '/d/', 'Confess', 'GIF', 'Rant'] },
  ];

  const toboard =(board)=>{
    nav(`/board/${board}`);
    console.log(board);
  }
  return (
    <div className="min-h-screen bg-[#F0E0D6] text-black font-sans">
      {/* Header */}
      <header className="flex justify-center p-2 bg-[#D7BEB6] border-b-4 border-[#A89D97]">
        <div className="text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/43/4chanLogo.png" 
            alt="NRchan Logo" 
            className="h-16 mx-auto"
          />
        </div>
      </header>

      {/* Info Box */}
      <div className="max-w-4xl mx-auto bg-[#A60000] text-white p-4 m-4 border-4 border-black">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">What is NRchan?</h2>
          <button className="text-white">X</button>
        </div>
        <p className="mt-2 text-base">
          NRchan is a simple image-based bulletin board where anyone can post comments and share images. 
           Feel free to click on a board below that interests you and jump right in!
        </p>
        <p className="mt-2">
          Be sure to familiarize yourself with the <a href="#" className="underline text-blue-600">Rules</a> before posting, and read the <a href="#" className="underline text-blue-600">FAQ</a> if you wish to learn more about how to use the site.
        </p>
      </div>

      {/* Boards */}
      <div className="max-w-4xl mx-auto p-4 border-4 border-black">
        <h2 className="text-lg font-bold p-2 text-white mb-2 bg-black">Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-md font-bold mb-1 text-red-700">{category.title}</h3>
              <ul className="list-none space-y-1 pl-4">
                {category.boards.map((board) => (
                  <li key={board} className="text-grey-700 text-sm hover:underline cursor-pointer"
                  onClick={() =>toboard(board)}
                  >
                    {board}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
