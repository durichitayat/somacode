'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function  Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300  bg-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
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

          <Image src="/clueless.webp" alt="Clueless" width={500} height={500} />

          <p className="text-lg">
            Welcome to the Clue-less Game
          </p>

          {/* TODO: Welcome user to the game
            * Introduce the user to the game
            * Maybe a fun gif? 
            **/ }

          <Link 
            type="button" 
            className="mt-10 py-2.5 px-5 text-white bg-pink-700 hover:bg-pink-600 rounded-full" 
            href="/dashboard"
          >
            Get Started
          </Link>
            
      </div>

      <div className="" >
      </div>

    </main>
  );
}