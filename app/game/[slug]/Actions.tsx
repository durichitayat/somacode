import React, { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

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

interface ActionsProps {
    gameid: string;
    email: string;
    whoseTurn: any;
    setWhoseTurn: (turn: string) => void; 
    playerData: any;
    gameData: any;
    open: boolean;
    setOpen: (open: boolean) => void;
  }

  export default function Actions({ gameid, email, whoseTurn, setWhoseTurn, playerData, gameData, open, setOpen }: ActionsProps) {

  const cancelButtonRef = useRef(null)

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
              playerMove: selectedSuspect + ", " + selectedWeapon, 
              playerData: playerData,
              gameData: gameData,
              whoseTurn: whoseTurn
          }),
      });
          const responseData = await response.json();
        //   const fetchedTurnData = responseData.currentTurn;
          const fetchedPlayerCoordsData = responseData.playerCoords;
          const fetchedServerResponse = responseData.result;
          const fetchedMostRecentAction = responseData.mostRecentAction;
          setPlayerCoords(fetchedPlayerCoordsData);
        //   setWhoseTurn(() => fetchedTurnData);
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
        setWhoseTurn(() => whoseTurn + 1);
        setOpen(false);

      } catch (error) {
        console.error('An error occurred:', error);
      }
  }
  

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-100">
                        Actions
                    </Dialog.Title>
                    <div className="mt-2">
                    <div className="relative my-4">
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500 text-sm"
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
                        className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500 text-sm"
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
                            className="block appearance-none w-full bg-gray-800 border border-gray-600 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500 text-sm"
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
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  
                    <button onClick={() => handleSuggest()} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:mt-0">Suggest</button>
                    <button onClick={() => handleAccuse()} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:mt-0">Accuse</button>
                    <button onClick={() => handleSkip()} className="inline-flex w-full justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ">Skip</button>

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

