'use client'

import Link from "next/link";

export default function  Login() {

  const handleClick = async () => {
    try {
      // Use the fetch API to send a request to your API route
      const response = await fetch('/api/login', {
        method: 'POST', // or 'GET' if your API supports it
        headers: {
          'Content-Type': 'application/json',
        },
        // Include body if you need to send data in your request (for POST requests)
        // body: JSON.stringify({ yourData: "dataValue" }),
      });

      // Wait for the response from the API
      const data = await response.json();

      // Log the message or handle the response data as needed
      console.log(data.message);
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('An error occurred:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          {"We're just getting started."}
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://github.com/durichitayat/somacode"
            target="_blank"
            rel="noopener noreferrer"
          >
           By{" "}SomaCode
          </a>
        </div>
      </div>

      <div className="">
              
          <h1 className="text-4xl">
            Home
          </h1>

          <button 
            type="button" 
            className="z-100 p-4 text-white bg-blue-500 rounded-lg" 
            onClick={handleClick}
          >
            Submit
          </button>
            
      </div>

      <div>
        <Link className="z-100" href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/game">Game</Link>
      </div>

    </main>
  );
}