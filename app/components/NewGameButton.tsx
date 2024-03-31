'use client'
import React, { useState } from 'react';

export default function NewGameButton( { session }: { session: any } ) {
  const [gameName, setGameName] = useState('');

  const handleNewGame = async () => {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: session.user.email,
          gameName: gameName,
        }),
      });
      const data = await response.json();
      const gameID = data.message;
      console.log('New game created with ID:', gameID);

      // Redirect to the new game lobby
      window.location.replace(`/lobby/${gameID}`);
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <label htmlFor="game-name" className="sr-only">Game Name</label>
        <input id="game-name" type='text' placeholder="Enter game name" className="w-full py-2.5 px-5 pr-32 text-black bg-white border rounded-full outline-none focus:shadow-lg" onChange={(e) => setGameName(e.target.value)} />
        <button onClick={handleNewGame} className='absolute top-0 right-0 py-2.5 px-5 text-white bg-pink-700 hover:bg-pink-600 rounded-r-full'>
          New Game
        </button>
      </div>
    </>
  )
}