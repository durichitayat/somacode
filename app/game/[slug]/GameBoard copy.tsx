/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useState, useCallback } from 'react';

const roomCoordinates: { [key: string]: { name: string } } = {
    "0,0": { name: "Study" },
    "0,2": { name: "Hall" },
    "0,4": { name: "Lounge" },
    "2,0": { name: "Library" },
    "2,2": { name: "Billiard Room" },
    "2,4": { name: "Dining Room" },
    "4,0": { name: "Conservatory" },
    "4,2": { name: "Ballroom" },
    "4,4": { name: "Kitchen" },
};

const roomImages: { [key: string]: string } = {
    "Study": "https://i5.walmartimages.com/asr/903edd24-c5f6-4b03-b337-496fe699db2b.a36e87cc654a3a629f75fa39a32e09d2.png?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "Hall": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/15847a33-c83d-44ed-a01f-7422642237d2/dflpgnm-81b177f8-85d8-49c1-b47d-edebcbff8985.png/v1/fill/w_1280,h_1291/clue_hall_hd_by_goofballgb_dflpgnm-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI5MSIsInBhdGgiOiJcL2ZcLzE1ODQ3YTMzLWM4M2QtNDRlZC1hMDFmLTc0MjI2NDIyMzdkMlwvZGZscGdubS04MWIxNzdmOC04NWQ4LTQ5YzEtYjQ3ZC1lZGViY2JmZjg5ODUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.yWk8qG63F01Nbll2N9YpL2U1_QTgMKLnxmc4DlRf-vU",
    "Lounge": "https://i.ebayimg.com/images/g/ku8AAOSweblfCBz4/s-l1200.webp",
    "Library": "https://i.ebayimg.com/00/s/MTQ0MFgxNDQw/z/oEsAAOSwvjRfCBp7/$_1.PNG",
    "Billiard Room": "https://i.ebayimg.com/images/g/Wq0AAOSw-19fB9zj/s-l400.jpg",
    "Dining Room": "https://i.ebayimg.com/images/g/in8AAOSwVZFfB~3k/s-l400.jpg",
    "Conservatory": "https://i.ebayimg.com/images/g/jPgAAOSwZE5fB~pO/s-l400.jpg",
    "Ballroom": "https://i.ebayimg.com/images/g/RLMAAOSwzLFfB9kL/s-l400.jpg",
    "Kitchen": "https://m.media-amazon.com/images/I/71DZ2INzLAL._AC_UF894,1000_QL80_.jpg",
};

interface GameBoardProps {
    playerCoords: any;
    whoseTurn: string;
    handleRoomMoveClick: (coords: [number, number]) => Promise<void>;
    gameid: string;
  }

/**
 * Renders the game board component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.playerCoords - The coordinates of the players.
 * @param {string} props.whoseTurn - The email of the player whose turn it is.
 * @param {Function} props.handleRoomMoveClick - The function to handle room move click.
 * @param {string} props.gameid - The ID of the game.
 * @returns {JSX.Element} The game board component.
 */
const GameBoard: React.FC<GameBoardProps> = ({ 
    playerCoords, 
    whoseTurn, 
    handleRoomMoveClick, 
    gameid 
  }) => {

    const [hoveredCell, setHoveredCell] = useState<number | null>(null);

    const handleMouseEnter = useCallback((index: number) => () => {
        if (hoveredCell !== index) {
            setHoveredCell(index);
        }
    }, [hoveredCell]);
    
    const handleMouseLeave = useCallback(() => {
        if (hoveredCell !== null) {
            setHoveredCell(null);
        }
    }, [hoveredCell]);

    // Function to find coordinates for a given index
    const findCoords = useCallback((index: number): [number, number] => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        return [row, col];
    }, []);

    // Function to get the emails associated with the coordinates
    const getEmailsFromCoords = useCallback((
        coords: [number, number], 
        playerCoords: { [email: string]: number[][] }): string[] => {
            const [row, col] = coords;
            const emails: string[] = [];
        
            if (!playerCoords) {
                return emails;
            }
        
            for (const [email, coordsList] of Object.entries(playerCoords)) {
                if (!coordsList) {
                    continue;
                }
            }
    
        return emails;
    }, []);

    return (
    <>
    
        {/* Game Board */}
        <div className='grid grid-cols-1 font-bold'>
            <h2 className='my-4'>Game: {gameid}</h2>
            <div className="size-fit border border-purple-800 p-5 shadow-2xl bg-slate-900 rounded-sm"> {/* 2 times wider than the left column */}
            <div className="w-max grid grid-cols-5 gap-2"> {/* 2 times wider grid */}
                {Array.from({ length: 25 }, (_, index) => {
                let coords = findCoords(index);
                const emails = getEmailsFromCoords(coords, playerCoords);
                const roomName = roomCoordinates[`${coords[0]},${coords[1]}`]?.name || '';
                const backgroundImage = roomImages[roomName];
                const renderStudySecretPassage = index === 0;
                const renderLoungeSecretPassage = index === 4;
                const renderConservatorySecretPassage = index === 20;
                const renderKitchenSecretPassage = index === 24;

                if (index === 6 || index === 8 || index === 16 || index === 18) {
                    return (
                    <div key={index} ></div> // Render a blank spot
                    );
                }
                if (index === 1 || index === 3 || index === 11 || index === 13 || index === 21 || index === 23) { // Adjust cell at index 2
                    return (
                    <div
                        key={index}
                        className={`bg-slate-800  border border-slate-600 shadow-lg w-28 h-28  p-2 text-center ${hoveredCell === index ? 'opacity-50' : ''}`}
                        // style={{ background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([1,1])}
                    >
                        <div className="font-bold">{roomName}</div>
                        <div className="flex">
                            {emails.map((email) => (
                            <img
                                key={email}
                                src="https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg" //{playerIconsInp[email]}
                                alt="Player Image"
                                className="w-10 h-10 rounded-full mr-2"
                                style={whoseTurn === email ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}
                            />
                            ))}
                        </div>
                    </div>
                    );
                }
                if (index === 5 || index === 7 || index === 9 || index === 15 || index === 17 || index === 19) {
                    return (
                    <div
                        key={index}
                        className={`bg-slate-800 w-28 h-28 border border-slate-600 shadow-lg p-2 text-center ${hoveredCell === index ? 'opacity-50' : ''}`}
                        //style={{ background: `url(${'https://mediaproxy.snopes.com/width/1200/height/1200/https://media.snopes.com/2018/07/wavy_floor_hallway_prevent_kids_running_miscaption_faux.jpg'})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([1,1])}
                    >
                        <div className="font-bold">{roomName}</div>
                        <div className="flex flex-col">
                        {emails.map((email) => (
                            <img
                                key={email}
                                src="https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg" //{playerIconsInp[email]}
                                alt="Player Image"
                                className="w-10 h-10 rounded-full mr-2"
                                style={whoseTurn === email ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}
                            />
                        ))}
                        </div>
                    </div>
                    );
                }          
                return (
                    <div 
                    key={index}
                    className="relative"
                    >
                    {renderStudySecretPassage && (
                        <div 
                        className={`absolute bottom-0 right-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -1 ? 'opacity-70' : ''}`}
                        onMouseEnter={() => handleMouseEnter(-1)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([4,4])}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left" style={{ transform: 'rotate(180deg)' }}>
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M7 7l10 10" />
                            <path d="M16 7l-9 0l0 9" />
                        </svg>
                        </div>
                    )}

                    {renderLoungeSecretPassage && (
                        <div 
                        className={`absolute bottom-0 left-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -2 ? 'opacity-70' : ''}`}
                        onMouseEnter={() => handleMouseEnter(-2)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([4,0])}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left" style={{ transform: 'rotate(270deg)' }}>
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M7 7l10 10" />
                            <path d="M16 7l-9 0l0 9" />
                        </svg>
                        </div>
                    )}

                    {renderConservatorySecretPassage && (
                        <div 
                        className={`absolute top-0 right-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -3 ? 'opacity-70' : ''}`}
                        onMouseEnter={() => handleMouseEnter(-3)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([0,4])}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left" style={{ transform: 'rotate(90deg)' }}>
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M7 7l10 10" />
                            <path d="M16 7l-9 0l0 9" />
                        </svg>
                        </div>
                    )}

                    {renderKitchenSecretPassage && (
                        <div 
                        className={`absolute top-0 left-0 w-10 h-10 bg-gray-300 flex justify-center items-center cursor-pointer z-10 transition-opacity duration-300 ${hoveredCell === -4 ? 'opacity-70' : ''}`}
                        onMouseEnter={() => handleMouseEnter(-4)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([0,0])}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-left">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M7 7l10 10" />
                            <path d="M16 7l-9 0l0 9" />
                        </svg>
                        </div>
                    )}

                    <div 
                        className={`w-28 h-28 wborder p-2 text-center items-center  ${hoveredCell === index ? 'opacity-50' : ''}`}
                        style={{ background: `url(${backgroundImage})`, backgroundPosition: 'center', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomMoveClick([1,1])}
                    >
                        <div className="text-xs text-center font-bold bg-black/90 py-2">{roomName}</div>
                        <div className="flex text-xl text-red-700">
                        {emails.map((email) => (
                            <img
                                key={email}
                                src="https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg" //{playerIconsInp[email]}
                                alt="Player Image"
                                className="w-10 h-10 rounded-full mr-2"
                                style={whoseTurn === email ? { filter: 'drop-shadow(0 0 5px lime)' } : {}}
                            />
                            ))}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        </div>

    </>
    );
}

export default GameBoard;
