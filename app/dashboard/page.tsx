/* eslint-disable @next/next/no-img-element */
'use server'
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import JoinButton from "../components/JoinButton";
import NewGameButton from "../components/NewGameButton";

export default async function Dashboard() {

  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  noStore()
  const { rows } = await sql`SELECT * FROM Games`;
  console.log('game rows: ', rows);

  // Sample data for existing games (replace with actual data)
  const existingGames = [
    { id: 1, name: "Game 1" },
    { id: 2, name: "Game 2" },
    { id: 3, name: "Game 3" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl mb-8">Dashboard</h1>

      {/* New Game button with Link */}
      <NewGameButton/>

      <div className="w-full mt-20">
        <table className="mx-auto text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Game
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          

          {/* ROWS */}
          <tbody>

          {rows.map((row) => (

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={row.gameid}>
              <td className="w-4 p-4">
                <div className="flex items-center">
                  <input id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                </div>
              </td>
              <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                <div className="ps-3">
                  <div className="text-base font-semibold">{row.gameid}</div>
                  
                </div>  
              </th>
              <td className="px-6 py-4">
                <div className="font-normal text-gray-500">{row.gamestate}</div>
              </td>
              
              <JoinButton gameid={row.gameid} />

            </tr>

          ))}


          </tbody>


        </table>
      </div>

    </main>
  );
}
