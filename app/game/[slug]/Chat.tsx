'use client';
import { useChat } from 'ai/react';

export default function Chat() {
const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    initialInput: "start game"
    ,
});
 
  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className="p-3 mb-5 bg-slate-200/10 w-96 rounded-sm">
          <label className="text-slate-600 dark:text-slate-400 font-bold text-sm mr-2">{m.role === 'user' ? 'User: ' : 'Game Master: '}</label>
          {m.content}
        </div>
      ))}
 
      <form onSubmit={handleSubmit} className='max-w-96 w-96'>
        <label 
            htmlFor='chat'
            className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
            Your move here:
          <input 
            className='w-96 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' 
            id="chat" 
            value={input} 
            onChange={handleInputChange} 
            />
        </label>
        <button 
            type="submit"
            className='mt-10 py-2.5 px-5 text-white bg-pink-700 hover:bg-pink-600 rounded-full'
            > Send
        </button>
      </form>
    </div>
  );
}