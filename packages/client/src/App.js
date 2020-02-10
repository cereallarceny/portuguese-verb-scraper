import React, { useState, useEffect } from 'react';
import Card from './Card';

import regularVerbs from './data/regular-verbs.json';
import irregularVerbs from './data/irregular-verbs.json';

const containerStyles = {
  width: 600,
  height: 600,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

const cardsRemainingContainerStyles = {
  display: 'flex',
  width: '100%',
  marginBottom: 40
};

const cardsRemainingStyles = {
  flexGrow: 1,
  flexBasis: 0,
  textAlign: 'center'
};

const buttonContainerStyles = cardsRemainingContainerStyles;

const buttonStyles = {
  flexGrow: 1,
  flexBasis: 0,
  marginLeft: 10,
  marginRight: 10,
  height: 30,
  background: 'aliceblue',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  borderRadius: 4
};

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

const getCardsFromVerbs = verbs => {
  const temp = [];

  verbs.forEach(verb => {
    verb.types.forEach(type => {
      type.modes.forEach(mode => {
        temp.push({
          mode: mode.name,
          conjugations: mode.conjugations,
          verb: verb.name,
          type: type.name
        });
      });
    });
  });

  return temp;
};

const moveCardToDeck = (from, to, index = 0) => {
  const card = from[index];
  const newFromArray = from.filter((_, i) => i !== index);
  const newToArray = [...to, card];

  return {
    oldFrom: from,
    newFrom: newFromArray,
    oldTo: to,
    newTo: newToArray
  };
};

const formatCardsRemaining = count =>
  count === 1 ? '1 card' : `${count} cards`;

export default () => {
  const verbs = [...regularVerbs, ...irregularVerbs];
  const cards = getCardsFromVerbs(verbs);
  const shuffledCards = shuffle(cards);

  const [deck, setDeck] = useState(shuffledCards);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [goodDeck, setGoodDeck] = useState([]);
  const [badDeck, setBadDeck] = useState([]);
  const [skipDeck, setSkipDeck] = useState([]);
  const [currentFlipped, setCurrentFlipped] = useState(false);

  const drawCard = () => {
    const { newFrom, newTo } = moveCardToDeck(deck, currentDeck);

    setDeck(newFrom);
    setCurrentDeck([newTo[newTo.length - 1]]);
  };

  const unflip = async () => {
    if (currentFlipped) {
      setCurrentFlipped(false);

      await new Promise(r => setTimeout(r, 1000));
    }
  };

  const setGood = async () => {
    const { newFrom, newTo } = moveCardToDeck(currentDeck, goodDeck);

    await unflip();
    setCurrentDeck(newFrom);
    setGoodDeck(newTo);
    drawCard();
  };

  const setBad = async () => {
    const { newFrom, newTo } = moveCardToDeck(currentDeck, badDeck);

    await unflip();
    setCurrentDeck(newFrom);
    setBadDeck(newTo);
    drawCard();
  };

  const setSkip = async () => {
    const { newFrom, newTo } = moveCardToDeck(currentDeck, skipDeck);

    await unflip();
    setCurrentDeck(newFrom);
    setSkipDeck(newTo);
    drawCard();
  };

  useEffect(() => {
    drawCard();
  }, []);

  if (process.env.NODE_ENV === 'development') {
    console.log('Deck', deck.length);
    console.log('Current', currentDeck.length);
    console.log('Good', goodDeck.length);
    console.log('Bad', badDeck.length);
    console.log('Skip', skipDeck.length);
    console.log('-----');
  }

  return (
    <div style={containerStyles}>
      <div style={cardsRemainingContainerStyles}>
        <span style={cardsRemainingStyles}>
          {formatCardsRemaining(goodDeck.length)}
        </span>
        <span style={cardsRemainingStyles}>
          {formatCardsRemaining(badDeck.length)}
        </span>
        <span style={cardsRemainingStyles}>
          {formatCardsRemaining(skipDeck.length)}
        </span>
      </div>
      <div style={buttonContainerStyles}>
        <button style={buttonStyles} onClick={setGood}>
          Move to Good
        </button>
        <button style={buttonStyles} onClick={setBad}>
          Move to Bad
        </button>
        <button style={buttonStyles} onClick={setSkip}>
          Move to Skip
        </button>
      </div>
      {currentDeck.map((card, i) => (
        <div onClick={() => setCurrentFlipped(!currentFlipped)}>
          <Card card={card} isFlipped={currentFlipped} key={i} />
        </div>
      ))}
    </div>
  );
};
