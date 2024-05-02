'use client';
import { useState, useEffect } from 'react';

// Importing the images at the top of the component file
import MissScarletImage from './images/miss_scarlet.png';
import ProfessorPlumImage from './images/professor_plum.png';
import MrsPeacockImage from './images/mrs_peacock.png';
import MrGreenImage from './images/mr_green.png';
import ColonelMustardImage from './images/colonel_mustard.png';
import MrsWhiteImage from './images/mrs_white.png';

import KitchenImage from './images/kitchen.png';
import BallroomImage from './images/ballroom.png';
import ConservatoryImage from './images/conservatory.png';
import DiningRoomImage from './images/dining_room.png';
import BilliardRoomImage from './images/billiard_room.png';
import LibraryImage from './images/library.png';
import LoungeImage from './images/lounge.png';
import HallImage from './images/hall.png';
import StudyImage from './images/study.png';

import RevolverImage from './images/revolver.png';
import CandlestickImage from './images/candlestick.png';
import KnifeImage from './images/knife.png';
import LeadPipeImage from './images/lead_pipe.png';
import WrenchImage from './images/wrench.png';
import RopeImage from './images/rope.png';

// Type definitions
type NotesGrid = boolean[][];

// Function to get base URL
const getApiBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'https://somacode.vercel.app/' : 'http://localhost:3000';
};

// Construct API URL
const apiUrl = `${getApiBaseUrl()}/api/game`;

export default function Clueless({
  gameid,
  email,
  cards,
  playerCoordsInp,
  playerCharsInp,
  playerIconsInp
}: {
  gameid: string;
  email: string;
  cards: string[][];
  playerCoordsInp: { [email: string]: number[][] };
  playerCharsInp: { [email: string]: string };
  playerIconsInp: { [email: string]: string };
}) {
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
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');

  const fetchStatus = async () => {
    if (whoseTurn !== email) {
      try {
        const response = await fetch(apiUrl, {
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
  };

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);

    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  }, [whoseTurn, email, gameid]);

  // Functions to handle user actions
  const handleSuggest = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          gameid: gameid,
          email: email,
          playerMove: `${selectedSuspect}, ${selectedWeapon}`
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

  const handleAccuse = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          gameid: gameid,
          email: email,
          playerMove: `${selectedSuspect}, ${selectedWeapon}, ${selectedRoom}`
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
  };

  const handleNotesClick = (rowIndex: number, colIndex: number): void => {
    const updatedNotes: NotesGrid = [...notes];
    updatedNotes[rowIndex][colIndex] = !updatedNotes[rowIndex][colIndex];
    setNotes(updatedNotes);
  };

  // Dictionaries of image files for suspects, rooms, and weapons
  const suspectCards: { [key: string]: string } = {
    'Miss Scarlet': MissScarletImage.src,
    'Professor Plum': ProfessorPlumImage.src,
    'Mrs. Peacock': MrsPeacockImage.src,
    'Mr. Green': MrGreenImage.src,
    'Colonel Mustard': ColonelMustardImage.src,
    'Mrs. White': MrsWhiteImage.src,
  };

  const weaponCards: { [key: string]: string } = {
    'Revolver': RevolverImage.src,
    'Candlestick': CandlestickImage.src,
    'Knife': KnifeImage.src,
    'Lead Pipe': LeadPipeImage.src,
    'Wrench': WrenchImage.src,
    'Rope': RopeImage.src,
  };

  const roomCards: { [key: string]: string } = {
    'Kitchen': KitchenImage.src,
    'Ballroom': BallroomImage.src,
    'Conservatory': ConservatoryImage.src,
    'Dining Room': DiningRoomImage.src,
    'Billiard Room': BilliardRoomImage.src,
    'Library': LibraryImage.src,
    'Lounge': LoungeImage.src,
    'Hall': HallImage.src,
    'Study': StudyImage.src,
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

  const handleMouseEnter = (index: number) => {
    setHoveredCell(index);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleRoomMoveClick = async (coords: [number, number]) => {
    const coordsString: string = `[${coords[0]}, ${coords[1]}]`;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          gameid: gameid,
          email: email,
          playerMove: coordsString
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

  // Rendering the component
  return (
    <div className="flex items-start gap-8">
      <div className="w-96">
        <h2 className="relative mb-4 mt-4">Your Cards:</h2>
        {/* Displaying the cards */}
        {cards.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-row">
            {/* First column */}
            <div className="w-48">
              {row.slice(0, Math.ceil(row.length / 2)).map((card, colIndex) => {
                // Determine the image source based on the card type
                let imageSource: string | undefined;
                if (suspectCards[card]) {
                  imageSource = suspectCards[card];
                } else if (roomCards[card]) {
                  imageSource = roomCards[card];
                } else if (weaponCards[card]) {
                  imageSource = weaponCards[card];
                }

                // Render the card with the image
                return (
                  <div key={colIndex} className="border p-2">
                    {imageSource ? (
                      <img src={imageSource} alt={card} className="w-full h-full object-cover" />
                    ) : (
                      card
                    )}
                  </div>
                );
              })}
            </div>
            {/* Second column */}
            <div className="w-48">
              {row.slice(Math.ceil(row.length / 2)).map((card, colIndex) => {
                // Determine the image source based on the card type
                let imageSource: string | undefined;
                if (suspectCards[card]) {
                  imageSource = suspectCards[card];
                } else if (roomCards[card]) {
                  imageSource = roomCards[card];
                } else if (weaponCards[card]) {
                  imageSource = weaponCards[card];
                }

                // Render the card with the image
                return (
                  <div key={colIndex} className="border p-2">
                    {imageSource ? (
                      <img src={imageSource} alt={card} className="w-full h-full object-cover" />
                    ) : (
                      card
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Player information */}
        <h2 className="relative mb-4 mt-4">Players:</h2>
        {Object.entries(playerCharsInp).map(([playerEmail, character], index) => (
          <div key={index} className="flex flex-row mb-2">
            <div className="w-48 border p-2" style={whoseTurn === playerEmail ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}>
              <div className="truncate">{playerEmail}</div>
            </div>
            <div className="w-48 border p-2" style={whoseTurn === playerEmail ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}>
              <div>{character}</div>
            </div>
            <div className="w-48 border p-2" style={whoseTurn === playerEmail ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}>
              <img src={playerIconsInp[playerEmail]} alt="Player Icon" className="w-12 h-12" />
            </div>
          </div>
        ))}

        {/* Selection dropdowns */}
        <div className="relative mb-4 mt-4">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Room</option>
            {roomNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z" />
            </svg>
          </div>
        </div>

        <div className="relative mb-4">
          <select
            value={selectedSuspect}
            onChange={(e) => setSelectedSuspect(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Suspect</option>
            {suspectNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z" />
            </svg>
          </div>
        </div>

        <div className="relative mb-4">
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Weapon</option>
            {weaponNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z" />
            </svg>
          </div>
        </div>

        {/* Buttons for Suggest, Accuse, and Skip actions */}
        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={() => handleSuggest()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Suggest
          </button>
          <button onClick={() => handleAccuse()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Accuse
          </button>
          <button onClick={() => handleSkip()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Skip
          </button>
        </div>

        {/* Displaying server response and latest action */}
        <div className="my-2">
          <strong className="text-gray-700">Server Response:</strong> {serverResponse}
        </div>
        <div className="my-2">
          <strong className="text-gray-700">Latest Action:</strong> {mostRecentAction}
        </div>
      </div>

      {/* Rendering the board */}
      <div className="w-240">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }, (_, index) => {
            const coords = findCoords(index);
            const emails = getEmailsFromCoords(coords, playerCoords);
            const roomName = roomCoordinates[`${coords[0]},${coords[1]}`]?.name || '';
            const backgroundImage = roomImages[roomName];
            const renderStudySecretPassage = index === 0;
            const renderLoungeSecretPassage = index === 4;
            const renderConservatorySecretPassage = index === 20;
            const renderKitchenSecretPassage = index === 24;

            // Rendering empty cells
            if (index === 6 || index === 8 || index === 16 || index === 18) {
              return <div key={index} className=""></div>;
            }

            // Rendering hallway cells
            if (index === 1 || index === 3 || index === 11 || index === 13 || index === 21 || index === 23) {
              return (
                <div
                  key={index}
                  className={`w-48 h-48 border p-12 text-center ${hoveredCell === index ? 'opacity-50' : ''}`}
                  style={{
                    background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`,
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleRoomMoveClick(coords)}
                >
                  <div className="font-bold">{roomName}</div>
                  <div className="flex">
                    {emails.map((email, i) => (
                      <img
                        key={i}
                        src={playerIconsInp[email]}
                        alt="Player Image"
                        className="w-10 h-10 rounded-full mr-2"
                        style={whoseTurn === email ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            // Rendering additional hallway cells
            if (index === 5 || index === 7 || index === 9 || index === 15 || index === 17 || index === 19) {
              return (
                <div
                  key={index}
                  className={`w-48 h-48 border p-12 text-center ${hoveredCell === index ? 'opacity-50' : ''}`}
                  style={{
                    background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`,
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleRoomMoveClick(coords)}
                >
                  <div className="font-bold">{roomName}</div>
                  <div className="flex flex-col">
                    {emails.map((email, i) => (
                      <img
                        key={i}
                        src={playerIconsInp[email]}
                        alt="Player Image"
                        className="w-10 h-10 rounded-full my-1"
                        style={whoseTurn === email ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            // Rendering the rooms and secret passages
            return (
              <div key={index} className="relative">
                {/* Secret passage from Study to Kitchen */}
                {renderStudySecretPassage && (
                  <div
                    className={`absolute bottom-0 right-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -1 ? 'opacity-70' : ''}`}
                    onMouseEnter={() => handleMouseEnter(-1)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRoomMoveClick([4, 4])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left"
                      style={{ transform: 'rotate(180deg)' }}
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7l10 10" />
                      <path d="M16 7l-9 0l0 9" />
                    </svg>
                  </div>
                )}

                {/* Secret passage from Lounge to Conservatory */}
                {renderLoungeSecretPassage && (
                  <div
                    className={`absolute bottom-0 left-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -2 ? 'opacity-70' : ''}`}
                    onMouseEnter={() => handleMouseEnter(-2)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRoomMoveClick([4, 0])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left"
                      style={{ transform: 'rotate(270deg)' }}
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7l10 10" />
                      <path d="M16 7l-9 0l0 9" />
                    </svg>
                  </div>
                )}

                {/* Secret passage from Conservatory to Lounge */}
                {renderConservatorySecretPassage && (
                  <div
                    className={`absolute top-0 right-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -3 ? 'opacity-70' : ''}`}
                    onMouseEnter={() => handleMouseEnter(-3)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRoomMoveClick([0, 4])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left"
                      style={{ transform: 'rotate(90deg)' }}
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7l10 10" />
                      <path d="M16 7l-9 0l0 9" />
                    </svg>
                  </div>
                )}

                {/* Secret passage from Kitchen to Study */}
                {renderKitchenSecretPassage && (
                  <div
                    className={`absolute top-0 left-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -4 ? 'opacity-70' : ''}`}
                    onMouseEnter={() => handleMouseEnter(-4)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRoomMoveClick([0, 0])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7l10 10" />
                      <path d="M16 7l-9 0l0 9" />
                    </svg>
                  </div>
                )}

                {/* Rendering room and emails */}
                <div
                  className={`w-48 h-48 border p-12 text-center ${hoveredCell === index ? 'opacity-50' : ''}`}
                  style={{
                    background: `url(${backgroundImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleRoomMoveClick(coords)}
                >
                  <div className="font-bold">{roomName}</div>
                  <div className="flex">
                    {emails.map((email, i) => (
                      <img
                        key={i}
                        src={playerIconsInp[email]}
                        alt="Player Image"
                        className="w-10 h-10 rounded-full mr-2"
                        style={whoseTurn === email ? { filter: 'drop-shadow(0 0 10px lime)' } : {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clue Notes Interface */}
        {isClueNotesOpen ? (
          <div className="absolute top-0 right-0 z-10 p-4">
            <button
              onClick={() => setIsClueNotesOpen(false)}
              className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <span className="mr-2">Hide Clue Notes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex items-center justify-center bg-gray-800 min-h-screen">
              <table className="table-auto border-collapse border-gray-600">
                <tbody>
                  {/* Render table headers for players */}
                  <tr>
                    <td className="p-2"></td>
                    {Object.values(playerIconsInp).map((playerIcon, index) => (
                      <td key={index} className="p-2 text-center">
                        <img src={playerIcon} alt={`Player ${index + 1}`} className="h-8 w-8" />
                      </td>
                    ))}
                  </tr>

                  {/* Render suspect notes */}
                  {notes.slice(0, 6).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{suspectNames[rowIndex]}</td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          onClick={() => handleNotesClick(rowIndex, colIndex)}
                          className={`w-12 h-12 border border-gray-600 text-center text-white ${cell ? 'bg-blue-500' : ''}`}
                        >
                          {cell ? 'X' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Render weapon notes */}
                  {notes.slice(6, 12).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{weaponNames[rowIndex]}</td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          onClick={() => handleNotesClick(rowIndex + 6, colIndex)}
                          className={`w-12 h-12 border border-gray-600 text-center text-white ${cell ? 'bg-blue-500' : ''}`}
                        >
                          {cell ? 'X' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Render room notes */}
                  {notes.slice(12, 21).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 text-right">{roomNames[rowIndex]}</td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          onClick={() => handleNotesClick(rowIndex + 12, colIndex)}
                          className={`w-12 h-12 border border-gray-600 text-center text-white ${cell ? 'bg-blue-500' : ''}`}
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
            <button
              onClick={() => setIsClueNotesOpen(true)}
              className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <span className="ml-2 mr-1">Clue Notes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 transform rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z"
                  clipRule="evenodd"
                />
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

// Array of suspect names
const suspectNames = [
  'Miss Scarlet',
  'Professor Plum',
  'Mrs. Peacock',
  'Mr. Green',
  'Colonel Mustard',
  'Mrs. White',
];

// Array of room names
const roomNames = [
  'Kitchen',
  'Ballroom',
  'Conservatory',
  'Dining Room',
  'Billiard Room',
  'Library',
  'Lounge',
  'Hall',
  'Study',
];

// Array of weapon names
const weaponNames = [
  'Revolver',
  'Candlestick',
  'Knife',
  'Lead Pipe',
  'Wrench',
  'Rope',
];