import React, { useState } from 'react';

const suspectNames = [
'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
'Mr. Green', 'Colonel Mustard', 'Mrs. White'
]
  
const roomNames = [
'Kitchen', 'Ballroom', 'Conservatory', 'Dining room',
'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study'
];

const weaponNames = [
'Revolver', 'Candlestick', 'Knife',
'Lead Pipe', 'Wrench', 'Rope'
];

export default function Actions(gameid:string, email:string, setWhoseTurn:any) {

    const [serverResponse, setServerResponse] = useState<string>('');
    const [mostRecentAction, setMostRecentAction] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [playerCoords, setPlayerCoords] = useState<{ [email: string]: number[][] }> ();

    // ACCUSE STATE
    const [selectedSuspect, setSelectedSuspect] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedWeapon, setSelectedWeapon] = useState('');

    // ACCUSE FUNCTIONS
    const handleSuggest = async () => {
        try {
        const response = await fetch('/api/game', {
            method: 'POST',
            body: JSON.stringify({ 
                gameid: gameid, 
                email: email,
                playerMove: selectedSuspect + ", " + selectedWeapon
            }),
        });
            const responseData = await response.json();
            const fetchedTurnData = responseData.currentTurn;
            const fetchedPlayerCoordsData = responseData.playerCoords;
            const fetchedServerResponse = responseData.result;
            const fetchedMostRecentAction = responseData.mostRecentAction;
            setPlayerCoords(fetchedPlayerCoordsData);
            setWhoseTurn(() => fetchedTurnData);
            setServerResponse(() => fetchedServerResponse);
            setMostRecentAction(() => fetchedMostRecentAction);
            setInputValue('');
        } catch (error) {
            console.error('An error occurred:', error);
            setServerResponse(() => 'An error occurred: ' + error);
            setInputValue('');
        }
    }
    
    const handleAccuse = async () => {
        try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({ 
            gameid: gameid, 
            email: email,
            playerMove: selectedSuspect + ", " + selectedWeapon + ", " + selectedRoom
            }),
        });
            const responseData = await response.json();
            const fetchedTurnData = responseData.currentTurn;
            const fetchedPlayerCoordsData = responseData.playerCoords;
            const fetchedServerResponse = responseData.result;
            const fetchedMostRecentAction = responseData.mostRecentAction;
            setPlayerCoords(fetchedPlayerCoordsData);
            setWhoseTurn(() => fetchedTurnData);
            setServerResponse(() => fetchedServerResponse);
            setMostRecentAction(() => fetchedMostRecentAction);
            setInputValue('');
        } catch (error) {
            console.error('An error occurred:', error);
            setServerResponse(() => 'An error occurred: ' + error);
            setInputValue('');
        }
    }

    const handleSkip = async () => {
        try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({ 
            gameid: gameid, 
            email: email,
            playerMove: "no"
            }),
        });
        const responseData = await response.json();
        const fetchedTurnData = responseData.currentTurn;
        const fetchedPlayerCoordsData = responseData.playerCoords;
        const fetchedServerResponse = responseData.result;
        const fetchedMostRecentAction = responseData.mostRecentAction;
        setPlayerCoords(fetchedPlayerCoordsData);
        setWhoseTurn(() => fetchedTurnData);
        setServerResponse(() => fetchedServerResponse);
        setMostRecentAction(() => fetchedMostRecentAction);
        setInputValue('');
        } catch (error) {
        console.error('An error occurred:', error);
        setServerResponse(() => 'An error occurred: ' + error);
        setInputValue('');
        }
    }

    return (
        <>
        <div className="grid grid-cols-1 justify-start p-4 bg-slate-900 shadow">

            {/* Room Dropdown */}
            <h2 className="my-2 font-bold">Actions</h2>
            <div className="relative my-4">
            <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
            >
                <option className="text-gray-800 bg-gray-300">Select Room</option>
                {roomNames.map((name, index) => (
                <option key={index} value={name}>{name}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
                </svg>
            </div>
            </div>

            {/* Suspect Dropdown */}
            <div className="relative mb-4">
            <select
                value={selectedSuspect}
                onChange={(e) => setSelectedSuspect(e.target.value)}
                className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
            >
                <option className="text-gray-800 bg-gray-300">Select Suspect</option>
                {suspectNames.map((name, index) => (
                <option key={index} value={name}>{name}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
                </svg>
            </div>
            </div>

            {/* Weapon Dropdown */}
            <div className="relative mb-4">
            <select
                value={selectedWeapon}
                onChange={(e) => setSelectedWeapon(e.target.value)}
                className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
            >
                <option className="text-gray-800 bg-gray-300">Select Weapon</option>
                {weaponNames.map((name, index) => (
                <option key={index} value={name}>{name}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 12h-3l4-4 4 4h-3v4h-2v-4z"/>
                </svg>
            </div>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
            <button onClick={() => handleSuggest()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Suggest</button>
            <button onClick={() => handleAccuse()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Accuse</button>
            <button onClick={() => handleSkip()} className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">Skip</button>
            </div>

            </div>
        </>
    )
}