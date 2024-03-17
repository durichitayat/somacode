'use client'
import { useRouter } from 'next/router';
import { FormEvent } from "react";

export default function Register() {
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
 
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/user/register', {
      method: 'POST',
      body: formData,
    })
 
    // Handle response 
    const data = await response.json()
    const userid = data.userid

    // Replace with a redirect to the user's profile page
    // Profile page is /users/[slug] where slug is the userid returned from the response
    // alert(data.message)

    // Redirect to the user's profile page
    router.push(`/users/${userid}`);
  }


  return (
    <div className="flex min-h-screen flex-col items-center gap-10 p-24">

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-pink-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-pink-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] items-center"></div>
      <h1 className="text-4xl">
        Signup
      </h1>
      <div>
        <form className="max-w-lg w-40" onSubmit={onSubmit}>
          {/* email */}
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500" placeholder="name@email.com" required />
          </div>
          {/* name */}
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
            <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500" placeholder="" required />
          </div>
          {/* gravatar */}
          <div className="mb-5">
            <label htmlFor="gravatar" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Profile image</label>
            <input type="text" name="image" id="gravatar" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500" placeholder="" required />
          </div>

          { /* submit */}
          <button 
            type="submit" 
            className="text-white bg-pink-700 hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
          >Submit</button>
        </form>

      </div>

    </div>
  );
}
