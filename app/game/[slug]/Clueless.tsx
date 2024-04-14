'use client';
import { useState, useEffect } from 'react';

export default function Clueless({ gameid, email, cards, playerCoordsInp }: { gameid: string, email: string, cards: string[][], playerCoordsInp: { [email: string]: number[][] } }) {
  const [whoseTurn, setWhoseTurn] = useState<number>();
  const [yourMove, setYourMove] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [playerCoords, setPlayerCoords] = useState<{ [email: string]: number[][] }>(playerCoordsInp);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid,
          email: "fetchStatus",
          playerMove: "fetchStatus"
        }),
      });
      const responseData = await response.json();
      const fetchedTurnData = responseData.turnCount;
      const fetchedPlayerCoordsData = responseData.playerCoords;
      setPlayerCoords(fetchedPlayerCoordsData);
      setWhoseTurn(() => fetchedTurnData);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setWhoseTurn(() => -1);
      setInputValue('');
    }
  }

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 5000);

    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once on mount

  const handleMoveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // playerCoords['michael-dobroski@outlook.com'] = [[4,4]]
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          playerMove: inputValue
        }),
      });
      const data = await response.json();
      console.log("server response: ", data);
      setYourMove(() => "Your move: " + inputValue + " Server response: " + data);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setYourMove(() => 'An error occurred: ' + error);
      setInputValue('');
    }
  };
 
  return (
<div className="flex items-start gap-8">
  <div className="w-96">
    <h2>Your Cards</h2>
    {cards.map((row, rowIndex) => (
      <div key={rowIndex} className="flex flex-row">
        <div className="w-48">
          {row.slice(0, Math.ceil(row.length / 2)).map((card, colIndex) => (
            <div key={colIndex} className="border p-2">
              {card}
            </div>
          ))}
        </div>
        <div className="w-48">
          {row.slice(Math.ceil(row.length / 2)).map((card, colIndex) => (
            <div key={colIndex} className="border p-2">
              {card}
            </div>
          ))}
        </div>
      </div>
    ))}
    
    <form onSubmit={handleMoveSubmit} className="mt-4">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Your move goes here..."
        style={{ color: 'black' }}
        className="w-full px-4 py-2 border rounded"
        disabled={false} // @todo: disable/enable chat based on if it's your turn or not
      />
      <button type="submit" className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Send
      </button>
    </form>

    <div className="mt-4">
      {whoseTurn}
    </div>
    <div>
      {yourMove}
    </div>
  </div>
  
  <div className="w-240"> {/* 2 times wider than the left column */}
  <div className="grid grid-cols-5 gap-2"> {/* 2 times wider grid */}
  {Array.from({ length: 25 }, (_, index) => {
    const coords = findCoords(index);
    const email = getEmailForCoords(coords, playerCoords);

    if (index === 6 || index === 8 || index === 16 || index === 18) {
      return (
        <div key={index}></div> // Render a blank spot
      );
    }
    if (index === 1 || index === 3 || index === 11 || index === 13 || index === 21 || index === 23) { // Adjust cell at index 2
      return (
        <div
          key={index}
          className="border p-12 text-center"
          style={{ height: '32px', borderTopWidth: '16px', borderBottomWidth: '16px' }}
        >
          {/* Render your game board cell content here */}
          {email !== null && email !== undefined ? email : ""}
        </div>
      );
    }
    if (index === 5 || index === 7 || index === 9 || index === 15 || index === 17 || index === 19) {
      return (
        <div
          key={index}
          className="border p-12 text-center"
          style={{ height: '64px', borderLeftWidth: '16px', borderRightWidth: '16px' }}
        >
          {/* Render your game board cell content here */}
          {email !== null && email !== undefined ? email : ""}
        </div>
      );
    }
    return (
      <div key={index} className="border p-12 text-center">
        {/* Render your game board cell content here */}
        {email !== null && email !== undefined ? email : ""}
      </div>
    );
  })}
</div>

    
    
  </div>
</div>








  );
};

// Function to find coordinates for a given index
function findCoords(index: number): [number, number] {
  const row = Math.floor(index / 5);
  const col = index % 5;
  return [row, col];
}

// Function to get the email associated with the coordinates
function getEmailForCoords(coords: [number, number], playerCoords: { [email: string]: number[][] }): string | null {
  if (!playerCoords) {
    return null;
  }

  const [row, col] = coords;
  for (const [email, coordsList] of Object.entries(playerCoords)) {
    if (!coordsList) {
      continue;
    }

    if (coordsList.some(coord => coord[0] === row && coord[1] === col)) {
      return email;
    }
  }
  return null;
}