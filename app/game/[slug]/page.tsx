import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Clueless from "./Clueless";
import Footer from "@/app/components/Footer";
import { sql } from "@vercel/postgres";

// PUT THIS STUFF AS A 'PUT' API CALL TO LOBBY

type Card = {
  type: string;
  name: string;
};

// define all of the cards
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

export default async function Game( {params}: any ) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  // if this is host, then set up everyone's turn order and distribute cards
  const { rows: game } = await sql`SELECT * FROM Games WHERE gameid = ${params.slug} LIMIT 1`;
  if ((game[0].gameowner === session.user?.email ?? "") && game[0].gamestate == 'open') {

    // close the game state, disabled for testing
    // const resultGameStateClose = await sql`
    //   UPDATE Games
    //   SET GameState = 'closed'
    //   WHERE GameID = ${params.slug}`

    // find out how many players there are
    const { rows } = await sql`
      SELECT COUNT(*) as playerCount
      FROM Players 
      WHERE gameid = ${params.slug}`;
    const numberOfPlayers = 4 // rows[0].playerCount;, set to 4 for testing
    console.log(`Number of players in the game: ${numberOfPlayers}`);

    // const numberOfPlayers = 4;
    const { solutionCards, playerCards } = distributeClueCards(numberOfPlayers, allClueCards);
    console.log("Solution Cards:", solutionCards);
    console.log("Player Cards:", playerCards);

    const cardsArray = playerCards[0];
    const cardsString = cardsArray.map(innerArray => `ARRAY['${innerArray.join("', '")}']`).join(',');

    await sql`
      UPDATE Players
      SET cards = ARRAY[${cardsString}]
      WHERE email = ${session.user?.email};
    `;

    const updatedPlayer = await sql`
      SELECT *
      FROM Players
      WHERE email = ${session.user?.email};
    `;

    console.log("Updated Player Info:");
    console.log(updatedPlayer.rows[0].cards);

    // Define a regular expression to match the elements
    const regex = /\['(.*?)', '(.*?)'\]/g;

    const resultArray: string[][] = [];

    // Use a loop to extract the elements using the regex
    let match;
    while ((match = regex.exec(updatedPlayer.rows[0].cards)) !== null) {
      const [, category, value] = match;
      resultArray.push([category, value]);
    }

    console.log(resultArray);

    // const player = await sql`
    // SELECT *
    // FROM Players 
    // WHERE gameid = ${params.slug}
    // AND email = ${session.user?.email ?? ""}`;
  }

  return (
    <main className="flex min-h-s.creen flex-col items-center justify-between p-24 bg-cover bg-center" style={{ backgroundImage: "url('/murder-background.jpg')" }}>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl dark:text-white mb-8">Welcome to the text-based Clueless experience</h1>

        <h2>Your cards will go here</h2> {/* @todo query player database to obtain the player's cards */}

        <Clueless gameid={params.slug} email={session.user?.email ?? ""}/> 

      <Footer />
    </main>
  );
};