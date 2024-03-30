"use client";
import Link from "next/link";

{ /* JoinButton Component */ }
export default function JoinButton( params : { gameid: string }) {

  const handleJoin = async () => {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        body: JSON.stringify({ lobby: params.gameid }),
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
      <Link href={'/game/' + params.gameid } onClick={handleJoin} className='text-blue-600 hover:text-blue-400 font-bold text-sm'>
        Join Game
      </Link>
    </td>
    </>
  )

}