import React, { useState, useEffect, useRef } from 'react';
import { Button, Box } from '@chakra-ui/react';
import './WordGame.css';

const WordGame = () => {
  const [letters, setLetters] = useState(['A', 'B', 'C', 'D']);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [coins, setCoins] = useState(0);
  const [grid, setGrid] = useState([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ]);
  const [currentLine, setCurrentLine] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const circleRef = useRef(null);
  const svgRef = useRef(null);

  const centerX = 128;
  const centerY = 128;
  const radius = 100;

  useEffect(() => {
    const circle = circleRef.current;
    if (circle) {
      const getLetterPosition = (element) => {
        const rect = element.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - svgRect.left,
          y: rect.top + rect.height / 2 - svgRect.top
        };
      };

      const handleStart = (e) => {
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const letter = document.elementFromPoint(clientX, clientY);
        if (letter && letter.classList.contains('letter')) {
          const pos = getLetterPosition(letter);
          setSelectedLetters([{ letter: letter.textContent, position: pos }]);
          setCurrentWord(letter.textContent);
          setCurrentLine(null);
        }
      };

      const handleMove = (e) => {
        if (selectedLetters.length > 0) {
          const clientX = e.clientX || e.touches[0].clientX;
          const clientY = e.clientY || e.touches[0].clientY;
          const lastPos = selectedLetters[selectedLetters.length - 1].position;
          setCurrentLine({
            x1: lastPos.x,
            y1: lastPos.y,
            x2: clientX - svgRef.current.getBoundingClientRect().left,
            y2: clientY - svgRef.current.getBoundingClientRect().top
          });

          const letter = document.elementFromPoint(clientX, clientY);
          if (letter && letter.classList.contains('letter')) {
            const pos = getLetterPosition(letter);
            if (!selectedLetters.some(sl => sl.letter === letter.textContent)) {
              setSelectedLetters(prev => [...prev, { letter: letter.textContent, position: pos }]);
              setCurrentWord(prev => prev + letter.textContent);
              setCurrentLine(null);
            } else if (selectedLetters.length > 1 && selectedLetters[selectedLetters.length - 2].letter === letter.textContent) {
              setSelectedLetters(prev => prev.slice(0, -1));
              setCurrentWord(prev => prev.slice(0, -1));
            }
          }
        }
      };

      const handleEnd = () => {
        if (isValidWord(currentWord) && canFitInGrid(currentWord)) {
          addWordToGrid(currentWord);
          setCoins(prev => prev + currentWord.length);
        }
        setSelectedLetters([]);
        setCurrentLine(null);
        setCurrentWord('');
      };

      circle.addEventListener('mousedown', handleStart);
      circle.addEventListener('touchstart', handleStart);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);

      return () => {
        circle.removeEventListener('mousedown', handleStart);
        circle.removeEventListener('touchstart', handleStart);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [selectedLetters, currentWord]);

  const shuffleLetters = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setLetters(shuffled);
      setTimeout(() => setIsShuffling(false), 50);
    }, 500);
  };

  const isValidWord = (word) => {
    return word.length >= 3;
  };

  const canFitInGrid = (word) => {
    return grid.some(row => row.includes(''));
  };

  const addWordToGrid = (word) => {
    const newGrid = [...grid];
    for (let i = 0; i < newGrid.length; i++) {
      const emptyIndex = newGrid[i].findIndex(cell => cell === '');
      if (emptyIndex !== -1) {
        newGrid[i][emptyIndex] = word;
        break;
      }
    }
    setGrid(newGrid);
  };

  return (
    <div className="word-game-container">
      <Box borderWidth="1px" borderRadius="lg" p={4} className="grid-container">
        {grid.map((row, i) => (
          row.map((cell, j) => (
            <div key={`${i}-${j}`} className="grid-cell">
              {cell}
            </div>
          ))
        ))}
      </Box>
      
      <div className="letter-circle">
        <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="2" />
          {selectedLetters.slice(1).map((letter, index) => (
            <line
              key={index}
              x1={selectedLetters[index].position.x}
              y1={selectedLetters[index].position.y}
              x2={letter.position.x}
              y2={letter.position.y}
              stroke="blue"
              strokeWidth="2"
            />
          ))}
          {currentLine && (
            <line
              x1={currentLine.x1}
              y1={currentLine.y1}
              x2={currentLine.x2}
              y2={currentLine.y2}
              stroke="blue"
              strokeWidth="2"
            />
          )}
        </svg>
        <div ref={circleRef} className="w-full h-full">
          {letters.map((letter, index) => {
            const angle = (index / letters.length) * 2 * Math.PI;
            const x = Math.cos(angle) * radius + centerX;
            const y = Math.sin(angle) * radius + centerY;
            return (
              <div
                key={`${letter}-${index}`}
                className={`letter ${selectedLetters.some(sl => sl.letter === letter) ? 'selected' : ''}`}
                style={{
                  left: `${x - 16}px`,
                  top: `${y - 16}px`,
                  opacity: isShuffling ? 0 : 1,
                  transform: isShuffling ? 'scale(0.5)' : 'scale(1)',
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="current-word">{currentWord}</div>
      
      <Button onClick={shuffleLetters} className="shuffle-button" disabled={isShuffling}>
        Shuffle
      </Button>
      
      <div className="coins">Coins: {coins}</div>
    </div>
  );
};

export default WordGame;