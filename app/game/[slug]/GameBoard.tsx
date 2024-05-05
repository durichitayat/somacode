/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useState, useCallback, useEffect } from 'react';

const rooms = [
    { name: "Study", 
        y: 0, 
        x: 0, 
        img: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/15847a33-c83d-44ed-a01f-7422642237d2/dflpgnm-81b177f8-85d8-49c1-b47d-edebcbff8985.png/v1/fill/w_1280,h_1291/clue_hall_hd_by_goofballgb_dflpgnm-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI5MSIsInBhdGgiOiJcL2ZcLzE1ODQ3YTMzLWM4M2QtNDRlZC1hMDFmLTc0MjI2NDIyMzdkMlwvZGZscGdubS04MWIxNzdmOC04NWQ4LTQ5YzEtYjQ3ZC1lZGViY2JmZjg5ODUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.yWk8qG63F01Nbll2N9YpL2U1_QTgMKLnxmc4DlRf-vU" }, 
    { name: null, 
        y: 0, 
        x: 1, 
        img: "/board/passage.png" }, 
    { name: "Hall", 
        y: 0, 
        x: 2,
        img: "https://i5.walmartimages.com/asr/903edd24-c5f6-4b03-b337-496fe699db2b.a36e87cc654a3a629f75fa39a32e09d2.png?odnHeight=768&odnWidth=768&odnBg=FFFFFF" },
    { name: null, 
        y: 0, 
        x: 3, 
        img: "/board/passage.png" }, 
    { name: "Lounge", 
        y: 0, 
        x: 4, 
        img: "https://i.ebayimg.com/images/g/ku8AAOSweblfCBz4/s-l1200.webp" },  
    { name: null, 
        y: 1, 
        x: 0, 
        img: "/board/passage.png" }, 
    { name: null, 
        y: 1, 
        x: 1, 
        img: null }, 
    { name: null, 
        y: 1, 
        x: 2, 
        img: "/board/passage.png" }, 
    { name: null, 
        y: 1, 
        x: 3, 
        img: null }, 
    { name: null, 
        y: 1, 
        x: 4, 
        img: "/board/passage.png" }, 
    { name: "Library", 
        y: 2, 
        x: 0,  
        img: "https://i.ebayimg.com/00/s/MTQ0MFgxNDQw/z/oEsAAOSwvjRfCBp7/$_1.PNG" },
    { name: null, 
        y: 2, 
        x: 1, 
        img: "/board/passage.png" }, 
    { name: "Billiard Room", 
        y: 2,
        x: 2,
        img: "https://i.ebayimg.com/images/g/Wq0AAOSw-19fB9zj/s-l400.jpg" },
    { name: null, 
        y: 2, 
        x: 3, 
        img: "/board/passage.png" }, 
    { name: "Dining Room", 
        y: 2, 
        x: 4, 
        img: "https://i.ebayimg.com/images/g/in8AAOSwVZFfB~3k/s-l400.jpg" },
    { name: null, 
        y: 3, 
        x: 0, 
        img: "/board/passage.png" }, 
    { name: null, 
        y: 3, 
        x: 1, 
        img: null }, 
    { name: null, 
        y: 3, 
        x: 2, 
        img: "/board/passage.png" }, 
    { name: null, 
        y: 3, 
        x: 3, 
        img: null }, 
    { name: null, 
        y: 3, 
        x: 4, 
        img: "/board/passage.png" }, 
    { name: "Conservatory", 
        y: 4, 
        x: 0, 
        img: "https://i.ebayimg.com/images/g/jPgAAOSwZE5fB~pO/s-l400.jpg" },
    { name: null, 
        y: 4, 
        x: 1, 
        img: "/board/passage.png" }, 
    { name: "Ballroom", 
        y: 4, 
        x: 2,  
        img: "https://i.ebayimg.com/images/g/RLMAAOSwzLFfB9kL/s-l400.jpg" },
    { name: null, 
        y: 4, 
        x: 3, 
        img: "/board/passage.png" }, 
    { name: "Kitchen", 
        y: 4, 
        x: 4, 
        img: "https://m.media-amazon.com/images/I/71DZ2INzLAL._AC_UF894,1000_QL80_.jpg" },
]

interface Player {
    playerid: string;
    email: string;
    gameid: string;
    winner: null | boolean;
    created_at: string;
    updated_at: string;
    turnorder: number;
    xcoord: number;
    ycoord: number;
    cards: string[];
    character: string;
    active: boolean;
  }

interface GameBoardProps {
    playerData: any;
    email: string;
    whoseTurn: any;
    setOpen: any;
  }

function isWithinOneBlock(player: any, room: any) {
    const dx = Math.abs(player.xcoord - room.x);
    const dy = Math.abs(player.ycoord - room.y);

    return dx <= 1 && dy <= 1;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
    playerData, 
    email,
    whoseTurn, 
    setOpen
  }) => {

    // console.log("whoseTurn: ", whoseTurn);

    // Move player Function
const handleRoomMoveClick = async (y: number, x: number, email: string, gameid: string) => {
    try {
      const response = await fetch('/api/game/move', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          gameid: gameid, 
          email: email,
          y: y,
          x: x,
        }),
      });
      const data = await response.json();
      console.log("data: ", data.message);
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      return data.message;
    } catch (error) {
      console.error('An error occurred:', error);
      return error;
    }
};

    // Create a lookup object for players based on their coordinates
    let playersLookup = {};
    if (playerData && playerData.players) {
        playersLookup = playerData.players.reduce((acc: any, player: any) => {
            // console.log("player: ", player);    
            const key = `${player.xcoord}-${player.ycoord}`;
            acc[key] = player;
            return acc;
        }, {});
    }

    return (
        <>
        <div className="grid col-1">
            <div className="grid grid-cols-5 gap-0 border border-purple-700 shadow-2xl">


            {rooms.map((room, index) => (
            // console.log("room: ", room),
            <div key={index} className="bg-white">
                {room?.img !== null ?
                ( 
                <>
                <a 
                    className={`relative ${whoseTurn?.email === email && isWithinOneBlock(whoseTurn, room) ? "cursor-pointer" : ""}`}
                    onClick={
                        whoseTurn?.email === email && isWithinOneBlock(whoseTurn, room)
                        ? async () => { 
                            const result = await handleRoomMoveClick(room.y, room.x, email, playerData.gameid);
                            setOpen(true)
                        }
                        : () => {}
                    }>
                    <img src={room?.img} alt={room?.name || ""} className="w-28 h-28 object-cover " />
                    

                    {/* Check if there's a player in the current room */}
                    {playersLookup[`${room.x}-${room.y}`] && (
                    <div className="z-10 absolute top-0 left-0 w-full h-full items-center justify-center text-center text-xs bg-black/70 flex">
                        <div className={`w-4 h-4 rounded-full mx-1 ${whoseTurn?.email === playersLookup[`${room.x}-${room.y}`]?.email ? "bg-green-500" : "bg-purple-500"}`}></div>
                        <div>{playersLookup[`${room.x}-${room.y}`].character}</div>
                    </div>
                    )}
                    <p className={`z-20 inline-flex h-full w-full absolute inset-0 items-center justify-center text-center opacity-0 shadow hover:opacity-100 transition delay-75 duration-300 ease-in-out text-xs ${whoseTurn?.email === email && isWithinOneBlock(whoseTurn, room) ? "hover:bg-green-600" : "hover:bg-gray-500"}  `}>{room.name}</p>
                </a>
                </>
                ) : (
                    <div className="w-28 h-28 bg-gray-300"></div>
                )
                }
            </div>
            ))}
        </div>

    
        </div>
        </>
    );
}

export default GameBoard;
