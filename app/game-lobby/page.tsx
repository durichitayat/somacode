import Link from "next/link"; // Import Link from next/link
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function GameLobby() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-cover bg-center" style={{ backgroundImage: "url('/murder-background.jpg')" }}>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl text-white mb-8">Welcome to the Game Lobby</h1>

      {/* Start Game button with Link */}
      <Link href="/gameplay">
        <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Start Game
        </div>
      </Link>

    </main>
  );
}
