import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Container, ProgressBar } from 'react-bootstrap';
import { Cell } from '../../components/Cell/Cell';
import { Clue } from '../../components/Clue/Clue';
import { WinMessage } from '../../components/WinMessage/WinMessage';
import './SinglePlayer.css';

const FREE_HINTES_PER_GAME = 3;

let wordsAndCells = [];
let currCell = undefined;
let currDir = 'ACROSS';

export function SinglePlayer() {
  const { tid } = useParams();

  // const { state } = useLocation();
  console.log(tid);
  const state = {
    // game_id: 2,
    // gridSize: "Small",
    topic_id: 6,
  };
  // console.log(state.gridSize)
  // const gridSize = state.gridSize;
  // const game_id = state.game_id;
  const topic_id = tid;

  const [grid, setGrid] = useState([[]]);
  const [noWordStatus, setNoWordtatus] = useState(false);
  const [wordID, setWordID] = useState(-1);
  const [message, setMessage] = useState();
  const [solvedWordsIDs, setSolvedWordsIDs] = useState(new Set());
  const [numberOfFreeHints, setNumberOfFreeHints] =
    useState(FREE_HINTES_PER_GAME);

  //set up the grid according to the gridInfo
  function setUpGrid(gridInfo) {
    wordsAndCells = gridInfo.wordsAndCells;

    let grid = [];
    for (let i = 0; i < gridInfo.height; i++) {
      let row = [];
      for (let j = 0; j < gridInfo.width; j++) {
        row.push({ i, j, char: '#', word_id_across: -1, word_id_down: -1 });
      }
      grid.push(row);
    }

    for (let j in gridInfo.wordsAndCells) {
      let wordAndCell = gridInfo.wordsAndCells[j];
      const wordLength = wordAndCell.wordLength;
      const cell = wordAndCell.cell;

      if (cell.dir === 'DOWN') {
        for (let i = 0; i < wordLength; i++) {
          grid[cell.row + i][cell.col] = {
            ...grid[cell.row + i][cell.col],
            char: '',
            word_id_down: j,
          };
        }
      } else if (cell.dir === 'RIGHT') {
        for (let i = 0; i < wordLength; i++) {
          grid[cell.row][cell.col + i] = {
            ...grid[cell.row][cell.col + i],
            char: '',
            word_id_across: j,
          };
        }
      }
    }

    //clean chars from cell
    document.querySelectorAll('.cell').forEach((cell, idx) => {
      cell.value = '';
      cell.classList = [];
      cell.classList.add('cell');
      let j = idx % grid.length;
      let i = (idx - j) / grid.length;
      if (grid[i][j].char === '#') cell.classList.add('block');
    });

    setGrid(grid);
  }

  //get the grid from the server and set it up
  useEffect(() => {
    //return client to home page on reload
    window.onbeforeunload = () => {
      setTimeout(() => {
        window.location = '/';
      }, 10);
      window.onbeforeunload = null;
    };

    startGame();
    console.log('wordsAndCells');
    console.log(wordsAndCells.length);
    setTimeout(()=>{
        setNoWordtatus(true);
    },5000)
  }, []);

  function startGame() {
    wordsAndCells = [];
    currCell = undefined;
    currDir = 'ACROSS';

    setSolvedWordsIDs(new Set());
    setWordID(-1);
    setNumberOfFreeHints(FREE_HINTES_PER_GAME);

    // fetch("/api/v1/crossword_game", {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ gridSize })
    // }).then(response => response.json())
    //     .then(res => setUpGrid(res));
    fetch(
      'https://api.youniversapp.com/api/v1/game/game-cross-word-question-list',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id }),
      },
    )
      .then(response => response.json())
      .then(res => {
        if (res.status == 200) {
          setUpGrid(res.data);
        } else if (res.status == 400) {
          setMessage(res.message);
        } else {
          setMessage('Opps!! Some Thing went wrong!');
        }
      });
  }

  //select the first cell when grid is created
  useEffect(() => {
    let cells = document.querySelectorAll('.cell');
    if (cells.length > 0) {
      for (let cell of cells) {
        if (cell.classList.contains('block')) continue;

        selectCell(cell);
        break;
      }
    }
  }, [grid]);

  async function checkAnswer(answer, guess) {
    // console.log(answer)
    // console.log(guess)
    // const msgUint8 = new TextEncoder().encode(guess);                           // encode as (utf-8) Uint8Array
    // const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    // const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    // const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    // return answer === hashHex;
    // answer = "weight"
    return answer === guess;
  }

  async function getCompletedWordsIDs(i, j, cell) {
    let result = { down: -1, across: -1 };

    //if there is word down
    if (cell.dataset.word_id_down !== '-1') {
      //check if word down is completed

      let row = i;
      let col = j;

      //move i to start of word
      while (row > -1 && grid[row][col].char !== '#') {
        row--;
      }
      row++;

      let word = '';

      let hasCompleteWord = true;

      while (row < grid.length && grid[row][col].char !== '#') {
        if (grid[row][col].char === '') {
          hasCompleteWord = false;
          break;
        }
        word += grid[row][col].char;
        row++;
      }
      if (
        hasCompleteWord &&
        (await checkAnswer(wordsAndCells[cell.dataset.word_id_down].word, word))
      ) {
        result.down = cell.dataset.word_id_down;
      }
    }

    //if there is word across
    if (cell.dataset.word_id_across !== '-1') {
      //check if word across is completed

      //move j to start of word
      while (j > -1 && grid[i][j].char !== '#') {
        j--;
      }
      j++;

      let word = '';

      let hasCompleteWord = true;

      while (j < grid.length && grid[i][j].char !== '#') {
        if (grid[i][j].char === '') {
          hasCompleteWord = false;
          break;
        }
        word += grid[i][j].char;
        j++;
      }

      if (
        hasCompleteWord &&
        (await checkAnswer(
          wordsAndCells[cell.dataset.word_id_across].word,
          word,
        ))
      ) {
        result.across = cell.dataset.word_id_across;
      }
    }

    return result;
  }

  function markWordCellsAsCorrect(wordIDs) {
    if (wordIDs.down !== -1) {
      setSolvedWordsIDs(prevState => new Set(prevState).add(wordIDs.down));
      //select the down cells
      document
        .querySelectorAll(`[data-word_id_down="${wordIDs.down}"]`)
        .forEach(cell => {
          cell.classList.add('correct');
          let [i, j] = cell.dataset.pos
            .split(' ')
            .map(string => parseInt(string));
          grid[i][j].isCorrect = true;
          console.log('isCorrect');
          console.log(grid[i][j].isCorrect);
        });
    }

    if (wordIDs.across !== -1) {
      setSolvedWordsIDs(prevState => new Set(prevState).add(wordIDs.across));
      //select the across cells
      document
        .querySelectorAll(`[data-word_id_across="${wordIDs.across}"]`)
        .forEach(cell => {
          cell.classList.add('correct');
          let [i, j] = cell.dataset.pos
            .split(' ')
            .map(string => parseInt(string));
          grid[i][j].isCorrect = true;
          console.log('isCorrect');
          console.log(grid[i][j].isCorrect);
        });
    }
  }

  async function goToNextCell() {
    //get the position of currCell
    let [i, j] = currCell.dataset.pos
      .split(' ')
      .map(string => parseInt(string));

    let completedWordsIDs = { down: -1, across: -1 };

    //if the cell is not correct already
    if (!currCell.classList.contains('correct')) {
      completedWordsIDs = await getCompletedWordsIDs(i, j, currCell);

      markWordCellsAsCorrect(completedWordsIDs);
    }

    //go to next cell automatically
    if (currDir === 'DOWN') {
      //word down has been completed
      if (completedWordsIDs.down !== -1) return;

      i++;

      if (i === grid.length) return;
      if (grid[i][j].char === '#') return;

      let cellToSelect = document.querySelector(`[data-pos="${i + ' ' + j}"]`);

      selectCell(cellToSelect);

      return;
    }

    if (currDir === 'ACROSS') {
      //word down has been completed
      if (completedWordsIDs.across !== -1) return;

      j++;

      if (j === grid[0].length) return;
      if (grid[i][j].char === '#') return;

      let cellToSelect = document.querySelector(`[data-pos="${i + ' ' + j}"]`);

      selectCell(cellToSelect);
    }
  }

  function goToPreviousCell() {
    //go to previous cell automatically
    let [i, j] = currCell.dataset.pos
      .split(' ')
      .map(string => parseInt(string));

    if (currDir === 'DOWN') {
      i--;

      if (i === -1) return;
      if (grid[i][j].char === '#') return;

      let cellToSelect = document.querySelector(`[data-pos="${i + ' ' + j}"]`);

      if (!cellToSelect.classList.contains('correct')) {
        cellToSelect.value = '';
        grid[i][j].char = '';
      }

      selectCell(cellToSelect);

      return;
    }

    if (currDir === 'ACROSS') {
      j--;

      if (j === -1) return;
      if (grid[i][j].char === '#') return;

      let cellToSelect = document.querySelector(`[data-pos="${i + ' ' + j}"]`);

      if (!cellToSelect.classList.contains('correct')) {
        cellToSelect.value = '';
        grid[i][j].char = '';
      }

      selectCell(cellToSelect);
    }
  }

  function selectWord(target) {
    if (currDir === 'DOWN') {
      //select the down cells
      document
        .querySelectorAll(
          `[data-word_id_down="${target.dataset.word_id_down}"]`,
        )
        .forEach(cell => {
          cell.classList.add('word-selected');
        });
    } else if (currDir === 'ACROSS') {
      //select the across cells
      document
        .querySelectorAll(
          `[data-word_id_across="${target.dataset.word_id_across}"]`,
        )
        .forEach(cell => {
          cell.classList.add('word-selected');
        });
    }
  }

  function unSelectWord(target) {
    if (currDir === 'ACROSS' && target.dataset.word_id_across !== '-1') {
      //unselect the across cells
      document
        .querySelectorAll(
          `[data-word_id_across="${target.dataset.word_id_across}"]`,
        )
        .forEach(cell => {
          cell.classList.remove('word-selected');
        });
    } else if (currDir === 'DOWN' && target.dataset.word_id_down !== '-1') {
      //unselect the down cells
      document
        .querySelectorAll(
          `[data-word_id_down="${target.dataset.word_id_down}"]`,
        )
        .forEach(cell => {
          cell.classList.remove('word-selected');
        });
    }
  }

  function selectCell(target) {
    if (target.classList.contains('block')) {
      if (currCell !== undefined) currCell.focus();
      return;
    }

    if (currCell !== undefined) {
      unSelectWord(currCell);
      currCell.classList.remove('selected');
    }

    //if this is the same cell then replace selected to across or down according to the current state
    if (currCell !== undefined && currCell === target) {
      if (currDir === 'ACROSS' && target.dataset.word_id_down !== '-1') {
        currDir = 'DOWN';
      } else if (currDir === 'DOWN' && target.dataset.word_id_across !== '-1') {
        currDir = 'ACROSS';
      }
    } else {
      if (
        target.dataset.word_id_across !== '-1' &&
        target.dataset.word_id_down !== '-1'
      ) {
        if (
          currDir === 'ACROSS' &&
          solvedWordsIDs.has(target.dataset.word_id_across) &&
          !solvedWordsIDs.has(target.dataset.word_id_down)
        ) {
          currDir = 'DOWN';
        } else if (
          currDir === 'DOWN' &&
          !solvedWordsIDs.has(target.dataset.word_id_across) &&
          solvedWordsIDs.has(target.dataset.word_id_down)
        ) {
          currDir = 'ACROSS';
        }
      } else if (
        currDir === 'ACROSS' &&
        target.dataset.word_id_across === '-1'
      ) {
        currDir = 'DOWN';
      } else if (currDir === 'DOWN' && target.dataset.word_id_down === '-1') {
        currDir = 'ACROSS';
      }
    }

    selectWord(target);

    target.classList.add('selected');
    target.focus();
    currCell = target;
    if (currDir === 'DOWN') {
      setWordID(currCell.dataset.word_id_down);
    } else if (currDir === 'ACROSS') {
      setWordID(currCell.dataset.word_id_across);
    }
  }

  const progress =
    wordsAndCells.length === 0
      ? 0
      : ((solvedWordsIDs.size * 1.0) / wordsAndCells.length) * 100;

  const clue = wordsAndCells[wordID]?.clue || '';
  const solvedWord = wordsAndCells[wordID]?.wordSecret || ''; //for development only
  const [showPoPMessage, setShowPOPMessage] = useState(false);
  const popMessage = () => {
    // startGame();
    return window.ReactNativeWebView.postMessage('Done');
    // setShowPOPMessage(true)
  };
  return (
    <>
      {wordsAndCells.length !== 0 &&
        solvedWordsIDs.size === wordsAndCells.length &&
        popMessage()}
      {wordsAndCells.length >= 2 ? (
        <>
          <Container
            className="grid fade-in-text px-0"
            style={{
              '--height': grid.length,
              '--width': grid[0].length,
            }}>
            {grid.map(row => {
              return row.map(cell => {
                return (
                  <Cell
                    key={cell.i + ' ' + cell.j}
                    cell={cell}
                    onClick={selectCell}
                    goToNextCell={goToNextCell}
                    goToPreviousCell={goToPreviousCell}
                    grid={grid}
                  />
                );
              });
            })}
          </Container>
        </>
      ) : (
        <>
          <div className="noword delay-1">
            {noWordStatus && (<h4>No question found regarding this topics</h4>)}
          </div>
        </>
      )}

      <Container
        id="clue"
        className="text-center text-black pt-1 pb-1"
        style={{ fontSize: `${3.6 - clue.length * 0.01}vmin` }}>
        <Clue
          clue={clue}
          word={solvedWord} //for development only
          hashedAnswer={wordsAndCells[wordID]?.word}
          dir={currDir}
          isSolved={solvedWordsIDs.has(wordID)}
          grid={grid}
          currCell={currCell}
          playerID={undefined}
          getCompletedWordsIDs={getCompletedWordsIDs}
          markWordCellsAsCorrect={markWordCellsAsCorrect}
          numberOfFreeHints={numberOfFreeHints}
          tid={tid}
          setNumberOfFreeHints={setNumberOfFreeHints}
          pnow={progress}
          plabel={solvedWordsIDs.size}
        />
      </Container>
      {/* <button onClick={popMessage}>Message</button> */}
    </>
  );
}
