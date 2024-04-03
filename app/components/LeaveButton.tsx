"use client";

{ /* LeaveButton Component */ }
export default function LeaveButton({ gameid, email }: { gameid: string, email: string}) {

  const handleLeave = async () => {
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          remove: true
        }),
      });
      const data = await response.json();
      console.log("player removed: ", data.message);

      window.location.replace(`/dashboard`);
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
    
    <td className="px-6 py-4">
      <button onClick={handleLeave} className='py-2.5 px-5 text-white bg-red-700 hover:bg-red-600 rounded-full self-auto'>
        Leave Game
      </button>
    </td>
    </>
  )

}