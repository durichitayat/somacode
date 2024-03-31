"use client";

{ /* JoinButton Component */ }
export default function JoinButton({ gameid, email }: { gameid: string, email: string}) {

  const handleJoin = async () => {
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email 
        }),
      });
      const data = await response.json();
      console.log("player added: ", data.message);

      window.location.replace(`/lobby/${gameid}`);
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
    
    <td className="px-6 py-4">
      <button onClick={handleJoin} className='text-blue-500 hover:text-blue-700 text-sm'>
        Join Game
      </button>
    </td>
    </>
  )

}