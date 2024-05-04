import { useState } from 'react';

type NotesGrid = boolean[][];

export default function ClueNotes(playerData: any) {

    console.log("ClueNotes.tsx playerData: ", playerData)

    const numPlayers = playerData && playerData.players ? playerData.players.length : 0;

    const [notes, setNotes] = useState<NotesGrid>(
      Array.from({ length: 21 }, () => Array.from({ length: numPlayers }, () => false))
    );

    const handleNotesClick = (rowIndex: number, colIndex: number): void => {
        const updatedNotes: NotesGrid = [...notes];
        updatedNotes[rowIndex][colIndex] = !updatedNotes[rowIndex][colIndex];
        setNotes(updatedNotes);
      };
    

    return (
    <>

        {/* CLUE NOTES */}

        {/* {isClueNotesOpen ? (
            <div className="absolute top-0 right-0 z-10 p-4">
            <button onClick={() => setIsClueNotesOpen(false)} className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
                <span className="mr-2">Hide Clue Notes</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="flex items-center justify-center bg-gray-800 min-h-screen">
                <table className="table-auto border-collapse border-gray-600">
                <tbody>
                    <tr>
                    <td className="p-2"></td>
                    {Object.values(playerIconsInp).map((playerIcon, index) => (
                        <td key={index} className="p-2 text-center">
                        <img src={playerIcon} alt={`Player ${index + 1}`} className="h-8 w-8" />
                        </td>
                    ))} 
                    </tr>
                    <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                        Suspects
                    </th>
                    </tr>
                    
                    {notes.slice(0, 6).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className="p-2 text-right">{suspectNames[rowIndex]}</td>
                        {row.slice(0, numPlayers).map((cell, colIndex) => (
                        <td
                            key={colIndex}
                            onClick={() => handleNotesClick(rowIndex, colIndex)}
                            className={`w-12 h-12 border border-gray-600 text-center text-white ${
                            cell ? 'bg-blue-500' : ''
                            }`}
                        >
                            {cell ? 'X' : ''}
                        </td>
                        ))} 
                    </tr>
                    ))}


                    <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                        Weapons
                    </th>
                    </tr>
                    {notes.slice(6, 12).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className="p-2 text-right">{weaponNames[rowIndex]}</td>
                        {row.slice(0, numPlayers).map((cell, colIndex) => (
                        <td
                            key={colIndex}
                            onClick={() => handleNotesClick(rowIndex + 6, colIndex)}
                            className={`w-12 h-12 border border-gray-600 text-center text-white ${
                            cell ? 'bg-blue-500' : ''
                            }`}
                        >
                            {cell ? 'X' : ''}
                        </td>
                        ))}
                    </tr>
                    ))}
                    <tr>
                    <th colSpan={numPlayers + 1} className="bg-gray-700 text-white py-2">
                        Rooms
                    </th>
                    </tr>
                    {notes.slice(12, 21).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className="p-2 text-right">{roomNames[rowIndex]}</td>
                        {row.slice(0, numPlayers).map((cell, colIndex) => (
                        <td
                            key={colIndex}
                            onClick={() => handleNotesClick(rowIndex + 12, colIndex)}
                            className={`w-12 h-12 border border-gray-600 text-center text-white ${
                            cell ? 'bg-blue-500' : ''
                            }`}
                        >
                            {cell ? 'X' : ''}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        ) : (
            <div className="absolute bottom-0 right-0 z-10 p-2">
            <button onClick={() => setIsClueNotesOpen(true)} className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
                <span className="ml-2 mr-1">Clue Notes</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 17a1 1 0 0 1-.707-.293l-6-6a1 1 0 1 1 1.414-1.414L10 14.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6A1 1 0 0 1 10 17z" clipRule="evenodd" />
                </svg>
            </button>
            </div>
        )} */}
    </>
)}