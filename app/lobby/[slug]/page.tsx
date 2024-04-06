/* eslint-disable @next/next/no-img-element */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";
import JoinButton from "@/app/components/JoinButton";
import Footer from "@/app/components/Footer";
import LeaveButton from "@/app/components/LeaveButton";

export default async function Lobby( {params}: any ) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  const { rows } = await sql`
    SELECT Players.*, Users.image
    FROM Players 
    INNER JOIN Users ON Players.email = Users.email
    WHERE gameid = ${params.slug}`;
  const { rows: game } = await sql`SELECT * FROM Games WHERE gameid = ${params.slug} LIMIT 1`;
  // console.log("players: ", rows);
  // console.log("game: ", game[0] );
  // console.log(session)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-cover bg-center">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <div>
        <h1 className="text-4xl mb-8">Welcome to the Game Lobby</h1>
        <h2>{game[0].gamename}</h2>
      </div>

      <div className="grid lg:grid-cols-5 w-full gap-10 border">
      {/**
       * @todo: update the status of the game, push a page refresh
       */}
      
      <div className="lg:col-span-2 w-full flex flex-col items-center justify-center">
        <table className="w-full shadow-md text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

            {/* ROW Header */}
            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Players
                </th>
              </tr>
            </thead>

            {/* ROWS */}
            <tbody>

            {rows.map((row) => (

              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700  hover:bg-gray-200 dark:hover:bg-gray-600" key={row.email}>

                <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                  <img className="w-10 h-10 rounded-full" src={row.image || "/placeholder.png"}  alt="profile-image" />
                  <div className="ps-3">
                    <div className="text-base font-semibold">{row.name}</div>
                    <div className="font-normal text-gray-500">{row.email}</div>
                  </div>  
                </th>

              </tr>

            ))}


            </tbody>
        </table>
        </div>

        <div className="lg:col-span-3 w-full flex flex-col items-center justify-center">
          
            {/* join game if not already in game */
              !rows.some(row => row.email === session.user?.email) && game[0].gamestate == 'open' ? (
                <JoinButton gameid={game[0].gameid} email={session.user?.email ?? ""} />
              ) : <><p className="mb-4">You are in the game</p>
              <LeaveButton gameid={game[0].gameid} email={session.user?.email ?? ""} /></>
            }

            {/* start game if game is open and there are players // rows.length > 1 && */
              game[0].gamestate == 'open' &&  rows.some(row => row.email === session.user?.email) ? (
              <a href={"/game/" + params.slug} className="py-2.5 px-5 text-white bg-green-700 hover:bg-green-600 rounded-full self-auto">
                Start Game
              </a> ) : <p className="mb-4 bg">Waiting for more players</p>
            }

        </div>
            
      </div>

      <Footer />
    </main>
  );
}
