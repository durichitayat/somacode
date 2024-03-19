"use client";
import Link from "next/link";

{ /* NewGameButton Component */ }
export default function NewGameButton() {

  const handleNewGame = async () => {
    try {
      const response = await fetch('/api/lobby', {
        method: 'GET',
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const createSlug = () => {
    const timestamp = Date.now();
    return '/game-lobby/' + timestamp;
  }

  return (
    <>
    
    <Link href={'/game-lobby/1710806066771'} onClick={handleNewGame} className='text-green-500 hover:text-white-700'>
      New Game
    </Link>
    </>
  )

}