"use client";
import Link from "next/link";

{ /* JoinButton Component */ }
export default function JoinButton( params : { lobby: string }) {

  const handleJoin = async () => {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        body: JSON.stringify({ lobby: params.lobby }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
    
    <td className="px-6 py-4">
      <Link href={'/game-lobby/1710806066771'} onClick={handleJoin} className='text-white-500 hover:text-green-700'>
        Join Game
      </Link>
    </td>
    </>
  )

}