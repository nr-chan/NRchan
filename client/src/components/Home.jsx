import React from 'react';

const Home = () => {
  const categories = [
    { title: 'Japanese Culture', boards: ['Anime & Manga', 'Anime/Cute', 'Mecha', 'Cosplay & EGL'] },
    { title: 'Video Games', boards: ['Video Games', 'Video Game Generals', 'Pokémon', 'Retro Games'] },
    { title: 'Interests', boards: ['Comics & Cartoons', 'Technology', 'Auto', 'Sports'] },
    { title: 'Creative', boards: ['Oekaki', 'Papercraft & Origami', 'Photography', 'Music'] },
    { title: 'Adult', boards: ['Women', 'Hardcore', 'Hentai', 'Ecchi'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200 font-sans">
      {/* Header with Logo */}
      <header className="flex justify-center py-4 bg-white shadow-md">
        <div className="text-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/4chanLogo.png" alt="NRchan Logo" className="mx-auto h-12" />
        </div>
      </header>

      {/* Info Box */}
      <div className="max-w-4xl mx-auto bg-red-700 text-white p-4 mt-4">
        <h2 className="text-2xl font-bold">What is NRchan?</h2>
        <p className="mt-2">NRchan is a simple image-based bulletin board where anyone can post comments and share images...</p>
      </div>

      {/* Board List */}
      <div className="max-w-4xl mx-auto mt-8 bg-white p-4 shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Boards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xl font-bold mb-2 text-orange-700">{category.title}</h3>
              <ul className="list-none space-y-2">
                {category.boards.map((board) => (
                  <li key={board} className="text-blue-600 hover:underline cursor-pointer">{board}</li>
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
