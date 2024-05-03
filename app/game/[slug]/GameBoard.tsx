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
    playerCoords: any;
    whoseTurn: string | undefined;
    handleRoomMoveClick: (y:number, x:number) => Promise<void>;
    gameid: string;
    gameData: any;
  }

const GameBoard: React.FC<GameBoardProps> = ({ 
    playerCoords, 
    whoseTurn, 
    handleRoomMoveClick, 
    gameid, 
    gameData
  }) => {

    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (gameData && gameData.game) {
            setPlayers(gameData.game);
        }
    }, [gameData]);

    // console.log(gameData);

    return (
        <>
        <div className="grid col-1">
            <h3 className="text-center text-2xl font-bold text-purple-700 py-3">Game Board</h3>
            <div className="grid grid-cols-5 gap-0 border border-purple-700 shadow-2xl">
            {rooms.map((room, index) => (
                <div key={index} className="">
                    {room?.img !== null ?
                        ( 
                            
                            <>
                                {/* if Player xcoord and ycoord match room x and y, then show player */}
                                <div className="relative cursor-pointer bg-white">
                                    <img src={room?.img} alt={room?.name || ""} className="w-28 h-28 object-cover " />
                                    <p className="absolute inset-0 flex items-center justify-center text-center opacity-0 shadow hover:opacity-100 hover:bg-purple-800 transition-all text-xs">{room.name}</p>

                                    {players.map((player, playerIndex) => {
                                        if (player.xcoord === room.x && player.ycoord === room.y) {
                                            return (
                                                <div key={playerIndex} className=" absolute top-0 left-0 w-full h-full items-center justify-center text-center text-xs bg-black/70 flex">
                                                    <div className=" bg-purple-700 w-4 h-4 rounded-full mx-1"></div>
                                                    <div>{player.character}</div>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
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
