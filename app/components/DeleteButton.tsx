"use client"

{ /* DeleteButton Component */}
export default function DeleteButton( params : { email: string, gameid: string }) {

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        body: JSON.stringify({ email: params.email, gameid: params.gameid }),
      });
      const data = await response.json();
      console.log(data.message);
      window.location.reload()
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <>

    <td className="px-6 py-4">
        <button onClick={handleDelete} className='text-red-500 hover:text-red-700'>
          Delete
        </button>
    </td>
    </>
  );
}