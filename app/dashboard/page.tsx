import Link from "next/link"; // Import Link from next/link

export default function Dashboard() {
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
      <Link href="/game-lobby">
        <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mb-4">
          New Game
        </div>
      </Link>

      <div className="w-full">
        <table className="w-full border-collapse border rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-800">
              <th className="border border-gray-400 px-4 py-2">Current Games</th>
              <th className="border border-gray-400 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {existingGames.map((game) => (
              <tr key={game.id} className="text-center">
                <td className="border border-gray-400 px-4 py-2">{game.name}</td>
                {/* Join Game button with Link */}
                <td className="border border-gray-400 px-4 py-2">
                  <Link href="/game-lobby/page">
                    <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded cursor-pointer">
                      Join Game
                    </div>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}
