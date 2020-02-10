import React from 'react';
import Flippy, { FrontSide, BackSide } from 'react-flippy';

const cardStyles = {
  width: 420,
  height: 280,
  background: 'white',
  borderRadius: 4,
  marginBottom: 20,
  cursor: 'pointer'
};

const sideStyles = {
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

export default ({ card, ...props }) => (
  <Flippy flipDirections="horizontal" style={cardStyles} {...props}>
    <FrontSide style={sideStyles}>
      <h1 style={{ marginTop: 0 }}>{card.verb}</h1>
      <h3 style={{ marginBottom: 0 }}>{card.mode}</h3>
    </FrontSide>
    <BackSide style={sideStyles}>
      {card.conjugations.map(({ pronoun, conjugation }, i) => (
        <p key={i}>
          {pronoun} <span style={{ fontWeight: 'bold' }}>{conjugation}</span>
        </p>
      ))}
    </BackSide>
  </Flippy>
);
