/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ClueNotes from './ClueNotes';
import Actions from './Actions';



// Function to get base URL
const getApiBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'https://somacode.vercel.app/' : 'http://localhost:3000';
};

export default function Clueless({ gameid, email }: { gameid: string, email: string}) {
  
  // CONSTANTS
  const apiUrl = `${getApiBaseUrl()}/api/game?gameid=${gameid}`;

  const [gameData, setGameData] = useState<any>();
  const [playerData, setPlayerData] = useState<any>();
  const [whoseTurn, setWhoseTurn] = useState<any>(null);
  const [open, setOpen] = useState(false)

  // FETCH PLAYER DATA
  useEffect(() => {
    const fetchPlayers = async () => {
        try {
          const response: Response = await fetch(`/api/game/players?gameid=${gameid}`, { 
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Server response:', response.status, response.statusText);
            return;
          }
          const responseData = await response.json();
          if (responseData !== playerData) {
            setPlayerData(responseData);
            console.log("playerData:", responseData);
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      }
    fetchPlayers();
    const intervalId = setInterval(fetchPlayers, 5000);
    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!whoseTurn]);

  // FETCH GAME DATA
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response: Response = await fetch(`/api/game?gameid=${gameid}`, { 
          method: 'GET'
        });

        const responseData = await response.json();

        if (responseData !== gameData) {
          const numPlayers = playerData?.players.length;
          const turnCount = responseData?.games[0].turncount;

          // Calculate playerOrder based on turnCount
          const playerOrder = turnCount % numPlayers;

          // Find the player whose turn it is
          const currentPlayer = playerData.players[playerOrder];

          // Set whoseTurn to the email of the current player
          // Only if it has changed
          if (currentPlayer !== whoseTurn) {
            setWhoseTurn(currentPlayer);
          }

          setGameData(responseData);
          console.log("gameData:", responseData);
        }

      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    if (playerData && playerData.players.length > 0){
      fetchGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData, whoseTurn]); // Add whoseTurn to the dependency array

  // START GAME FUNCTION
  const handleStart = async (email: string, gameid: string) => {
    try {
      const response = await fetch('/api/game', {
        method: 'PUT',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email, 
          gameData: gameData,
          playerData: playerData
        }),
      });
      const responseData = await response.json();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


  return (
    <div className="flex items-start gap-8">

      {/* Left Sidebar */}
      <div className="w-96 space-y-4">

        {/* Game Info */}
        <div className='grid grid-cols-1 justify-start p-4 bg-slate-900 shadow'>
          <div>
            <h2 className="text-2xl font-bold">{gameData?.games[0].gamename}</h2>
            <p className='text-xs text-gray-500'>Created: {gameData?.games[0].created_at}</p>
            <p className='text-xs text-gray-500'>Owner: {gameData?.games[0].gameowner}</p>
            <p className='text-xs text-gray-500'>Status: {gameData?.games[0].gamestate}</p>
            <p className='text-xs text-yellow-500'>Turn Count: {gameData?.games[0].turncount}</p>
          </div>
          {gameData && gameData?.games[0].gamestate === 'open' && (
            (email === gameData?.games[0].gameowner && playerData?.players.length > 1) 
              ? <button onClick={() => handleStart(email, gameid)} className="mt-4 py-2.5 px-5 mx-2 text-white bg-pink-700 hover:bg-pink-600 rounded-full">Start Game</button>
              : <button disabled className='mt-4 py-2.5 px-5 mx-2 text-white bg-gray-700 hover:bg-gray-600 rounded-full'>Waiting for more players to join</button>
          )}
        </div>

        {/* Your Cards */}
        <div className='grid grid-cols-1 justify-start p-4 bg-slate-900 shadow'>
          <h2 className="my-2 font-bold">Your Cards</h2>
          {playerData && playerData.players.filter((player: any) => player.email === email).map((player: any, index: number) => {
            const { email, cards } = player;
            return (
            <div key={index} className={`grid grid-cols-1 justify-start `}>
                {cards ? cards.sort((a, b) => a.type.localeCompare(b.type)).map((card: any, index: number ) => (
                    <div key={index}  className="grid  my-2 ml-4">
                        <p className='text-sm '>{card.name}</p>
                        <p className='text-xs text-slate-500'>{card.type}</p>
                    </div>
                )) : (
                    <div className="text-xs text-gray-500">Your cards will be revealed when the game starts</div>
                )}
            </div>
            );
        })}
        </div>
        
        {/* Players */}
        <div className="grid grid-cols-1 justify-start p-4 bg-slate-900 shadow">
          <h2 className=" my-2 font-bold">Players</h2>
          
          {playerData && playerData.players.map((player:any, index:number) => {
            const { email, character } = player;
            return (
              <div key={index} className={`grid grid-cols-1 justify-start ${whoseTurn?.email === email ? "bg-green-800" : ""}`}>
                <div className="p-2 flex items-center">
                  <img src={""} alt="Player Icon" className="w-8 h-8 bg-gray-200 items-center mx-5 rounded-full border-gray-700" />
                  <div>
                    <div className='font-bold'>{character}</div>
                    <div className="truncate text-xs">{email}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Actions 
          gameid={gameid}
          email={email}
          whoseTurn={whoseTurn}
          setWhoseTurn={setWhoseTurn}
          playerData={playerData} 
          gameData={gameData}
          open={open}
          setOpen={setOpen}
        />

      </div>

      <GameBoard 
        email={email}
        playerData={playerData}
        whoseTurn={whoseTurn}
        setOpen={setOpen}
      />
      
      <ClueNotes 
        email={email}
        playerData={playerData} 
      />

    </div>
  );
}
