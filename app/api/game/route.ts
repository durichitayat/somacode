import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

/***************
 * This is more of a proof of concept than anything.
 * Page updates every 5 seconds by sending a "fetchstatus" POST to this API.
 * API then returns the turncount.
 * This turncount can be incremented by any player sending anything in the chatbox.
 * This shows that the text-based Clueless game can be seamlessly updated and demonstrates how to interact with the API.
 * 
 * As a reminder, our APIs are REST so we don't save state other than in the database.
 * So every call to this API must contain the gameid, email (user intentifier), and playerMove (gives insight into the player's move)
 ***************/

export async function POST(request: Request) {
  try {
    const { gameid, email, playerMove }: GameRequestBody = await request.json();
    console.log("email:", email, "playerMove:", playerMove);

    let playerEmail: string | null = null; // Declare playerEmail here and initialize as null
    let playerCoordsRet: any = null; // Declare playerCoordsRet here and initialize as null or the appropriate type

    if (email.toLowerCase() === "fetchstatus" && playerMove.toLowerCase() === "fetchstatus") {
      const { rows: currentTurn } = await sql`SELECT CurrentTurn FROM Games WHERE gameid = ${gameid} LIMIT 1`;
      playerCoordsRet = await getAllPlayerCoords(gameid);
      const { rows: playerEmailRows } = await sql`
        SELECT email
        FROM Players
        WHERE gameid = ${gameid}
        AND TurnOrder = ${currentTurn[0].currentturn}
        LIMIT 1;`;
      if (playerEmailRows.length > 0) {
        playerEmail = playerEmailRows[0].email;
      }
      return NextResponse.json({ currentTurn: playerEmail, playerCoords: playerCoordsRet }, { status: 200 });
    }

    if (!(await isPlayerTurn(gameid, email))) {
      const { rows: currentTurn } = await sql`SELECT CurrentTurn FROM Games WHERE gameid = ${gameid} LIMIT 1`;
      playerCoordsRet = await getAllPlayerCoords(gameid);
      const { rows: playerEmailRows } = await sql`
        SELECT email
        FROM Players
        WHERE gameid = ${gameid}
        AND TurnOrder = ${currentTurn[0].currentturn}
        LIMIT 1;`;
      if (playerEmailRows.length > 0) {
        playerEmail = playerEmailRows[0].email;
      }
      return NextResponse.json({ result: "Sorry, it's not your turn.", currentTurn: playerEmail, playerCoords: playerCoordsRet }, { status: 200 });
    }

    if (playerMove.toLowerCase().startsWith("suggest")) {
      const suggestionResult = await makeSuggestion(gameid, email, playerMove.substring(8).trim());
      return NextResponse.json({ result: suggestionResult, currentTurn: playerEmail, playerCoords: playerCoordsRet });
    }

    if (playerMove.toLowerCase().startsWith("accuse")) {
      const accusationResult = await makeAccusation(gameid, email, playerMove.substring(7).trim());
      return NextResponse.json({ result: accusationResult, currentTurn: playerEmail, playerCoords: playerCoordsRet });
    }

    // Handle other cases similarly, ensuring playerEmail and playerCoordsRet are assigned before use.

  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { gameid, email } = await request.json();

    let playerEmail: string | null = null; // Declare playerEmail here and initialize as null
    let playerCoordsRet: any = null; // Declare playerCoordsRet here and initialize as null or the appropriate type

    const playerCardsRet = await getPlayerCards(email);
    playerCoordsRet = await getAllPlayerCoords(gameid);
    return NextResponse.json({ playerCards: playerCardsRet, playerCoords: playerCoordsRet }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

type GameRequestBody = {
  gameid: string;
  email: string;
  playerMove: string;
};

const allClueCards: string[][] = [
  ['Weapon', 'Revolver'],
  ['Weapon', 'Candlestick'],
  ['Weapon', 'Knife'],
  ['Weapon', 'Lead Pipe'],
  ['Weapon', 'Wrench'],
  ['Weapon', 'Rope'],
  ['Suspect', 'Miss Scarlet'],
  ['Suspect', 'Professor Plum'],
  ['Suspect', 'Mrs. Peacock'],
  ['Suspect', 'Mr. Green'],
  ['Suspect', 'Colonel Mustard'],
  ['Suspect', 'Mrs. White'],
  ['Room', 'Kitchen'],
  ['Room', 'Ballroom'],
  ['Room', 'Conservatory'],
  ['Room', 'Dining Room'],
  ['Room', 'Billiard Room'],
  ['Room', 'Library'],
  ['Room', 'Lounge'],
  ['Room', 'Hall'],
  ['Room', 'Study']
];

const hallways: number[][] = [
  [1, 0],
  [3, 0],
  [0, 1],
  [2, 1],
  [4, 1],
  [1, 2],
  [3, 2],
  [0, 3],
  [2, 3],
  [4, 3],
  [1, 4],
  [3, 4]
]

const rooms: number[][] = [
  [0, 0],
  [2, 0],
  [4, 0],
  [0, 2],
  [2, 2],
  [4, 2],
  [0, 4],
  [2, 4],
  [4, 4]
]

const blankSpaces: number[][] = [
  [1, 1],
  [3, 1], 
  [1, 3],
  [3, 3]
]

function shuffleArray(array: string[][]): string[][] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function distributeClueCards(numberOfPlayers: number, allClueCards: string[][]): { solutionCards: string[][], playerCards: string[][][] } {
  // Create an array of arrays to hold the cards for each player
  const playerCards: string[][][] = new Array(numberOfPlayers).fill([]).map(() => []);

  // Shuffle the Clue cards
  const shuffledCards = shuffleArray(allClueCards);

  // Calculate how many cards each player should get
  const cardsPerPlayer = Math.floor((shuffledCards.length - 3) / numberOfPlayers);

  // Put away one card of each type for the solution
  const solutionCards: string[][] = [];
  const remainingCards: string[][] = [];

  for (const card of shuffledCards) {
    if (solutionCards.length < 3 && !solutionCards.some((c) => c[0] === card[0])) {
      solutionCards.push(card);
    } else {
      remainingCards.push(card);
    }
  }

  // Distribute cards to each player
  for (let i = 0; i < numberOfPlayers; i++) {
    const startIndex = i * cardsPerPlayer;
    const endIndex = (i + 1) * cardsPerPlayer;
    playerCards[i] = remainingCards.slice(startIndex, endIndex);
  }

  // Distribute any remaining cards to players starting from the first player
  let currentPlayerIndex = 0;
  for (const card of remainingCards.slice(cardsPerPlayer * numberOfPlayers)) {
    playerCards[currentPlayerIndex].push(card);
    currentPlayerIndex = (currentPlayerIndex + 1) % numberOfPlayers;
  }

  return { solutionCards, playerCards };
}

export async function getPlayerCountEmails(gameid: string): Promise<{ playerCount: number, playerEmails: string[] }> {
  try {
    // Run the SQL query to get the player count and emails
    const { rows } = await sql`
      SELECT 
        COUNT(*) as playerCount,
        ARRAY_AGG(email) as playerEmails
      FROM Players 
      WHERE gameid = ${gameid};
    `;

    const playerCount = rows[0].playercount;
    const playerEmails = rows[0].playeremails || [];

    return { playerCount, playerEmails };
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function getPlayerCards(email: string): Promise<string[][]> {
  try {
    // Run the SQL query to get the updated player information
    const updatedPlayer = await sql`
      SELECT *
      FROM Players
      WHERE email = ${email};
    `;

    // Define a regular expression to match the elements
    const regex = /\['(.*?)', '(.*?)'\]/g;

    const resultArray: string[][] = [];

    // Use a loop to extract the elements using the regex
    let match;
    while ((match = regex.exec(updatedPlayer.rows[0].cards)) !== null) {
      const [, category, value] = match;
      resultArray.push([category, value]);
    }

    return resultArray;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function setPlayerCards(playerEmails: string[], playerCards: string[][][]): Promise<void> {

  try {
    let i = 0;
    for (const email of playerEmails) {

      // Get the cards array for the current player
      const cardsArray = playerCards[i];
      const cardsString = cardsArray.map(innerArray => `ARRAY['${innerArray.join("', '")}']`).join(',');

      // Run the SQL query to update player cards
      await sql`
        UPDATE Players
        SET cards = ARRAY[${cardsString}]
        WHERE email = ${email};`;

      i++;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function setPlayerTurns(playerEmails: string[]): Promise<void> {

  try {
    let i = 1;
    for (const email of playerEmails) {
      await sql`
        UPDATE Players
        SET TurnOrder = ${i}
        WHERE email = ${email}`
      i++;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function setSolutionCards(gameid: string, solutionCards: string[][]): Promise<void> {

  try {
    const cardsString = solutionCards.map(innerArray => `ARRAY['${innerArray.join("', '")}']`).join(',');

    // Run the SQL query to update solution cards
    await sql`
      UPDATE Games
      SET solution = ARRAY[${cardsString}]
      WHERE GameID = ${gameid};`;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function getSolutionCards(gameid: string): Promise<string[][]> {
  try {
    // Run the SQL query to get the updated player information
    const solutionCards = await sql`
      SELECT *
      FROM Games
      WHERE GameID = ${gameid};
    `;

    // Define a regular expression to match the elements
    const regex = /\['(.*?)', '(.*?)'\]/g;

    const resultArray: string[][] = [];

    // Use a loop to extract the elements using the regex
    let match;
    while ((match = regex.exec(solutionCards.rows[0].cards)) !== null) {
      const [, category, value] = match;
      resultArray.push([category, value]);
    }

    return resultArray;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error
  }
}

function getRandomRooms(playerCount: number): number[][] {
  // Shuffle the rooms array to randomize the selection
  const shuffledRooms = rooms.sort(() => Math.random() - 0.5);

  // Return the specified number of room combinations
  return shuffledRooms.slice(0, playerCount);
}

export async function setSinglePlayerCoords(email: string, room: number[], gameid: string): Promise<void> {

  try {
    await sql`
      UPDATE Players
      SET XCoord = ${room[0]}, YCoord = ${room[1]}
      WHERE email = ${email} AND gameid = ${gameid}`;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function setPlayerCoords(playerEmails: string[], playerRooms: number[][], gameid: string): Promise<void> {

  try {
    if (playerEmails.length !== playerRooms.length) {
      throw new Error('Player emails and rooms arrays must have the same length');
    }

    let i = 0;
    for (const email of playerEmails) {
      await sql`
        UPDATE Players
        SET XCoord = ${playerRooms[i][0]}, YCoord = ${playerRooms[i][1]}
        WHERE email = ${email} AND gameid = ${gameid}`;

      i++;
      }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
  
}

export async function getAllPlayerCoords(gameid: string): Promise<{ [email: string]: number[][] }> {

  try {
    const playerCoords: { [email: string]: number[][] } = {};

    const playerData = await sql`
      SELECT email, XCoord, YCoord
      FROM Players
      WHERE gameid = ${gameid}`;

    for (const row of playerData.rows) {
      const email = row.email
      const XCoord = row.xcoord
      const YCoord = row.ycoord

      if (!playerCoords[email]) {
        playerCoords[email] = [];
      }

      playerCoords[email].push([XCoord, YCoord]);
    }

    return playerCoords;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
  
}

export async function getPlayerCoords(email: string, gameid: string): Promise<number[][]> {
  try {
    const playerCoords: number[][] = [];

    const playerData = await sql`
      SELECT XCoord, YCoord
      FROM Players
      WHERE gameid = ${gameid} AND email = ${email}`;

    for (const row of playerData.rows) {
      const XCoord: number = row.xcoord;
      const YCoord: number = row.ycoord;
      playerCoords.push([XCoord, YCoord]);
    }

    return playerCoords;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// if the move is allowed and the spot exists, it will execute the move and return true. otherwise, false
export async function processMove(playerMove: string, email: string, gameid: string): Promise<boolean> {
  try {

    const playerCoords = await getPlayerCoords(email, gameid);
    
    if (
      playerMove === "right" &&
      playerCoords[0][1] + 1 <= 4 &&
      !blankSpaces.some(coord => coord[0] === playerCoords[0][0] && coord[1] === playerCoords[0][1] + 1) &&
      !(await isCellOccupied(gameid, [playerCoords[0][0], playerCoords[0][1] + 1]))
    ) {
      await setSinglePlayerCoords(email, [playerCoords[0][0], playerCoords[0][1] + 1], gameid);
      return true;
    }
    if (
      playerMove === "left" &&
      playerCoords[0][1] - 1 >= 0 &&
      !blankSpaces.some(coord => coord[0] === playerCoords[0][0] && coord[1] === playerCoords[0][1] - 1) &&
      !(await isCellOccupied(gameid, [playerCoords[0][0], playerCoords[0][1] - 1]))
    ) {
      await setSinglePlayerCoords(email, [playerCoords[0][0], playerCoords[0][1] - 1], gameid);
      return true;
    }    
    if (
      playerMove === "up" &&
      playerCoords[0][0] - 1 >= 0 &&
      !blankSpaces.some(coord => coord[0] === playerCoords[0][0] - 1 && coord[1] === playerCoords[0][1]) &&
      !(await isCellOccupied(gameid, [playerCoords[0][0] - 1, playerCoords[0][1]]))
    ) {
      await setSinglePlayerCoords(email, [playerCoords[0][0] - 1, playerCoords[0][1]], gameid);
      return true;
    }    
    if (
      playerMove === "down" &&
      playerCoords[0][0] + 1 <= 4 &&
      !blankSpaces.some(coord => coord[0] === playerCoords[0][0] + 1 && coord[1] === playerCoords[0][1]) &&
      !(await isCellOccupied(gameid, [playerCoords[0][0] + 1, playerCoords[0][1]]))
    ) {
      await setSinglePlayerCoords(email, [playerCoords[0][0] + 1, playerCoords[0][1]], gameid);
      return true;
    }    

    return false;
  } catch (error) {
    // Handle any errors that might occur during processing
    console.error("Error processing move:", error);
    throw new Error("Error processing move");
  }
}

export async function isCellOccupied(gameid: string, targetCoord: number[]): Promise<boolean> {
  try {
    const playerData = await sql`
      SELECT COUNT(*)
      FROM Players
      WHERE gameid = ${gameid} AND XCoord = ${targetCoord[0]} AND YCoord = ${targetCoord[1]}`;

    const count = playerData.rows[0].count;
    const isOccupied = count > 0;

    return isOccupied;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function isPlayerTurn(gameid: string, email: string): Promise<boolean> {
  try {
    // Get the player's turn order
    const { rows: playerTurnOrder } = await sql`
      SELECT turnorder
      FROM Players
      WHERE gameid = ${gameid} AND email = ${email}
      LIMIT 1;
    `;
    
    if (playerTurnOrder.length === 0) {
      throw new Error(`Player with email ${email} not found in game with ID ${gameid}`);
    }
    
    const turnorder = playerTurnOrder[0].turnorder;

    // Get the current turn from the game
    const { rows: currentTurn } = await sql`
      SELECT currentturn
      FROM Games
      WHERE gameid = ${gameid}
      LIMIT 1;
    `;
    
    if (currentTurn.length === 0) {
      throw new Error(`Game with ID ${gameid} not found`);
    }
    
    const gameCurrentTurn = currentTurn[0].currentturn;

    // Check if player's turn matches game's current turn
    return gameCurrentTurn === turnorder;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}
const roomNames = [
  'Kitchen', 'Ballroom', 'Conservatory',
  'Dining Room', 'Billiard Room', 'Library',
  'Lounge', 'Hall', 'Study'
];

const weaponNames = [
  'Revolver', 'Candlestick', 'Knife',
  'Lead Pipe', 'Wrench', 'Rope'
];

const suspectNames = [
  'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
  'Mr. Green', 'Colonel Mustard', 'Mrs. White'
];

// Function to check if a player is in a room
async function isPlayerInRoom(gameid: string, email: string): Promise<string | null> {
  try {
    const playerData = await sql`
      SELECT XCoord, YCoord
      FROM Players
      WHERE gameid = ${gameid} AND email = ${email}`;

    const XCoord: number = playerData.rows[0].xcoord;
    const YCoord: number = playerData.rows[0].ycoord;

    // Iterate through the rooms to check if the player is in any of them
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i][0] === XCoord && rooms[i][1] === YCoord) {
        return roomNames[i];
      }
    }

    return null; // Player is not in any room
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function getPlayerRotation(gameid: string): Promise<{ playerCount: number, playerEmails: string[], currentPlayerIndex: number }> {
  try {
    // Run a SQL query to get the player rotation information
    const rotationData = await sql`
      SELECT playeremails, currentplayerindex
      FROM Games
      WHERE gameid = ${gameid}`;

    // Extract and return the player rotation information
    const playerEmails = rotationData.rows[0].playeremails;
    const currentPlayerIndex = rotationData.rows[0].currentplayerindex;
    const playerCount = playerEmails.length;
    return { playerCount, playerEmails, currentPlayerIndex };
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// Exported async function to handle making a suggestion
// Expected format of the suggestion: "suggest <suspect> with <weapon> in <room>"
export async function makeSuggestion(gameid: string, email: string, suggestion: string): Promise<string> {
  try {
    // Parse the suggestion
    const [suspect, weapon] = suggestion.split(' with ');

    // Validate the suspect and weapon
    if (!suspectNames.includes(suspect) || !weaponNames.includes(weapon)) {
      return "Invalid suggestion. Please ensure you mention a valid suspect and weapon.";
    }

    // Check if the player is in a room
    const room = await isPlayerInRoom(gameid, email);

    // Get the list of players in the game
    const { playerCount, playerEmails } = await getPlayerCountEmails(gameid);

    // Array to store players who can disprove the suggestion along with their cards
    const disprovingPlayers: { email: string, cards: string[] }[] = [];

    // Iterate through each player to check for cards matching the suggestion
    for (const playerEmail of playerEmails) {
      // Get the player's cards
      const playerCards = await getPlayerCards(playerEmail);

      // Check if the player has any cards matching the suggestion
      const matchingCards = playerCards.filter(card => card[1] === suspect || card[1] === weapon || (room && card[1] === room));

      if (matchingCards.length > 0) {
        disprovingPlayers.push({ email: playerEmail, cards: matchingCards.map(card => card[1]) });
      }
    }

    // If there are players who can disprove the suggestion, return their emails and cards
    if (disprovingPlayers.length > 0) {
      const message = disprovingPlayers.map(player => {
        return `${player.email} can disprove with card(s): ${player.cards.join(', ')}`;
      }).join('\n');
      
      return message;
    } else {
      return "No players can disprove the suggestion.";
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// Exported async function to handle making an accusation
// Expected format of the accusation: "accuse <suspect> with <weapon> in <room>"
export async function makeAccusation(gameid: string, email: string, accusation: string): Promise<string> {
  try {
    // Parse the accusation
    const [suspect, weapon, room] = accusation.split(' in ');

    // Validate the suspect, weapon, and room
    if (!suspectNames.includes(suspect) || !weaponNames.includes(weapon) || !roomNames.includes(room)) {
      return "Invalid accusation. Please ensure you mention a valid suspect, weapon, and room.";
    }

    // Check if the accusation matches the solution
    const solution = await getSolutionCards(gameid);
    const solutionSuspect = solution.find(card => card[0] === 'Suspect')?.[1];
    const solutionWeapon = solution.find(card => card[0] === 'Weapon')?.[1];
    const solutionRoom = solution.find(card => card[0] === 'Room')?.[1];

    if (solutionSuspect === suspect && solutionWeapon === weapon && solutionRoom === room) {
      // Accusation is correct
      return "Congratulations! Your accusation is correct. You win!";
    } else {
      // Accusation is incorrect
      // Remove the accusing player from the player rotation
      await updatePlayerRotation(gameid, email);
      return "Sorry, your accusation is incorrect. You're out of the game.";
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// Function to update player rotation after a wrong accusation
async function updatePlayerRotation(gameid: string, email: string): Promise<void> {
  try {
    // Get the current player rotation
    const { playerCount, playerEmails, currentPlayerIndex } = await getPlayerRotation(gameid);

    // Remove the accusing player from the player rotation
    const updatedPlayerEmails = playerEmails.filter((player: string) => player !== email);

    // Update the current player index
    let updatedCurrentPlayerIndex = currentPlayerIndex;
    if (updatedCurrentPlayerIndex >= updatedPlayerEmails.length) {
      updatedCurrentPlayerIndex = 0; // Reset to the first player if the current player index exceeds the number of players
    }

    // Update the player rotation in the database
    await begin(async (sql: any) => { // Assuming 'begin' is the method to begin a transaction
      await sql`UPDATE Games SET PlayerEmails = ${updatedPlayerEmails}, CurrentPlayerIndex = ${updatedCurrentPlayerIndex} WHERE gameid = ${gameid}`;
    });
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

function begin(arg0: (sql: any) => Promise<void>) {
  throw new Error("Function not implemented.");
}