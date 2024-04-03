"use client";

{ /* JoinButton Component */ }
export default function JoinButton({ gameid, email }: { gameid: string, email: string}) {

  const handleJoin = async () => {
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          remove: false
        }),
      });
      const data = await response.json();
      console.log("player added: ", data.message);

      window.location.replace(`/lobby/${gameid}`);
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  // Before rendering the component, check if the data needed is available
  if (!gameid || !email) {
    return (
      <td className="px-6 py-4">
        <button className='py-2.5 px-5 text-white bg-gray-300 rounded-full self-auto'>
          Checking...
        </button>
      </td>
    ); // or a loading spinner, or some placeholder content
  }

  return (
    <>
    
    <td className="px-6 py-4">
      <button onClick={handleJoin} className='py-2.5 px-5 text-white bg-pink-700 hover:bg-pink-600 rounded-full self-auto'>
        Join Game
      </button>
    </td>
    </>
  )

}