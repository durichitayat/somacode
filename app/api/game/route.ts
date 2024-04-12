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

type GameRequestBody = {
  gameid: string;
  email: string;
  playerMove: string;
};

export async function POST (request: Request) {

  try {
    const { gameid, email, playerMove }: GameRequestBody = await request.json();
    console.log("gameid: ", gameid);
    console.log("email: ", email);
    console.log("playerMove: ", playerMove);
    if (email.toLowerCase() === "fetchstatus" && playerMove.toLowerCase() === "fetchstatus") {
      const { rows: turnCount } = await sql`SELECT turncount FROM Games WHERE gameid = ${gameid} LIMIT 1`;
      return NextResponse.json(turnCount[0].turncount, {status: 200});
    }
    const { rows: turnCount } = await sql`UPDATE Games
                                        SET turncount = turncount + 1
                                        WHERE gameid = ${gameid}
                                        RETURNING turncount`;
    let turnCountVal: number = turnCount[0].turncount
    let turnCountStr: string = turnCountVal.toString();
    return NextResponse.json(turnCountStr, {status: 200});
  } catch (error) {
    return NextResponse.json({error}, {status: 500});
  }

}

export async function PUT (request: Request) {

  try {

    const { gameid, email } = await request.json();

    // if this is host, then set up everyone's turn order and distribute cards
    const { rows: game } = await sql`SELECT * FROM Games WHERE gameid = ${gameid} LIMIT 1`;
    if ((game[0].gameowner === email ?? "") && game[0].gamestate == 'open') {
      
      // close the game state, disabled for testing. change 'open' to 'closed' to enable
      await sql`
        UPDATE Games
        SET GameState = 'open'
        WHERE GameID = ${gameid}`;

      const { playerCount, playerEmails } = await getPlayerCountEmails(gameid);
      // console.log('Player Count:', playerCount);
      // console.log('Player Emails:', playerEmails);

      const { solutionCards, playerCards } = distributeClueCards(playerCount, allClueCards);
      // console.log("Solution Cards:", solutionCards);
      // console.log("Player Cards:", playerCards);

      await updatePlayerCards(playerEmails, playerCards);
      // console.log('Player cards dealt successfully.');

      // this will work once Duri can delete the games table and we update it with create-games-table
      // await setSolutionCards(gameid, solutionCards);
      // console.log('Solution cards set aside successfully.')
      // const solutionCardsRet = await getSolutionCards(gameid);
      // console.log('Solution cards returned from db:', solutionCardsRet);

    }

    // fetch the cards at $email and return them to the game component
    const playerCardsRet = await getPlayerCards(email);
    return NextResponse.json(playerCardsRet, {status: 200});

  } catch (error) {
    return NextResponse.json({error}, {status: 500});
  }

}

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

export async function updatePlayerCards(playerEmails: string[], playerCards: string[][][]): Promise<void> {

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