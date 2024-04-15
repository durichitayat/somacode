import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * This is more of a proof of concept than anything.
  * Page updates every 5 seconds by sending a "fetchstatus" POST to this API.
  * API then returns the turncount.
  * This turncount can be incremented by any player sending anything in the chatbox.
  * This shows that the text-based Clueless game can be seamlessly updated and demonstrates how to interact with the API.
  * 
  * As a reminder, our APIs are REST so we don't save state other than in the database.
  * So every call to this API must contain the gameid, email (user intentifier), and playerMove (gives insight into the player's move)
  ***************/}

export async function POST (request: Request) { // this will contain most game logic so keep it tidy! functions wherever you can

  try {

    // get player move info and log
    const { gameid, email, playerMove }: GameRequestBody = await request.json();
    console.log("email: ", email, "playerMove: ", playerMove);

    // get current player's turn info and player coords at start b/c it will get used in a lot of cases
    let playerTurnEmail = await whoseTurnIsIt(gameid);
    let playerCoords = await getAllPlayerCoords(gameid);

    // if it's a fetchStatus call (representing a 5 sec refresh), return the turn count and all player locations
    // @todo change it so that we don't have to send all player locations, only the most recent
    if (email.toLowerCase() === "fetchstatus" && playerMove.toLowerCase() === "fetchstatus") {
      return NextResponse.json({ result: "Refresh...", currentTurn: playerTurnEmail, playerCoords: playerCoords }, {status: 200});
    }

    // if it's not their turn, tell them so
    if (!(await isPlayerTurn(gameid, email))) {
      return NextResponse.json({ result: "Sorry, it's not your turn.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, {status: 200});
    }

    if ((await getGameStatus(gameid)) === "move?") {

      // input is a player move, so process it
      const movePlayerSuccess = await processPlayerMove(playerMove.toLowerCase(), email, gameid);

      // if move is valid (meaning both good input and the space is available)
      if (movePlayerSuccess) {
        playerCoords = await getAllPlayerCoords(gameid);
        if ((await isPlayerInRoom(gameid, email)) !== null) { // divert game flow to allow player to make a suggestion if player is in a room
          await setGameStatus(gameid, 'suggest?');
          return NextResponse.json({ result: "Success. Would you like to make a suggestion? Give it in the format 'suspect, weapon'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
        }
        await setGameStatus(gameid, 'accuse?');
        return NextResponse.json({ result: "Success. Would you like to make an accusation? Give it in the format 'suspect, weapon, room'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      return NextResponse.json({ result: "Sorry, invalid input. Please enter 'right', 'left', 'up', 'down'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });

    }

    if ((await getGameStatus(gameid)) === "suggest?") { // for minimal increment, showing cards after a suggestion is automatic. it chooses one random refutal card if they have one. @todo in target, we will allow players to choose which card they'd like to show the suggestor

      if (playerMove.toLowerCase() === "no") { // player opted not to suggest. change game state to "accuse?"
        await setGameStatus(gameid, 'accuse?');
        return NextResponse.json({ result: "Okay! Would you like to make an accusation? Give it in the format 'suspect, weapon, room'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      const suggestionResult = await processPlayerSuggestion(playerMove.toLowerCase(), email, gameid);

      if (suggestionResult === "invalid") {
        return NextResponse.json({ result: "Sorry, invalid input. Give your suggestion in the format 'suspect, weapon'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      await setGameStatus(gameid, 'accuse?');
      playerCoords = await getAllPlayerCoords(gameid);
      return NextResponse.json({ result: suggestionResult + "Would you like to make an accusation? Give it in the format 'suspect, weapon, room'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
    }

    if ((await getGameStatus(gameid)) === "accuse?") {

      if (playerMove.toLowerCase() === "no") { // player opted not to accuse. change game state to "move?" and update turn
        await setGameStatus(gameid, 'move?');
        playerTurnEmail = await updateTurn(gameid);
        return NextResponse.json({ result: "Okay! Your opponents are playing ...", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      const accusationResult = await processPlayerAccusation(playerMove.toLowerCase(), email, gameid);

      if (accusationResult === "invalid") {
        return NextResponse.json({ result: "Sorry, invalid input. Give your accusation in the format 'suspect, weapon, room'. Otherwise, reply with 'no'.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      if (accusationResult === "false") {
        await deactivatePlayer(gameid, email);
        playerTurnEmail = await updateTurn(gameid);
        await setGameStatus(gameid, 'move?');
        if (await isGameOver(gameid, email)) {
          // set SolutionRevealed BOOLEAN in the Games table to true
          // change gameState to 'done'
          // don't accept any more inputs
          // display to the rest of players who has won and what the solution was
          return NextResponse.json({ result: "You lost, and the game is over.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
        }
        return NextResponse.json({ result: "You lost.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }

      if (accusationResult === "true") {
        // set SolutionRevealed BOOLEAN in the Games table to true
        // change gameState to 'done'
        // don't accept any more inputs
        // display to the rest of players who has won and what the solution was
        return NextResponse.json({ result: "You won!", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });
      }
    }

    // if you've made it to the end, then something went wrong. invalid game state maybe?
    return NextResponse.json({ result: "Sorry, something went wrong.", currentTurn: playerTurnEmail, playerCoords: playerCoords }, { status: 200 });

  } catch (error) {
    console.log(error)
    return NextResponse.json({error}, {status: 500});
  }

}

export async function PUT (request: Request) {

  try {

    const { gameid, email } = await request.json();

    // if this is host, then set up everyone's turn order, character, and distribute cards
    const { rows: game } = await sql`SELECT * FROM Games WHERE gameid = ${gameid} LIMIT 1`;
    if ((game[0].gameowner === email ?? "") && game[0].gamestate == 'open') {

      const { playerCount, playerEmails } = await getPlayerCountEmails(gameid);

      // close the game state from new players joining and set TurnCount
      // anything that isn't 'open' corresponds to 'closed'. we use this field to indicate what type of turn a player can make. we always start with a move
      await sql`
        UPDATE Games
        SET GameState = 'move?', TurnCount = ${playerCount}
        WHERE GameID = ${gameid}`;

      const { solutionCards, playerCards, playerCharacters } = distributeClueCards(playerCount, allClueCards);

      await setSolutionCards(gameid, solutionCards);
      await setPlayerCards(playerEmails, playerCards);
      await setPlayerTurns(playerEmails);
      await setPlayerCharacters(playerEmails, playerCharacters);

      const playerRooms = getRandomRooms(playerCount);
      await setPlayerCoords(playerEmails, playerRooms, gameid);

    }

    // fetch the cards at $email plus player locations and return them to the game component
    const playerCardsRet = await getPlayerCards(email);
    const playerCoordsRet = await getAllPlayerCoords(gameid);
    const playerCharactersRet = await fetchPlayersWithCharacters(gameid);
    return NextResponse.json({ playerCards: playerCardsRet, playerCoords: playerCoordsRet, playerCharacters : playerCharactersRet }, { status: 200 });

  } catch (error) {
    return NextResponse.json({error}, {status: 500});
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

function distributeClueCards(numberOfPlayers: number, allClueCards: string[][]): { solutionCards: string[][], playerCards: string[][][], playerCharacters: string[] } {
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

  // Get 'numberOfPlayers' characters randomly
  const shuffledCharacters = suspectNamesUpper.sort(() => Math.random() - 0.5);
  const playerCharacters = shuffledCharacters.slice(0, numberOfPlayers);

  return { solutionCards, playerCards, playerCharacters };
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
        SET TurnOrder = ${i}, Active = true
        WHERE email = ${email}`
      i++;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function setPlayerCharacters(playerEmails: string[], playerCharacters: string[]): Promise<void> {

  try {
    let i = 0;
    for (const email of playerEmails) {
      await sql`
        UPDATE Players
        SET character = ${playerCharacters[i]}
        WHERE email = ${email}`
      i++;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function getPlayerCharacter(email: string): Promise<string> {
  try {
    // Run the SQL query to get the updated player information
    const updatedPlayer = await sql`
      SELECT *
      FROM Players
      WHERE email = ${email};
    `;

    return updatedPlayer.rows[0].character;
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
    while ((match = regex.exec(solutionCards.rows[0].solution)) !== null) {
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

type GameboardClueRooms = {
  [key: string]: { name: string };
};

const gameboardClueRooms: GameboardClueRooms = {
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

export async function getPlayerRoom(email: string, gameid: string): Promise<string> {
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

    const coordinateString: string = playerCoords.join(",");
    const roomAtCoordinates = gameboardClueRooms[coordinateString];

    return roomAtCoordinates.name

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// if the move is allowed and the spot exists, it will execute the move and return true. otherwise, false
export async function processPlayerMove(playerMove: string, email: string, gameid: string): Promise<boolean> {
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
  'kitchen', 'ballroom', 'conservatory', 'dining room',
  'billiard room', 'library', 'lounge', 'hall', 'study'
];

const weaponNames = [
  'revolver', 'candlestick', 'knife',
  'lead pipe', 'wrench', 'rope'
];

const suspectNames = [
  'miss scarlet', 'professor plum', 'mrs. peacock',
  'mr. green', 'colonel mustard', 'mrs. white'
];

const suspectNamesUpper = [
  'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
  'Mr. Green', 'Colonel Mustard', 'Mrs. White'
]

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

async function isPlayerActive(gameid: string, email: string): Promise<boolean> {
  try {
    const playerData = await sql`
      SELECT Active
      FROM Players
      WHERE gameid = ${gameid} AND email = ${email}`;
    const active: boolean = playerData.rows[0].active;
    return active
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

async function deactivatePlayer(gameid: string, email: string): Promise<void> {
  try {
    console.log("DEACTIVATING PLAYER:", email)
    await sql`
      UPDATE Players
      SET Active = false
      WHERE gameid = ${gameid} AND email = ${email}`;

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

async function isGameOver(gameid: string, email: string): Promise<boolean> {
  try {
    const { rows: solutionRevealed } = await sql`
      SELECT SolutionRevealed
      FROM Games
      WHERE gameid = ${gameid}
      LIMIT 1;`;

    const isSolutionRevealed = solutionRevealed.length > 0 && solutionRevealed[0].solutionrevealed === true;

    const { rows: activePlayersCount } = await sql`
      SELECT COUNT(*)
      FROM Players
      WHERE gameid = ${gameid} AND Active = true;`;
    
    const numberOfActivePlayers = activePlayersCount[0].count;

    return isSolutionRevealed || numberOfActivePlayers === 1

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

export async function processPlayerSuggestion(suggestion: string, email: string, gameid: string): Promise<string> {

  try {

    // Parse the suggestion
    const [suspect, weapon] = suggestion.split(', ');

    // Validate the suspect and weapon
    if (!suspectNames.includes(suspect.toLowerCase()) || !weaponNames.includes(weapon.toLowerCase())) {
      return "invalid";
    }

    // move suggested suspect to suggestor's square
    const { rows: playerData } = await sql`
      SELECT email
      FROM Players
      WHERE character ILIKE ${suspect} AND gameid = ${gameid}
      LIMIT 1;
    `;
    console.log(playerData)

    const suggesteeEmail = playerData.length > 0 ? playerData[0].email : null;

    if (suggesteeEmail !== null) {
      await setSinglePlayerCoords(suggesteeEmail, (await getPlayerCoords(email, gameid))[0], gameid);
    }

    const room = await getPlayerRoom(email, gameid);
    console.log("Your suggestion:", suspect, weapon, room)

    const { rows: gameData } = await sql`
      SELECT CurrentTurn, TurnCount
      FROM Games
      WHERE gameid = ${gameid}
      LIMIT 1;
    `;

    const originalTurn = gameData.length > 0 ? gameData[0].currentturn : null;
    const turnCount = gameData.length > 0 ? gameData[0].turncount : null;
    let currTurn = originalTurn + 1;
    if (currTurn > turnCount) {
      currTurn = 1;
    }

    while (currTurn != originalTurn) {
      const { rows: playerEmail } = await sql`
        SELECT email
        FROM Players
        WHERE gameid = ${gameid} AND TurnOrder = ${currTurn}
        LIMIT 1;`;
      const currPlayerEmail = playerEmail.length > 0 ? playerEmail[0].email : null;

      const currPlayerCards = await getPlayerCards(currPlayerEmail);

      let matches: string[] = [];

      for (const card of currPlayerCards) {
        const name = card[1];
  
        // Check if the card matches the suggestion
        if (name.toLowerCase() === suspect.toLowerCase() || name.toLowerCase() === weapon.toLowerCase() || name.toLowerCase() === room.toLowerCase()) {
          matches.push(name);
        }
      }

      if (matches.length > 0) {
        // If there are matches, randomly select one
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        return `Refuted! ${randomMatch} was shown. `;
      } 

      currTurn++;
      if (currTurn > turnCount) {
        currTurn = 1;
      }
    }

    return "No one could refute your suggestion! ";

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

export async function processPlayerAccusation(accusation: string, email: string, gameid: string): Promise<string> {

  try {

    // Parse the suggestion
    const [suspect, weapon, room] = accusation.split(', ');

    // Validate the suspect and weapon
    if (!suspectNames.includes(suspect.toLowerCase()) || !weaponNames.includes(weapon.toLowerCase()) || !roomNames.includes(room.toLowerCase())) {
      return "invalid";
    }

    // Check if the accusation matches the solution
    const solution = await getSolutionCards(gameid);
    const solutionSuspect = solution.find(card => card[0] === 'Suspect')?.[1];
    const solutionWeapon = solution.find(card => card[0] === 'Weapon')?.[1];
    const solutionRoom = solution.find(card => card[0] === 'Room')?.[1];

    if (solutionSuspect?.toLowerCase() === suspect?.toLowerCase() && solutionWeapon?.toLowerCase() === weapon?.toLowerCase() && solutionRoom?.toLowerCase() === room?.toLowerCase()) {
      // Accusation is correct
      return "true";
    } else {
      // Accusation is incorrect
      return "false";
    }

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}

// updates turn and returns the next player's email
async function updateTurn(gameid: string): Promise<string> {
  try {
    const { rows: updatedTurn } = await sql`
          WITH updated AS (
            UPDATE Games
            SET CurrentTurn = CurrentTurn + 1
            WHERE gameid = ${gameid}
            RETURNING CurrentTurn, TurnCount
          )
          SELECT CurrentTurn, TurnCount
          FROM updated;
        `;
    let currentTurn = updatedTurn[0].currentturn;
    if (updatedTurn[0].currentturn > updatedTurn[0].turncount) { // reset currentTurn to 1 for starting over at first player
      const { rows: updatedTurn } = await sql`
        UPDATE Games
        SET CurrentTurn = 1
        WHERE gameid = ${gameid}
        RETURNING CurrentTurn;
      `;
      currentTurn = updatedTurn[0].currentturn;
    }
    const { rows: playerEmail } = await sql`
          SELECT email
          FROM Players
          WHERE gameid = ${gameid}
          AND TurnOrder = ${currentTurn}
          LIMIT 1;`;
    let emailRet = playerEmail[0].email;
    while (!(await isPlayerActive(gameid, emailRet))) { // keep changing turns until we get to an active player
      const { rows: updatedTurn } = await sql`
          WITH updated AS (
            UPDATE Games
            SET CurrentTurn = CurrentTurn + 1
            WHERE gameid = ${gameid}
            RETURNING CurrentTurn, TurnCount
          )
          SELECT CurrentTurn, TurnCount
          FROM updated;
        `;
      let currentTurn = updatedTurn[0].currentturn;
      if (updatedTurn[0].currentturn > updatedTurn[0].turncount) { // reset currentTurn to 1 for starting over at first player
        const { rows: updatedTurn } = await sql`
          UPDATE Games
          SET CurrentTurn = 1
          WHERE gameid = ${gameid}
          RETURNING CurrentTurn;
        `;
        currentTurn = updatedTurn[0].currentturn;
      }
      const { rows: playerEmail } = await sql`
            SELECT email
            FROM Players
            WHERE gameid = ${gameid}
            AND TurnOrder = ${currentTurn}
            LIMIT 1;`;
      emailRet = playerEmail[0].email;
    }
    console.log("IT IS NOW", emailRet, "'S TURN!")
    return emailRet
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

// fetches the current player's turn without updating it
async function whoseTurnIsIt(gameid: string): Promise<string> {
  try {
    const { rows: CurrentTurn } = await sql`SELECT CurrentTurn FROM Games WHERE gameid = ${gameid} LIMIT 1`;
    const currentTurn = CurrentTurn[0]?.currentturn;

    if (!currentTurn) {
      throw new Error("Current turn is not defined.");
    }

    const { rows: playerEmail } = await sql`
      SELECT email
      FROM Players
      WHERE gameid = ${gameid}
      AND TurnOrder = ${currentTurn}
      LIMIT 1;
    `;

    if (playerEmail.length === 0) {
      throw new Error("Player email not found.");
    }

    return playerEmail[0].email;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

async function setGameStatus(gameid: string, status: string): Promise<void> {
  try {
    await sql`
      UPDATE Games
      SET GameState = ${status}
      WHERE gameid = ${gameid}`;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function getGameStatus(gameid: string): Promise<string> {
  try {
    const { rows } = await sql`
      SELECT GameState
      FROM Games
      WHERE gameid = ${gameid}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      throw new Error(`Game with ID ${gameid} not found`);
    }

    return rows[0].gamestate;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function fetchPlayersWithCharacters(gameid: string): Promise<{ [email: string]: string }> {
  try {
    const { rows: playerData } = await sql`
      SELECT email, character
      FROM Players
      WHERE gameid = ${gameid};
    `;

    const playersWithCharacters: { [email: string]: string } = {};
    playerData.forEach((player) => {
      const email = player.email as string;
      const character = player.character as string;
      playersWithCharacters[email] = character;
    });

    return playersWithCharacters;

  } catch (error) {
    console.error('An error occurred while fetching players:', error);
    throw error;
  }
}