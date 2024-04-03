"use client";
import { useEffect } from 'react';

export default function LeaveGameOnExit({ gameid, email }: { gameid: string, email: string}) {

    useEffect(() => {
      return () => {
        handleExitLobby()
      }
    }, []);
  
    const handleExitLobby = async () => {
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
    }
  
    return (<></>)
}