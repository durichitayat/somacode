'use client';
import { useState, useEffect } from 'react';

export default function Clueless({ gameid, email }: { gameid: string, email: string }) {
  const [whoseTurn, setWhoseTurn] = useState<number>();
  const [yourMove, setYourMove] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid,
          email: "fetchStatus",
          playerMove: "fetchStatus"
        }),
      });
      const data = await response.json();
      console.log("server response: ", data);
      setWhoseTurn(() => data);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setWhoseTurn(() => -1);
      setInputValue('');
    }
  }

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 5000);

    // Clear the interval on component unmount or before creating a new interval
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once on mount

  const handleMoveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          playerMove: inputValue
        }),
      });
      const data = await response.json();
      console.log("server response: ", data);
      setYourMove(() => "Your move: " + inputValue + " Server response: " + data);
      setInputValue('');
    } catch (error) {
      console.error('An error occurred:', error);
      setYourMove(() => 'An error occurred: ' + error);
      setInputValue('');
    }
  };
 
  return (
    <div>
      <div>
        {whoseTurn}
      </div>
      <div>
        {yourMove}
      </div>
      <form onSubmit={handleMoveSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Your move goes here..."
          style={{ color: 'black' }}
          disabled={true} // @todo: disable/enable chat based on if it's your turn or not
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};