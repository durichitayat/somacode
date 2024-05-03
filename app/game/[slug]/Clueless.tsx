'use client';
import { useState, useEffect } from 'react';
import GameBoard from './GameBoard';

type NotesGrid = boolean[][];

// Function to get base URL
const getApiBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'https://somacode.vercel.app/' : 'http://localhost:3000';
};

export default function Clueless({ gameid, email, cards, playerCoordsInp, playerCharsInp, playerIconsInp }: { gameid: string, email: string, cards: string[][], playerCoordsInp: { [email: string]: number[][] }, playerCharsInp: { [email: string]: string }, playerIconsInp: { [email: string]: string } }) {
  // Construct API URL
  const apiUrl = `${getApiBaseUrl()}/api/game?gameid=${gameid}`;

  const [gameData, setGameData] = useState<any>();

  const [whoseTurn, setWhoseTurn] = useState<string>();
  const [serverResponse, setServerResponse] = useState<string>('');
  const [mostRecentAction, setMostRecentAction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [playerCoords, setPlayerCoords] = useState<{ [email: string]: number[][] }>(playerCoordsInp);
  const [isClueNotesOpen, setIsClueNotesOpen] = useState(true);
  const numPlayers = Object.keys(playerIconsInp).length;
  const [notes, setNotes] = useState<NotesGrid>(
    Array.from({ length: 21 }, () => Array.from({ length: numPlayers }, () => false))
  );

  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      if (whoseTurn !== email) {
        try {
          const response: Response = await fetch(apiUrl, { 
            method: 'GET'
          });

          // console.log('response:', response);

          if (!response.ok) {
            console.error('Server response:', response.status, response.statusText);
            return;
          }

          const responseData = await response.json();

          setGameData(responseData);

          // const fetchedTurnData = responseData.currentTurn;
          // const fetchedPlayerCoordsData = responseData.playerCoords;
          // const fetchedMostRecentAction = responseData.mostRecentAction;
          // setPlayerCoords(fetchedPlayerCoordsData);
          // setMostRecentAction(() => fetchedMostRecentAction);
          // setWhoseTurn(() => fetchedTurnData);
          
          // console.log('responseData:', responseData);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 50000);

    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  }, [whoseTurn, email, gameid, apiUrl]);

  const handleRoomMoveClick = async (y: number, x: number) => {
    alert(`you moved to y: ${y}, x: ${x}`);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          x: x,
          y: y
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

  const handleSuggest = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          playerMove: selectedSuspect + ", " + selectedWeapon
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
  }
  
  const handleAccuse = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          playerMove: selectedSuspect + ", " + selectedWeapon + ", " + selectedRoom
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
  }

  const handleSkip = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          playerMove: "no"
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
  }

  const handleNotesClick = (rowIndex: number, colIndex: number): void => {
    const updatedNotes: NotesGrid = [...notes];
    updatedNotes[rowIndex][colIndex] = !updatedNotes[rowIndex][colIndex];
    setNotes(updatedNotes);
  };

  return (
    <div className="flex items-start gap-8">

      {/* Left Sidebar */}
      <div className="w-96">

        {/* Your Cards */}
        <h2 className=" mb-4 mt-4 font-bold">Your Cards:</h2>
        <div className='grid grid-cols-1 justify-start p-4 bg-slate-900 shadow'>
        {cards.map((row, rowIndex) => (
            <div key={rowIndex}  className="grid  my-2">
              <p className='font-bold'>{row[1]}</p>
              <p className='text-xs text-slate-500'>{row[0]}</p>
            </div>
        ))}
        </div>
        
        {/* Players */}
        <h2 className=" my-4 font-bold">Players:</h2>
        <div className="grid grid-cols-1 justify-start p-4 bg-slate-900 shadow">
        {Object.entries(playerCharsInp).map(([email, character], rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-1 justify-start ${whoseTurn === email ? "bg-green-800" : ""}`}>
            <div className=" p-2 flex items-center">
              <img src={playerIconsInp[email]} alt="Player Icon" className="w-8 h-8 items-center mx-5 rounded-full border-gray-700" />
              <div>
                <div className='font-bold'>{character}</div>
                <div className="truncate text-xs">{email}</div>
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Room Dropdown */}
        <h2 className=" my-4 font-bold">Actions:</h2>
        <div className="relative my-4">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option className="text-gray-800 bg-gray-300">Select Room</option>
            {roomNames.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
            </svg>
          </div>
        </div>

        {/* Suspect Dropdown */}
        <div className="relative mb-4">
          <select
            value={selectedSuspect}
            onChange={(e) => setSelectedSuspect(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option className="text-gray-800 bg-gray-300">Select Suspect</option>
            {suspectNames.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
            </svg>
          </div>
        </div>

        {/* Weapon Dropdown */}
        <div className="relative mb-4">
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option className="text-gray-800 bg-gray-300">Select Weapon</option>
            {weaponNames.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
            </svg>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={() => handleSuggest()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Suggest</button>
          <button onClick={() => handleAccuse()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Accuse</button>
          <button onClick={() => handleSkip()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Skip</button>
        </div>

        <div className='grid grid-cols-1 justify-start p-4 bg-slate-900 shadow my-10'>
          <div className="my-2">
            <strong className="text-gray-700">Server Response:</strong> {serverResponse}
          </div>
          <div className="my-2">
            <strong className="text-gray-700">Latest Action:</strong> {mostRecentAction}
          </div>
        </div>

      </div>

      <GameBoard 
        playerCoords={playerCoords} 
        whoseTurn={whoseTurn}
        handleRoomMoveClick={handleRoomMoveClick}
        gameid={gameid}
        gameData={gameData}
      />
      
      

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
                    <td className="p-2"></td>
                    {Object.values(playerIconsInp).map((playerIcon, index) => (
                      <td key={index} className="p-2 text-center">
                        <img src={playerIcon} alt={`Player ${index + 1}`} className="h-8 w-8" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                      Suspects
                    </th>
                  </tr>
                  {notes.slice(0, 6).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{suspectNames[rowIndex]}</td>
                      {row.slice(0, numPlayers).map((cell, colIndex) => (
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
                    </tr>
                  ))}
                  <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                      Weapons
                    </th>
                  </tr>
                  {notes.slice(6, 12).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{weaponNames[rowIndex]}</td>
                      {row.slice(0, numPlayers).map((cell, colIndex) => (
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
                    </tr>
                  ))}
                  <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                      Rooms
                    </th>
                  </tr>
                  {notes.slice(12, 21).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{roomNames[rowIndex]}</td>
                      {row.slice(0, numPlayers).map((cell, colIndex) => (
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
  );
}





const suspectNames = [
  'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
  'Mr. Green', 'Colonel Mustard', 'Mrs. White'
]

const roomNames = [
  'Kitchen', 'Ballroom', 'Conservatory', 'Dining room',
  'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study'
];

const weaponNames = [
  'Revolver', 'Candlestick', 'Knife',
  'Lead Pipe', 'Wrench', 'Rope'
];