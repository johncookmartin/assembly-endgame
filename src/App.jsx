import React from 'react';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { clsx } from 'clsx';
import { languages } from './assets/languages';
import {
  getFarewellText,
  getRandomWord,
  useWindowSize,
} from './services/utils';
import Confetti from 'react-confetti';

const App = () => {
  //state values
  const { windowSize } = useWindowSize();
  const [currentWord, setCurrentWord] = useState(getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);

  //derived values
  const currentWordArr = currentWord.split('');
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWordArr.includes(letter)
  ).length;
  const isGameWon = currentWordArr.every((letter) =>
    guessedLetters.includes(letter)
  );
  const isGameLost = wrongGuessCount >= languages.length - 1;
  const isGameOver = isGameLost || isGameWon;
  const lastLetterGuessed =
    guessedLetters.length > 0 ? guessedLetters[guessedLetters.length - 1] : '';
  const isWrongGuess =
    guessedLetters.length > 0 &&
    !currentWordArr.includes(lastLetterGuessed) &&
    !isGameOver;

  //static values
  const qwertyTop = keyboardRow('qwertyuiop');
  const qwertyMiddle = keyboardRow('asdfghjkl');
  const qwertyBottom = keyboardRow('zxcvbnm');

  const languageElements = languages.map((language, index) => {
    const className = clsx('language-box', index < wrongGuessCount && 'lost');

    return (
      <span
        key={language.name}
        className={className}
        style={{
          backgroundColor: language.backgroundColor,
          color: language.color,
        }}
      >
        {language.name}
      </span>
    );
  });

  const letterElements = currentWordArr.map((letter) => (
    <span
      key={nanoid()}
      className={clsx('letter', {
        lost: isGameOver && !guessedLetters.includes(letter),
      })}
    >
      {guessedLetters.includes(letter) || isGameOver
        ? letter.toUpperCase()
        : ''}
    </span>
  ));

  const gameStatus = () => {
    const gameStates = {
      win: {
        mainStatus: 'You win!',
        subStatus: 'Well done! 🎉',
      },
      lose: {
        mainStatus: 'Game Over!',
        subStatus: 'You lose! Better start learning Assembly 😭',
      },
      wrong: {
        mainStatus: '',
        subStatus: isWrongGuess
          ? getFarewellText(languages[wrongGuessCount - 1].name)
          : '',
      },
      default: {
        mainStatus: '',
        subStatus: '',
      },
    };

    const { mainStatus, subStatus } = isGameOver
      ? isGameWon
        ? gameStates.win
        : gameStates.lose
      : isWrongGuess
      ? gameStates.wrong
      : gameStates.default;

    const className = clsx('game-status', {
      won: isGameWon,
      lost: isGameLost,
      wrong: isWrongGuess,
    });

    return (
      <section className={className} aria-live="polite" role="status">
        <h2>{mainStatus}</h2>
        <p>{subStatus}</p>
      </section>
    );
  };

  function keyboardRow(letters) {
    return letters.split('').map((letter) => {
      const isGuessed = guessedLetters.includes(letter);
      const isCorrect = isGuessed && currentWord.split('').includes(letter);
      const isWrong = isGuessed && !currentWord.split('').includes(letter);
      const className = clsx({
        correct: isCorrect,
        wrong: isWrong,
      });

      return (
        <button
          key={letter}
          onClick={() => handleKeyboardClick(letter)}
          className={clsx('keyboard-butt', className)}
          aria-disabled={guessedLetters.includes(letter) || isGameOver}
          aria-label={`letter ${letter}`}
          disabled={isGameOver}
        >
          {letter.toUpperCase()}
        </button>
      );
    });
  }

  function handleKeyboardClick(letter) {
    setGuessedLetters((prev) =>
      prev.includes(letter) ? prev : [...prev, letter]
    );
  }

  function handleNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  return (
    <main>
      {isGameWon && (
        <Confetti
          recycle={false}
          numberOfPieces={1000}
          width={windowSize.width}
          height={windowSize.height}
        />
      )}
      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word in under 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>
      {gameStatus()}
      <section className="language-container">{languageElements}</section>
      <section className="word-container">{letterElements}</section>

      {/* Combined visually-hidden aria-live region for status updates */}
      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWordArr.includes(lastLetterGuessed)
            ? `Correct! The letter ${lastLetterGuessed} is in the word`
            : `Sorry, the letter ${lastLetterGuessed} is not in the word`}
          You have {languages.length - 1 - wrongGuessCount} attempts left.
        </p>
        <p>
          Current word:{' '}
          {currentWordArr
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + '.' : 'blank'
            )
            .join(' ')}
        </p>
      </section>

      <section className="keyboard-container">
        <div className="keyboard-row">{qwertyTop}</div>
        <div className="keyboard-row">{qwertyMiddle}</div>
        <div className="keyboard-row">{qwertyBottom}</div>
      </section>
      {isGameOver && (
        <button className="new-game-butt" onClick={handleNewGame}>
          New Game
        </button>
      )}
    </main>
  );
};

export default App;
