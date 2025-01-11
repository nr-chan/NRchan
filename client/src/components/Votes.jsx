import { useState, useEffect } from 'react';
import { GetVoteCount, UpdateCount } from '../Defs';

export function VoteCount({ threadID }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await GetVoteCount(threadID);
      setCount(count);
    }
    fetchCount();
  }, [threadID])

  async function handleUpvote() {
    await UpdateCount(true, threadID);
    const count = await GetVoteCount(threadID);
    setCount(count);
  }
  async function handleDownvote() {
    await UpdateCount(false, threadID);
    const count = await GetVoteCount(threadID);
    setCount(count);
  }

  return (
    <>
      <div>{count}</div>
      <button onClick={handleUpvote}>
        <img src='/up.svg' className='w-4 h-4'/>
      </button>
      <button onClick={handleDownvote}>        
        <img src='/down.svg' className='w-4 h-4 rotate-180'/>
      </button>
    </>
  );
}
