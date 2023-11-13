import { useState, useEffect, useRef, useParams } from 'react';
import { Container, Overlay, Tooltip, ProgressBar } from 'react-bootstrap';
import { getCookie } from '../../utils/CookiesUtil';
import './Clue.css';

const COINS_TO_GET_HINT = 5;
const MS_TO_HIDE_TOOLTIP = 2000;

export function Clue({
  clue,
  word,
  hashedAnswer,
  dir,
  isSolved,
  grid,
  currCell,
  playerID,
  getCompletedWordsIDs,
  markWordCellsAsCorrect,
  numberOfFreeHints,
  setNumberOfFreeHints,
  pnow,
  plabel,
  tid,
}) {
  // const userCoins = parseInt(getCookie("coins") || "0");
  const [isClueAvaliable, setIsClueAvaliable] = useState(true);
  const [showToolTip, setShowToolTip] = useState(false);
  const target = useRef(null);
  // const { tid } = useParams();

  useEffect(() => {
    if (isClueAvaliable) {
      if (isSolved || numberOfFreeHints === 0) setIsClueAvaliable(false);
    } else {
      if (!isSolved && numberOfFreeHints > 0) setIsClueAvaliable(true);
    }
  });

  async function getHint(clue, letterIndex, hashedAnswer) {
    const response = await fetch('api/v1/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clue,
        letterIndex,
        hashedAnswer,
        numberOfCluesAvaliable: numberOfFreeHints,
      }),
    });
    const res = await response.json();
    if (res.status !== 200) return '';
    return res.letter;
  }

  async function handleRequestHint() {
    const indicisToComplete = [];

    let [i, j] = currCell.dataset.pos
      .split(' ')
      .map(string => parseInt(string));

    let startIndex = -1;

    //if there is word down
    if (dir === 'DOWN') {
      //move i to start of word
      while (i > -1 && grid[i][j].char !== '#') {
        i--;
      }
      i++;

      startIndex = i;

      let letterIndex = 0;

      while (i < grid.length && grid[i][j].char !== '#') {
        if (!grid[i][j].isCorrect) {
          indicisToComplete.push(letterIndex);
        }
        i++;
        letterIndex++;
      }
    }
    //if there is word across
    else if (dir === 'ACROSS') {
      //check if word across is completed

      //move j to start of word
      while (j > -1 && grid[i][j].char !== '#') {
        j--;
      }
      j++;

      startIndex = j;

      let letterIndex = 0;

      while (j < grid.length && grid[i][j].char !== '#') {
        if (!grid[i][j].isCorrect) {
          indicisToComplete.push(letterIndex);
        }
        j++;
        letterIndex++;
      }
    }

    if (indicisToComplete.length === 0) return;

    let chosenLetterIndexToReveal =
      indicisToComplete[Math.floor(Math.random() * indicisToComplete.length)];
    let singleLetterToReveal = await getHint(
      clue,
      chosenLetterIndexToReveal,
      hashedAnswer,
    );

    if (singleLetterToReveal === '') return;

    let row = i,
      col = j;

    if (dir === 'DOWN') row = startIndex + chosenLetterIndexToReveal;
    else if (dir === 'ACROSS') col = startIndex + chosenLetterIndexToReveal;

    let cellToReveal = document.querySelector(
      `[data-pos="${row + ' ' + col}"]`,
    );
    cellToReveal.value = singleLetterToReveal;
    cellToReveal.classList.add('correct');
    if (playerID !== undefined) cellToReveal.dataset.playerid = playerID;
    grid[row][col].char = singleLetterToReveal;
    grid[row][col].isCorrect = true;
    getCompletedWordsIDs(row, col, cellToReveal).then(completedWordsIDs =>
      markWordCellsAsCorrect(completedWordsIDs),
    );
    currCell.focus();
    if (numberOfFreeHints > 0) setNumberOfFreeHints(prevValue => prevValue - 1);
  }

  if (clue === '') return;

  if (showToolTip) {
    setTimeout(() => {
      setShowToolTip(false);
    }, MS_TO_HIDE_TOOLTIP);
  }

  return (
    <>
      <Overlay target={target.current} show={showToolTip} placement="left">
        <Tooltip
          style={{ width: '20vmin' }}
          onClick={() => {
            handleRequestHint();
            setShowToolTip(prev => !prev);
          }}>
          {numberOfFreeHints > 0
            ? 'Click again to get hint'
            : 'This hint would cost 5 coins'}
        </Tooltip>
      </Overlay>
      {/* {isClueAvaliable ? (
        <svg
          id="hint-icon"
          className="clickable"
          width="5vmin"
          height="4vmin"
          fill="#f2c23f"
          viewBox="0 0 16 16"
          onClick={() => {
            if (showToolTip) {
              handleRequestHint();
              setShowToolTip(prev => !prev);
              return;
            }
            setShowToolTip(prev => !prev);
          }}
          ref={target}>
          <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z" />
        </svg>
      ) : (
        <svg
          id="hint-icon"
          width="4vmin"
          height="3vmin"
          fill="black"
          viewBox="0 0 16 16">
          <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z" />
        </svg>
      )} */}
      <Container className="d-flex flex-column align-items-center px-0">
        <div></div>
        <div className="d-flex flex-column justify-content-center align-items-center clue-wrapper">
          <div className="topic-title">
            Topic : {tid == 1 && 'Help your Teens to become more Confident'}
            {tid == 2 &&
              'Help and Support your Teens in Managing Academic Anxiety'}
            {tid == 3 &&
              'Help your Teens to deal with Peer Pressure Effectively'}
            {tid == 4 && 'Encourage Body Positivity in your Teens'}
            {tid == 5 && 'Help your Teens build a Growth Mindset'}
            {tid == 6 && 'Boost your Self-confidence'}
            {tid == 7 && 'Overcome your Academic Anxiety'}
            {tid == 8 && 'Deal with Peer Pressure in an ideal way'}
            {tid == 9 && 'How to for developing Positive Body Image'}
            {tid == 10 && 'Develop a Growth Mindset like a Boss'}
          </div>
          <ProgressBar
            style={{
              width: '95%',
              margin: '0.2em auto 0 auto',
              height: '0.2rem',
            }}
            animated
            now={pnow}
          />
          
          <div
            id="clue"
            style={{ fontSize: `${4.5 - clue.length * 0.03}vmin` }}
            className="my-2 text-center">
            {isSolved && (
              <svg
                id="solved-icon"
                width="4vmin"
                height="4.5vmin"
                fill="green"
                viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
              </svg>
            )}
            {clue}
          </div>
          {/* <div
            className="text-center"
            style={{
              color: 'lightgray',
              fontSize: `2.5vmin`,
            }}>
            {word}
          </div> */}
          {dir === 'ACROSS' ? (
            <svg
              className="mt-2"
              width="4vmin"
              height="4vmin"
              fill="currentColor"
              viewBox="0 0 16 16">
              <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
            </svg>
          ) : (
            <svg
              className="mt-2"
              width="4vmin"
              height="4vmin"
              fill="currentColor"
              viewBox="0 0 16 16">
              <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
            </svg>
          )}
        </div>
      </Container>
    </>
  );
}
