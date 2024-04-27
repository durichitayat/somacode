'use client';
import { useState, useEffect } from 'react';

type NotesGrid = boolean[][];

export default function Clueless({ gameid, email, cards, playerCoordsInp, playerCharsInp, playerIconsInp }: { gameid: string, email: string, cards: string[][], playerCoordsInp: { [email: string]: number[][] }, playerCharsInp: { [email: string]: string }, playerIconsInp: { [email: string]: string } }) {
  const [whoseTurn, setWhoseTurn] = useState<string>();
  const [serverResponse, setServerResponse] = useState<string>('');
  const [mostRecentAction, setMostRecentAction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [playerCoords, setPlayerCoords] = useState<{ [email: string]: number[][] }>(playerCoordsInp);
  const [isClueNotesOpen, setIsClueNotesOpen] = useState(true);
  const [notes, setNotes] = useState<NotesGrid>(
    Array.from({ length: 21 }, () => Array.from({ length: 6 }, () => false))
  );

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
        const fetchedMostRecentAction = responseData.mostRecentAction;
        setPlayerCoords(fetchedPlayerCoordsData);
        setMostRecentAction(() => fetchedMostRecentAction);
        setWhoseTurn(() => fetchedTurnData);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  }

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);

    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchStatus, whoseTurn, email, gameid]);

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
      const fetchedMostRecentAction = responseData.mostRecentAction;
      setPlayerCoords(fetchedPlayerCoordsData);
      setWhoseTurn(() => fetchedTurnData);
      setServerResponse(() => fetchedServerResponse);
      setMostRecentAction(() => fetchedMostRecentAction);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setServerResponse(() => 'An error occurred: ' + error);
      setInputValue('');
    }
  };

  const handleNotesClick = (rowIndex: number, colIndex: number): void => {
    const updatedNotes: NotesGrid = [...notes];
    updatedNotes[rowIndex][colIndex] = !updatedNotes[rowIndex][colIndex];
    setNotes(updatedNotes);
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

  const roomImages: { [key: string]: string } = {
    "Study": "https://i5.walmartimages.com/asr/903edd24-c5f6-4b03-b337-496fe699db2b.a36e87cc654a3a629f75fa39a32e09d2.png?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "Hall": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/15847a33-c83d-44ed-a01f-7422642237d2/dflpgnm-81b177f8-85d8-49c1-b47d-edebcbff8985.png/v1/fill/w_1280,h_1291/clue_hall_hd_by_goofballgb_dflpgnm-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI5MSIsInBhdGgiOiJcL2ZcLzE1ODQ3YTMzLWM4M2QtNDRlZC1hMDFmLTc0MjI2NDIyMzdkMlwvZGZscGdubS04MWIxNzdmOC04NWQ4LTQ5YzEtYjQ3ZC1lZGViY2JmZjg5ODUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.yWk8qG63F01Nbll2N9YpL2U1_QTgMKLnxmc4DlRf-vU",
    "Lounge": "https://i.ebayimg.com/images/g/ku8AAOSweblfCBz4/s-l1200.webp",
    "Library": "https://i.ebayimg.com/00/s/MTQ0MFgxNDQw/z/oEsAAOSwvjRfCBp7/$_1.PNG",
    "Billiard Room": "https://i.ebayimg.com/images/g/Wq0AAOSw-19fB9zj/s-l400.jpg",
    "Dining Room": "https://i.ebayimg.com/images/g/in8AAOSwVZFfB~3k/s-l400.jpg",
    "Conservatory": "https://i.ebayimg.com/images/g/jPgAAOSwZE5fB~pO/s-l400.jpg",
    "Ballroom": "https://i.ebayimg.com/images/g/RLMAAOSwzLFfB9kL/s-l400.jpg",
    "Kitchen": "https://m.media-amazon.com/images/I/71DZ2INzLAL._AC_UF894,1000_QL80_.jpg",
  };
  

  return (
    <div className="flex items-start gap-8">
      <div className="w-96">
        <h2>Your Cards:</h2>
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

        <h2>Players:</h2>
        {Object.entries(playerCharsInp).map(([email, character], rowIndex) => (
          <div key={rowIndex} className="flex flex-row">
            <div className="w-48 border p-2">
              <div className="truncate">{email}</div>
            </div>
            <div className="w-48 border p-2">
              <div>{character}</div>
            </div>
            <div className="w-48 border p-2">
              <img src={playerIconsInp[email]} alt="Player Icon" className="w-12 h-12" />
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
            disabled={whoseTurn !== email}
          />
          <button type="submit" className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Send
          </button>
        </form>

        <div className="mt-4">
          Player&apos;s turn: {whoseTurn}
        </div>
        <div className="my-2"> {/* Adding margin-y */}
          Server: {serverResponse}
        </div>
        <div className="my-2"> {/* Adding margin-y */}
          Most recent action: {mostRecentAction}
        </div>
      </div>
      
      <div className="w-240"> {/* 2 times wider than the left column */}
      <div className="w-240"> {/* 2 times wider than the left column */}
      <div className="grid grid-cols-5 gap-2"> {/* 2 times wider grid */}
        {Array.from({ length: 25 }, (_, index) => {
          const coords = findCoords(index);
          const emails = getEmailsFromCoords(coords, playerCoords);
          const roomName = roomCoordinates[`${coords[0]},${coords[1]}`]?.name || '';
          const backgroundImage = roomImages[roomName];

          if (index === 6 || index === 8 || index === 16 || index === 18) {
            return (
              <div key={index} ></div> // Render a blank spot
            );
          }
          if (index === 1 || index === 3 || index === 11 || index === 13 || index === 21 || index === 23) { // Adjust cell at index 2
            return (
              <div
                key={index}
                className="w-48 h-48 flex flex-col justify-center items-center" // Center the content vertically and horizontally
                style={{ background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
              >
                <div className="font-bold">{roomName}</div>
                <div className="flex">
                  {emails.map((email, i) => (
                    <img key={i} src={playerIconsInp[email]} alt="Player Image" className="w-10 h-10 rounded-full mr-2" />
                  ))}
                </div>
              </div>
            );
          }
          if (index === 5 || index === 7 || index === 9 || index === 15 || index === 17 || index === 19) {
            return (
              <div
                key={index}
                className="w-48 h-48 flex flex-col justify-center items-center" // Center the content vertically and horizontally
                style={{ background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
              >
                <div className="font-bold">{roomName}</div>
                <div className="flex flex-col">
                  {emails.map((email, i) => (
                    <img key={i} src={playerIconsInp[email]} alt="Player Image" className="w-10 h-10 rounded-full my-1" />
                  ))}
                </div>
              </div>
            );
          }          
          return (
            <div key={index} className="w-48 h-48 border p-12 text-center" style={{ background: `url(${backgroundImage})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
              <div className="font-bold">{roomName}</div>
              <div className="flex">
                {emails.map((email, i) => (
                  <img key={i} src={playerIconsInp[email]} alt="Player Image" className="w-10 h-10 rounded-full mr-2" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>

        {/* Clue notes interface */}
        {isClueNotesOpen ? (
          <div className="absolute top-0 right-0 z-10 p-4">
            <button onClick={() => setIsClueNotesOpen(false)} className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
              <span className="mr-2">Hide Clue Notes</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z" clipRule="evenodd" />
              </svg>
            </button>



            <div className="flex items-center justify-center bg-gray-800 min-h-screen">
      <table className="table-auto border-collapse border-gray-600">
        <tbody>
          <tr>
            <th colSpan={6} className="bg-gray-700 text-white py-2">
              Suspects
            </th>
          </tr>
          {notes.slice(0, 6).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onClick={() => handleNotesClick(rowIndex, colIndex)}
                  className={`w-12 h-12 border border-gray-600 text-center text-white ${
                    cell ? 'bg-blue-500' : ''
                  }`}
                >
                  {cell ? 'X' : ''}
                </td>
              ))}
              {[...Array(6 - row.length)].map((_, index) => (
                <td key={index} className="w-12 h-12 border border-gray-600"></td>
              ))}
            </tr>
          ))}
          <tr>
            <th colSpan={6} className="bg-gray-700 text-white py-2">
              Weapons
            </th>
          </tr>
          {notes.slice(6, 12).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onClick={() => handleNotesClick(rowIndex + 6, colIndex)}
                  className={`w-12 h-12 border border-gray-600 text-center text-white ${
                    cell ? 'bg-blue-500' : ''
                  }`}
                >
                  {cell ? 'X' : ''}
                </td>
              ))}
              {[...Array(6 - row.length)].map((_, index) => (
                <td key={index} className="w-12 h-12 border border-gray-600"></td>
              ))}
            </tr>
          ))}
          <tr>
            <th colSpan={6} className="bg-gray-700 text-white py-2">
              Rooms
            </th>
          </tr>
          {notes.slice(12, 21).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  onClick={() => handleNotesClick(rowIndex + 12, colIndex)}
                  className={`w-12 h-12 border border-gray-600 text-center text-white ${
                    cell ? 'bg-blue-500' : ''
                  }`}
                >
                  {cell ? 'X' : ''}
                </td>
              ))}
              {[...Array(6 - row.length)].map((_, index) => (
                <td key={index} className="w-12 h-12 border border-gray-600"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>



          </div>
        ) : (
          <div className="absolute bottom-0 right-0 z-10 p-2">
            <button onClick={() => setIsClueNotesOpen(true)} className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
              <span className="ml-2 mr-1">Clue Notes</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

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

// Function to get the emails associated with the coordinates
function getEmailsFromCoords(coords: [number, number], playerCoords: { [email: string]: number[][] }): string[] {
  const [row, col] = coords;
  const emails: string[] = [];

  if (!playerCoords) {
    return emails;
  }

  for (const [email, coordsList] of Object.entries(playerCoords)) {
    if (!coordsList) {
      continue;
    }

    if (coordsList.some(coord => coord[0] === row && coord[1] === col)) {
      emails.push(email);
    }
  }

  return emails;
}

const suspectNames = [
  'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
  'Mr. Green', 'Colonel Mustard', 'Mrs. White'
]