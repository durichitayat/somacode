/* eslint-disable @next/next/no-img-element */

import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import BlockButton from "../components/BlockButton";
import DeleteButton from "../components/DeleteButton";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Footer from "../components/Footer";

interface PlayersInGames {
  [gameid: string]: string[];
}

export default async function Users({
  params
} : {
  params: {
  user: string } 
  }) : Promise <JSX.Element> {
  const session = await getServerSession();
  // TODO this is already a user-protected route. we can easily implement an admin check here
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }
  noStore()
  const { rows } = await sql`SELECT * FROM Users`;
  const { rows: gameRows } = await sql`SELECT * FROM Games`;

  const playersInGames = await getPlayersInGames();
  console.log("Players in Games:", playersInGames);

  return (
  <>
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <div className="flex flex-col place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center">
      </div>
          
        <h1 className="text-4xl text-white mb-6">Users</h1>

        <div className="flex flex-col overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

            {/* ROW Header */}
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" colSpan={2} className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>

            {/* ROWS */}
            <tbody>

            {rows.map((row) => (

              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={row.email}>
                <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                  <img className="w-10 h-10 rounded-full" src={row.image} alt="profile-image" />
                  <div className="ps-3">
                    <div className="text-base font-semibold">{row.name}</div>
                    <div className="font-normal text-gray-500">{row.email}</div>
                  </div>  
                </th>
                <td className="px-6 py-4">
                  User
                </td>
                
                <BlockButton email={row.email} status={row.status} />
                <DeleteButton email={row.email} gameid={"false"} />

              </tr>

            ))}


            </tbody>
          </table>
        </div>

        <div className="flex flex-col overflow-x-auto shadow-md sm:rounded-lg place-items-center"></div>
          <h1 className="text-4xl text-white mb-6 mt-6">Games</h1>
          <div className="flex flex-col overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="p-4">
                  Game ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Players
                </th>
                <th scope="col" className="px-6 py-3">
                  Game State
                </th>
                <th scope="col" className="px-6 py-3">
                  Solution
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {gameRows.map((row) => (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={row.gameid}>
                  <td className="px-6 py-4">{row.gamename}</td>
                  <td className="w-4 p-4">{row.gameid}</td>
                  <td className="px-6 py-4" style={{ whiteSpace: "pre-line" }}>
                    {playersInGames[row.gameid].join("\n")}
                  </td>
                  <td className="px-6 py-4">{row.gamestate}</td>
                  <td className="px-6 py-4" style={{ whiteSpace: "pre-line" }}>
                    {prettySolutionCards(row.solution).join("\n")}
                  </td>
                  <td className="px-6 py-4">
                    <DeleteButton email={"false"} gameid={row.gameid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Footer />

        </main>
    </>
  );
}

async function getPlayersInGames(): Promise<PlayersInGames> {
  try {
    const result = await sql`
      SELECT g.gameid, p.email
      FROM Games g
      JOIN Players p ON g.gameid = p.gameid;
    `;

    const playersInGames: PlayersInGames = {};

    for (const row of result.rows) {
      const { gameid, email } = row;
      if (!playersInGames[gameid]) {
        playersInGames[gameid] = [];
      }
      playersInGames[gameid].push(email);
    }

    return playersInGames;
  } catch (error) {
    // Handle errors
    console.error("Error executing SQL query:", error);
    throw error;
  }
}

function prettySolutionCards(cards: string): string[] {
  try {
    // Define a regular expression to match the elements
    const regex = /\['(.*?)', '(.*?)'\]/g;

    const resultArray: string[] = [];

    // Use a loop to extract the elements using the regex
    let match;
    while ((match = regex.exec(cards)) !== null) {
      const [, category, value] = match;
      resultArray.push(category + ': ' + value);
    }

    return resultArray;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}