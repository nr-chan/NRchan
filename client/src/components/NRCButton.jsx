import { useState } from 'react';

const NRCButton = ({
  label,
  onClick,
  addClass = "",
  bgColor = '#EA8',
  borderColor = '#800000',
  hoverBgColor = '#F0E0D6',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? hoverBgColor : bgColor,
          borderColor: borderColor,
        }}
        className={`px-1 mt-2 mr-1 h-12 text-sm border ${addClass}`}
      >
        {label}
      </button>
    </div>
  );
};

export default NRCButton;
