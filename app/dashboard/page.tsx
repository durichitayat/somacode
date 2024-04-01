/* eslint-disable @next/next/no-img-element */
'use server'
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import NewGameButton from "../components/NewGameButton";
import Link from "next/link";
import Footer from "../components/Footer";

export default async function Dashboard() {

  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  noStore()
  const { rows } = await sql`SELECT * FROM Games`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl mb-8">Dashboard</h1>

      {/* New Game button with Link */}
      <NewGameButton session={session} />

      <div className="w-full mt-20">
        <table className="mx-auto text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-lg border">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Game
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              
            </tr>
          </thead>
          

          {/* ROWS */}
          <tbody>

          {rows.map((row) => (
            <>
              
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" key={row.gameid}>
                  
                  <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    
                      <Link href={"/lobby/" + row.gameid} className="ps-3 flex flex-col" >
                        <p className="text-base font-bold text-blue-700 hover:text-blue-800">{row.gamename}</p>
                        <p className="text-xs font-light font-mono text-gray-300">{row.gameid}</p>
                      </Link>
                  
                  </th>
                  <td className="px-6 py-4">
                    <div className="font-normal text-gray-500">{row.gamestate}</div>
                  </td>

                  
                </tr>
              
            </>
          ))}
          
          </tbody>
        </table>
      </div>

      <Footer />

    </main>
  );
}
