'use client' 

export default function NewGameButton() {

  const handleNewGame = async () => {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test' }),
      });
      const data = await response.json();
      const gameID = data.message;
      console.log('New game created with ID:', gameID);

      // Redirect to the new game lobby
      window.location.replace(`/game/${gameID}`);
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
      <button onClick={handleNewGame} className='py-2.5 px-5 text-white bg-pink-700 hover:bg-pink-600 rounded-full'>
        New Game
      </button>
    </>
  )
}