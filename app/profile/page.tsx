import Link from "next/link"; // Import Link from next/link
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import React from 'react';
import Image from 'next/image';

// Profile component
export default async function Profile() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 sm:p-24 bg-cover bg-center" style={{ backgroundImage: "url('/murder-background.jpg')" }}>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl text-white mb-8">Your Profile</h1>

      {/* Profile Page */}
      <div className="profile">
      <Image src={session?.user?.image ?? ''} alt="Profile Photo" width={500} height={500} className="profile-photo rounded-full border-4 border-white mb-6" />
      <div className="profile-info">
        <label htmlFor="username" className="block text-xl text-white mb-2">Username</label>
        <p className="text-lg text-gray-300 mb-8 sm:mb-4">{session?.user?.name}</p>
      </div>
      <div className="profile-info">
        <label htmlFor="email" className="block text-xl text-white mb-2">Email Address</label>
        <p className="text-lg text-gray-300">{session?.user?.email}</p>
      </div>
      </div>
    </main>
  );
}