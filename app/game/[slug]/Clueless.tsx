'use client';
import { useState, useEffect } from 'react';

export default function Clueless({ gameid, email, cards, playerCoordsInp }: { gameid: string, email: string, cards: string[][], playerCoordsInp: { [email: string]: number[][] } }) {
  const [whoseTurn, setWhoseTurn] = useState<string>();
  const [serverResponse, setServerResponse] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [playerCoords, setPlayerCoords] = useState<{ [email: string]: number[][] }>(playerCoordsInp);

  const fetchStatus = async () => {
    if (whoseTurn !== email) {
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
        const fetchedTurnData = responseData.currentTurn;
        const fetchedPlayerCoordsData = responseData.playerCoords;
        setPlayerCoords(fetchedPlayerCoordsData);
        setWhoseTurn(() => fetchedTurnData);
      } catch (error) {
        console.error('An error occurred:', error);
        setWhoseTurn(() => "");
      }
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
      const responseData = await response.json();
      const fetchedTurnData = responseData.currentTurn;
      const fetchedPlayerCoordsData = responseData.playerCoords;
      const fetchedServerResponse = responseData.result;
      setPlayerCoords(fetchedPlayerCoordsData);
      setWhoseTurn(() => fetchedTurnData);
      setServerResponse(() => fetchedServerResponse);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setServerResponse(() => 'An error occurred: ' + error);
      setInputValue('');
    }
  };
 
  // Room coordinates and names
  const roomCoordinates: { [key: string]: { name: string } } = {
    "0,0": { name: "Study" },
    "0,2": { name: "Hall" },
    "0,4": { name: "Lounge" },
    "2,0": { name: "Library" },
    "2,2": { name: "Billiard Room" },
    "2,4": { name: "Dining Room" },
    "4,0": { name: "Conservatory" },
    "4,2": { name: "Ballroom" },
    "4,4": { name: "Kitchen" },
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
            disabled={whoseTurn !== email} // @todo: disable/enable chat based on if it's your turn or not
          />
          <button type="submit" className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Send
          </button>
        </form>

        <div className="mt-4">
          Player's turn: {whoseTurn}
        </div>
        <div>
          Server: {serverResponse}
        </div>
      </div>
      
      <div className="w-240"> {/* 2 times wider than the left column */}
        <div className="grid grid-cols-5 gap-2"> {/* 2 times wider grid */}
          {Array.from({ length: 25 }, (_, index) => {
            const coords = findCoords(index);
            const email = getEmailForCoords(coords, playerCoords);
            const roomName = roomCoordinates[`${coords[0]},${coords[1]}`]?.name || '';

            if (index === 6 || index === 8 || index === 16 || index === 18) {
              return (
                <div key={index}></div> // Render a blank spot
              );
            }
            if (index === 1 || index === 3 || index === 11 || index === 13 || index === 21 || index === 23) { // Adjust cell at index 2
              return (
                <div
                  key={index}
                  className="border p-12 text-left font-bold"
                  style={{ height: '32px', borderTopWidth: '16px', borderBottomWidth: '16px', textAlign: 'left' }}
                >
                  {/* Render your game board cell content here */}
                  {roomName}
                </div>
              );
            }
            if (index === 5 || index === 7 || index === 9 || index === 15 || index === 17 || index === 19) {
              return (
                <div
                  key={index}
                  className="border p-12 text-left font-bold"
                  style={{ height: '64px', borderLeftWidth: '16px', borderRightWidth: '16px', textAlign: 'left' }}
                >
                  {/* Render your game board cell content here */}
                  {roomName}
                </div>
              );
            }
            return (
              <div key={index} className="border p-12 text-left font-bold" style={{ textAlign: 'left' }}>
                {/* Render your game board cell content here */}
                {roomName}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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