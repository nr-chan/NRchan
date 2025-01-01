export const board_list=['p','cp', 'n', 's','v', 'k', 'a','c', 'T', 'Sp', 'Ph', 'm', 'G','r', 'd', 'Con', 'GIF', 'Rnt','pol'];

export const links=['Programming', 'Competitive Programming', 'Nerd', 'Semester','Video Games', 'Khelkud', 'Arambh','Comics & Cartoons', 'Technology', 'Sports','Photography', 'Music', 'Graphic Design','Randi', 'Dick', 'Confess', 'GIF', 'Rant','politics']

export const board_img=['fumo','lurking','joint','bhabha'];

export const URL = "https://nrchan.onrender.com"

export const fetchThreads=async()=>{
    const response = await fetch(`${URL}/thread/${id}`);
    const data = await response.json();
    console.log(data);
    setThreadData(data);
}

export const formatDate = (dateString) => {
  try{
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }catch{
    return dateString      
  }
};

export const formatText = (content) => {
  if (!content) return null;

  const parts = content.split(/```/);

  return parts.map((part, index) => {
    // Handle code blocks (odd indexes)
    if (index % 2 === 1) {
      if (parts.length % 2 === 0 && index === parts.length - 1) {
        part = "```" + part;
        return <span key={index}>{part}</span>;
      }
      return (
        <code
          key={index}
          className="block bg-gray-800 text-white rounded-md p-2"
        >
          {part}
        </code>
      );
    }

    // Handle regular text (even indexes)
    return part.split("\n").map((line, lineIndex) => {
      if (line.trim().startsWith(">")) {
        return (
          <span key={`${index}-${lineIndex}`} style={{ color: "#789922" }}>
            {line}
            <br />
          </span>
        );
      } else {
        return (
          <span key={`${index}-${lineIndex}`}>
            {line}
            <br />
          </span>
        );
      }
    });
  });
};

