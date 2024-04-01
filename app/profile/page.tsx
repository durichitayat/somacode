import Link from "next/link"; // Import Link from next/link
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import React from 'react';
import Image from 'next/image';
import Footer from "../components/Footer";

// Profile component
export default async function Profile() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  { 
    /**
    * @todo: Where session is User, return user object
    */
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 sm:p-24 bg-cover bg-center" style={{ backgroundImage: "url('/murder-background.jpg')" }}>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      
      <h1 className="text-4xl dark:text-white mb-8">Your Profile</h1>

      {/* Profile Page */}
      <section className="flex font-medium items-center justify-center" >
        <section className="w-64 mx-auto bg-white/20 border rounded-2xl px-8 py-6 shadow-lg">
        <Image src={session?.user?.image ?? ''} alt="Profile Photo" width={200} height={200} className="profile-photo rounded-full border-4 border-white mb-6" />
        
        <div className="flex flex-col gap-5">
          <p className="text-gray-500">
            Status: <span className="text-emerald-400"> Active </span>
          </p>
          <div className="profile-info">
            <p className="font-base">{session?.user?.name}</p>
            <p className="font-base">{session?.user?.email}</p>
          </div>
        </div>
        </section>
      </section>
      
      <Footer />
    </main>
  );
}