"use client"
import { useState } from 'react';

{ /* BlockButton Component */}
export default function BlockButton( params : { email: string, status: string}) {
  const [status, setStatus] = useState(params.status);

  const handleBlock = async () => {
    try {
      const oppositeStatus = status === 'active' ? 'blocked' : 'active';
      const response = await fetch('/api/user', {
        method: 'PATCH',
        body: JSON.stringify({ email: params.email, status: oppositeStatus }),
      });
      const data = await response.json();
      console.log(data.message);
      setStatus(oppositeStatus);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>
    <td className="px-6 py-4">
        <div className="flex items-center">
            {status === "active" ? <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> : <><div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div></> } {status}
        </div>
    </td>
    <td className="px-6 py-4">
        <button onClick={handleBlock} className='text-blue-500 hover:text-blue-700'>
            {status === 'active' ? 'Block' : 'Activate'}
        </button>
    </td>
    </>
  );
}