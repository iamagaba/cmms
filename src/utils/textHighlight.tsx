import React from 'react';

export interface HighlightTextProps {
  text: string;
  searchTerm: string;
  highlightStyle?: React.CSSProperties;
  caseSensitive?: boolean;
}

const defaultHighlightStyle: React.CSSProperties = {
  backgroundColor: '#fff566',
  fontWeight: 'bold',
  padding: '0 2px',
  borderRadius: '2px'
};

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  searchTerm,
  highlightStyle = defaultHighlightStyle,
  caseSensitive = false
}) => {
  if (!searchTerm.trim() || !text) {
    return <>{text}</>;
  }

  const searchTermTrimmed = searchTerm.trim();
  const flags = caseSensitive ? 'g' : 'gi';
  
  try {
    // Escape special regex characters in search term
    const escapedSearchTerm = searchTermTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, flags);
    
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => {
          const isMatch = caseSensitive 
            ? part === searchTermTrimmed
            : part.toLowerCase() === searchTermTrimmed.toLowerCase();
            
          return isMatch ? (
            <span key={index} style={highlightStyle}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </>
    );
  } catch (error) {
    // If regex fails, return original text
    console.warn('Text highlighting failed:', error);
    return <>{text}</>;
  }
};

export const highlightText = (
  text: string, 
  searchTerm: string, 
  caseSensitive: boolean = false
): React.ReactNode => {
  return (
    <HighlightText 
      text={text} 
      searchTerm={searchTerm} 
      caseSensitive={caseSensitive} 
    />
  );
};

export const getHighlightedText = (
  text: string,
  searchTerm: string,
  highlightStyle?: React.CSSProperties,
  caseSensitive?: boolean
): React.ReactNode => {
  return (
    <HighlightText
      text={text}
      searchTerm={searchTerm}
      highlightStyle={highlightStyle}
      caseSensitive={caseSensitive}
    />
  );
};