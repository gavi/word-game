import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import WordGame from './WordGame';

function App() {
  return (
    <ChakraProvider>
      <WordGame />
    </ChakraProvider>
  );
}

export default App;