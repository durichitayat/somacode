'use client'

import Image from 'next/image'
import Link from 'next/link'
import Footer from './components/Footer';

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

      <div className="flex flex-col items-center justify-center">
              
          <h1 className="text-4xl my-5">
            Home
          </h1>

          {/**<Image src="/clueless.webp" alt="Clueless" width={500} height={285} /> */}

          <div className="mt-5 flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">Welcome, you made it!</span> Here you can play the Clue-less game.
            </div>
          </div>

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

      <Footer />

    </main>
  );
}