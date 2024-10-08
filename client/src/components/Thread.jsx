import React from 'react';

const ThreadPage = ({ threadData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}(${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]})${date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  const Post = ({ post, isOP }) => (
    <div className={`p-2 ${isOP ? 'bg-[#F0E0D6]' : 'bg-[#F0E0D6]'} border border-[#D9BFB7] mb-2`}>
      <div className="text-[#117743] font-bold text-[10px]">
        {post.name || 'Anonymous'} 
        <span className="text-[#cc0000] ml-1">(ID: {post.posterID.slice(-8)})</span> 
        <span className="text-[#000000] ml-1">{formatDate(post.created)}</span>
        <span className="text-[#000000] ml-1">No.{post.id}</span>
        {isOP && <span className="text-[#cc0000] ml-1">(OP)</span>}
        <span className="text-[#cc0000] ml-1 float-right cursor-pointer">[Reply]</span>
      </div>
      {isOP && post.image && (
        <div className="float-left mr-2 mt-2">
          <a href={`/images/${post.image}`} target="_blank" rel="noopener noreferrer">
            <img src={`/placeholder.svg?height=${post.imageDimensions.split('x')[1]}&width=${post.imageDimensions.split('x')[0]}`} alt="Thread image" className="max-w-[250px] max-h-[250px] border border-[#D9BFB7]" />
          </a>
          <div className="text-[10px] text-[#000000]">
            File: <a href={`/images/${post.image}`} target="_blank" rel="noopener noreferrer" className="text-[#34345C] underline">{post.image}</a> ({post.imageSize}, {post.imageDimensions})
          </div>
        </div>
      )}
      {post.subject && <div className="text-[#cc0000] font-bold">{post.subject}</div>}
      <div className="text-[10px] whitespace-pre-wrap text-[#800000] mt-1">{post.content}</div>
    </div>
  );

  return (
    <div className="bg-[#FFFFEE] text-[#800000] font-sans text-[10px] min-h-screen">
      {/* Board Navigation */}
      <div className="bg-[#F8E0B0] p-1 border-b border-[#D9BFB7] flex flex-wrap">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'gif', 'h', 'hr', 'k', 'm', 'o', 'p', 'r', 's', 't', 'u', 'v', 'vg', 'vm', 'vmg', 'vr', 'vrpg', 'vst', 'w', 'wg', 'i', 'ic', 'r9k', 's4s', 'vip', 'qa', 'cm', 'hm', 'lgbt', 'y', '3', 'aco', 'adv', 'an', 'bant', 'biz', 'cgl', 'ck', 'co', 'diy', 'fa', 'fit', 'gd', 'hc', 'his', 'int', 'jp', 'lit', 'mlp', 'mu', 'n', 'news', 'out', 'po', 'pol', 'pw', 'qst', 'sci', 'soc', 'sp', 'tg', 'toy', 'trv', 'tv', 'vp', 'vt', 'wsg', 'wsr', 'x', 'xs'].map(board => (
          <a key={board} href={`/${board}/`} className="mr-[2px] text-[#800000] hover:underline">{board}</a>
        ))}
        <span className="ml-auto">
          <a href="#" className="text-[#800000] hover:underline">[Settings]</a>
          <a href="#" className="text-[#800000] hover:underline ml-[2px]">[Search]</a>
          <a href="#" className="text-[#800000] hover:underline ml-[2px]">[Home]</a>
        </span>
      </div>

      <div className="max-w-[720px] mx-auto p-2">
        {/* Board Title */}
        <h1 className="text-center text-[24px] text-[#AF0A0F] font-bold mb-4">/pol/ - Politically Incorrect</h1>

        {/* Reply Form */}
        <div className="mb-4">
          <form className="bg-[#F0E0D6] border border-[#D9BFB7]">
            <table className="w-full text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-[#EA8] p-1 w-[60px]">Name</td>
                  <td className="p-1"><input type="text" defaultValue="Anonymous" className="w-full bg-[#FFFFFF] border border-[#AAA] p-1" /></td>
                </tr>
                <tr>
                  <td className="bg-[#EA8] p-1">Options</td>
                  <td className="p-1 flex">
                    <input type="text" className="flex-grow bg-[#FFFFFF] border border-[#AAA] p-1" />
                    <input type="submit" value="Post" className="ml-2 bg-[#F0E0D6] border border-[#AAA] px-2 py-1" />
                  </td>
                </tr>
                <tr>
                  <td className="bg-[#EA8] p-1">Comment</td>
                  <td className="p-1"><textarea className="w-full h-24 bg-[#FFFFFF] border border-[#AAA] p-1"></textarea></td>
                </tr>
                <tr>
                  <td className="bg-[#EA8] p-1">File</td>
                  <td className="p-1">
                    <input type="file" className="bg-[#FFFFFF] border border-[#AAA] p-1" />
                    <span className="ml-2">No file chosen</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>

        {/* Thread Content */}
        <div className="mb-4">
          <Post post={threadData} isOP={true} />
          {threadData.replies.map(reply => (
            <Post key={reply.id} post={reply} isOP={false} />
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="text-center mb-4">
          <a href="#" className="text-[#34345C] underline mr-2">[Return]</a>
          <a href="#" className="text-[#34345C] underline mr-2">[Catalog]</a>
          <a href="#" className="text-[#34345C] underline mr-2">[Bottom]</a>
          <a href="#" className="text-[#34345C] underline mr-2">[Update]</a>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage;