import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { getSum } from "../../utils/ArrayUtil";
import { Container } from 'react-bootstrap';
import { Cell } from "../../components/Cell/Cell";
import { Clue } from "../../components/Clue/Clue";
import { MultiplayerProgressBar } from "../../components/MultiplayerProgressBar/MultiplayerProgressBar";
import { WinMessage } from "../../components/WinMessage/WinMessage";
import "./MultiPlayer.css";

export const indicisToColor = {
    0: "Green",
    1: "Red",
    2: "Yellow",
    3: "Blue"
};

const FREE_HINTES_PER_GAME = 3;

let wordsAndCells = [];
let lockedWordsIDs = new Set();
let currCell = undefined;
let currDir = "ACROSS";
let gameID = -1;
let playerID = -1;

export function MultiPlayer() {

    var { state } = useLocation();
    var numberOfPlayers = parseInt(state.numberOfPlayers);
    var gridSize = state.gridSize;
    const GAME_ID = state.gameID;

    const [grid, setGrid] = useState([[]]);
    const [wordID, setWordID] = useState(-1);
    const [solvedWordsIDs, setSolvedWordsIDs] = useState(new Set());
    const [wordsSolvedByPlayers, setWordsSolvedByPlayers] = useState(new Array(numberOfPlayers).fill(0));
    const [isGameFound, setGameFound] = useState(false);
    const [numberOfFreeHints, setNumberOfFreeHints] = useState(FREE_HINTES_PER_GAME);

    const [dots, setDots] = useState(".");

    const [socket, setSocket] = useState(null);

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

            if (cell.dir === "DOWN") {
                for (let i = 0; i < wordLength; i++) {
                    grid[cell.row + i][cell.col] = {
                        ...grid[cell.row + i][cell.col],
                        char: '',
                        word_id_down: j,
                        isCorrect: false
                    };
                }
            } else if (cell.dir === "RIGHT") {
                for (let i = 0; i < wordLength; i++) {
                    grid[cell.row][cell.col + i] = {
                        ...grid[cell.row][cell.col + i],
                        char: '',
                        word_id_across: j,
                        isCorrect: false
                    };
                }
            }
        }

        //clean chars from cell
        document.querySelectorAll(".cell").forEach((cell, idx) => {
            cell.value = "";
            cell.classList = [];
            cell.classList.add("cell");
            let j = idx % grid.length;
            let i = (idx - j) / grid.length;
            if (grid[i][j].char === "#") cell.classList.add("block");
        });

        setGrid(grid);
    }

    //onMount, start a socket connection to the server
    useEffect(() => {

        //return client to home page on reload
        window.onbeforeunload = () => {
            setTimeout(() => {
                window.location = "/";
            }, 10);
            window.onbeforeunload = null;
        }

        const newSocket = io("/");

        if (GAME_ID === undefined) newSocket.emit("search for game", numberOfPlayers, gridSize);
        else newSocket.emit("join to specific game", GAME_ID, numberOfPlayers, gridSize);

        newSocket.on("game start", (gridInfo, gameId, playerId, gridsize, numberofplayers) => {

            wordsAndCells = [];
            lockedWordsIDs = new Set();
            currCell = undefined;
            currDir = "ACROSS";
            gameID = -1;
            playerID = -1;

            gameID = gameId;
            state.gridSize = gridsize;
            state.numberOfPlayers = numberofplayers;
            playerID = playerId;
            setUpGrid(gridInfo);
            setSolvedWordsIDs(new Set());
            setWordsSolvedByPlayers(new Array(numberofplayers).fill(0));
            setWordID(-1);
            setNumberOfFreeHints(FREE_HINTES_PER_GAME);
        });

        newSocket.on("lock word", (wordIDToLock, wordIDToUnlock) => {
            if (wordIDToUnlock !== -1) {

                let shouldContinue = false;

                document.querySelectorAll(`[data-word_id_down="${wordIDToUnlock}"]`)
                    .forEach(cell => {
                        cell.classList.remove("word-locked");
                        shouldContinue = true;
                    });

                if (!shouldContinue) {
                    document.querySelectorAll(`[data-word_id_across="${wordIDToUnlock}"]`)
                        .forEach(cell => {
                            cell.classList.remove("word-locked");
                        });
                }

                lockedWordsIDs.delete(wordIDToUnlock);
            }

            if (wordIDToLock !== -1) lockedWordsIDs.add(wordIDToLock);
            updateLockedWords();
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);


    async function sendRequestToSelectWord(wordIDToLock) {
        return await new Promise((resolve, reject) => {
            socket.emit("request to lock word", gameID, wordIDToLock, wordID, (response) => {
                resolve(response);
            });
        });
    }

    //select the avaliable word when grid is created
    useEffect(() => {
        if (socket === null) return;

        socket.off("solved word");

        socket.on("solved word", (otherPlayerID, wordID, dir, solution) => {

            if (dir === "DOWN") {
                Array.from(document.querySelectorAll(`[data-word_id_down="${wordID}"]`))
                    .sort((a, b) => {
                        let aRow = parseInt(a.dataset.pos.split(" ")[0]);
                        let bRow = parseInt(b.dataset.pos.split(" ")[0]);

                        return aRow - bRow;
                    })
                    .forEach((cell, i) => {
                        cell.value = solution[i];
                        cell.classList.add("correct");
                        if (cell.dataset.playerid === undefined || cell.dataset.playerid !== "" + playerID) {
                            cell.dataset.playerid = otherPlayerID;
                        }
                        let [row, col] = cell.dataset.pos.split(" ").map((string) => parseInt(string));
                        grid[row][col].char = solution[i];
                        grid[row][col].isCorrect = true;
                    });
            }
            else {
                Array.from(document.querySelectorAll(`[data-word_id_across="${wordID}"]`))
                    .sort((a, b) => {
                        let aRow = parseInt(a.dataset.pos.split(" ")[1]);
                        let bRow = parseInt(b.dataset.pos.split(" ")[1]);

                        return aRow - bRow;
                    })
                    .forEach((cell, i) => {
                        cell.value = solution[i];
                        cell.classList.add("correct");
                        if (cell.dataset.playerid === undefined || cell.dataset.playerid !== "" + playerID) {
                            cell.dataset.playerid = otherPlayerID;
                        }
                        let [row, col] = cell.dataset.pos.split(" ").map((string) => parseInt(string));
                        grid[row][col].char = solution[i];
                        grid[row][col].isCorrect = true;
                    });
            }

            setSolvedWordsIDs(prevState => new Set(prevState).add(wordID));
            setWordsSolvedByPlayers(prevValue => {
                let newArray = [...prevValue];
                newArray[otherPlayerID]++;
                return newArray;
            });
        });

    }, [grid]);

    async function selectACellAtStart() {
        let cells = document.querySelectorAll(".cell");
        if (cells.length > 0) {
            for (let cell of cells) {
                if (cell.classList.contains("block")) continue;

                let isApproved = await selectCell(cell);
                if (isApproved) break;
            }
        }
    }


    //allow all players to solve the last words
    useEffect(() => {
        //allow all players to solve the last words
        if (wordsAndCells.length - solvedWordsIDs.size < numberOfPlayers) {
            //remove lock on words
            document.querySelectorAll(".cell").forEach(cell => {
                if (cell.classList.contains("word-locked")) {
                    cell.classList.remove("word-locked");
                }
            });
        }
    }, [solvedWordsIDs]);


    function updateLockedWords() {
        for (let wordIDToLock of lockedWordsIDs) {
            let shouldContinue = false;
            document.querySelectorAll(`[data-word_id_down="${wordIDToLock}"]`)
                .forEach(cell => {
                    cell.classList.add("word-locked");
                    shouldContinue = true;
                });

            if (shouldContinue) continue;

            document.querySelectorAll(`[data-word_id_across="${wordIDToLock}"]`)
                .forEach(cell => {
                    cell.classList.add("word-locked");
                });
        }
    }

    async function checkAnswer(answer, guess) {
        const msgUint8 = new TextEncoder().encode(guess);                           // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        return answer === hashHex;
    }

    async function getCompletedWordsIDs(i, j, cell) {

        let result = { down: -1, across: -1 };

        //if there is word down
        if (cell.dataset.word_id_down !== "-1") {
            //check if word down is completed

            let row = i;
            let col = j;

            //move i to start of word
            while (row > -1 && grid[row][col].char !== '#') {
                row--;
            }
            row++;

            let word = "";

            let hasCompleteWord = true;

            while (row < grid.length && grid[row][col].char !== '#') {
                if (grid[row][col].char === '') {
                    hasCompleteWord = false;
                    break;
                }
                word += grid[row][col].char;
                row++;
            }

            if (hasCompleteWord &&
                await checkAnswer(wordsAndCells[cell.dataset.word_id_down].word, word)) {
                result.down = { id: cell.dataset.word_id_down, solution: word };
            }
        }


        //if there is word across
        if (cell.dataset.word_id_across !== "-1") {
            //check if word across is completed

            //move j to start of word
            while (j > -1 && grid[i][j].char !== '#') {
                j--;
            }
            j++;

            let word = "";

            let hasCompleteWord = true;

            while (j < grid.length && grid[i][j].char !== '#') {
                if (grid[i][j].char === '') {
                    hasCompleteWord = false;
                    break;
                }
                word += grid[i][j].char;
                j++;
            }

            if (hasCompleteWord &&
                await checkAnswer(wordsAndCells[cell.dataset.word_id_across].word, word)) {
                result.across = { id: cell.dataset.word_id_across, solution: word };
            }
        }

        return result;
    }

    function markWordCellsAsCorrect(wordIDs) {

        let add = 0;

        if (wordIDs.down !== -1) {
            setSolvedWordsIDs(prevState => new Set(prevState).add(wordIDs.down.id));
            //emit to every other client in game that this word is solved
            socket.emit("solved word", gameID, playerID, wordIDs.down.id, "DOWN", wordIDs.down.solution, getSum(wordsSolvedByPlayers) + 1 === wordsAndCells.length);
            //select the down cells
            document.querySelectorAll(`[data-word_id_down="${wordIDs.down.id}"]`)
                .forEach(cell => {
                    cell.classList.add("correct");
                    cell.dataset.playerid = playerID;
                    let [i, j] = cell.dataset.pos.split(" ").map((string) => parseInt(string));
                    grid[i][j].isCorrect = true;
                });
            add++;
        }

        if (wordIDs.across !== -1) {
            setSolvedWordsIDs(prevState => new Set(prevState).add(wordIDs.across.id));
            //emit to every other client in game that this word is solved
            socket.emit("solved word", gameID, playerID, wordIDs.across.id, "ACROSS", wordIDs.across.solution, getSum(wordsSolvedByPlayers) + add + 1 === wordsAndCells.length);
            //select the across cells
            document.querySelectorAll(`[data-word_id_across="${wordIDs.across.id}"]`)
                .forEach(cell => {
                    cell.classList.add("correct");
                    cell.dataset.playerid = playerID;
                    let [i, j] = cell.dataset.pos.split(" ").map((string) => parseInt(string));
                    grid[i][j].isCorrect = true;
                });
            add++;
        }

        setWordsSolvedByPlayers(prevValue => {
            let newArray = [...prevValue];
            newArray[playerID] += add;
            return newArray;
        });
    }


    async function goToNextCell() {

        //get the position of currCell
        let [i, j] = currCell.dataset.pos.split(" ").map((string) => parseInt(string));

        let completedWordsIDs = { down: -1, across: -1 };
        //if the cell is not correct already
        if (!isCorrect(currCell)) {
            completedWordsIDs = await getCompletedWordsIDs(i, j, currCell);

            markWordCellsAsCorrect(completedWordsIDs);
        }

        //go to next cell automatically
        if (currDir === "DOWN") {

            //word down has been completed
            if (completedWordsIDs.down !== -1) return;

            i++;

            if (i === grid.length) return;
            if (grid[i][j].char === "#") return;

            let cellToSelect = document.querySelector(`[data-pos="${i + " " + j}"]`);

            selectCell(cellToSelect);

            return;
        }

        if (currDir === "ACROSS") {

            //word down has been completed
            if (completedWordsIDs.across !== -1) return;

            j++;

            if (j === grid[0].length) return;
            if (grid[i][j].char === "#") return;

            let cellToSelect = document.querySelector(`[data-pos="${i + " " + j}"]`);

            selectCell(cellToSelect);
        }
    }

    function goToPreviousCell() {

        //go to previous cell automatically
        let [i, j] = currCell.dataset.pos.split(" ").map((string) => parseInt(string));

        if (currDir === "DOWN") {
            i--;

            if (i === -1) return;
            if (grid[i][j].char === "#") return;

            let cellToSelect = document.querySelector(`[data-pos="${i + " " + j}"]`);

            if (!isCorrect(cellToSelect)) {
                cellToSelect.value = "";
                grid[i][j].char = '';
            }

            selectCell(cellToSelect);

            return;
        }

        if (currDir === "ACROSS") {
            j--;

            if (j === -1) return;
            if (grid[i][j].char === "#") return;

            let cellToSelect = document.querySelector(`[data-pos="${i + " " + j}"]`);

            if (!isCorrect(cellToSelect)) {
                cellToSelect.value = "";
                grid[i][j].char = '';
            }

            selectCell(cellToSelect);
        }
    }


    function isCorrect(cell) {
        return cell.classList.contains("correct");
    }

    function selectWord(target) {
        if (currDir === "DOWN") {
            //select the down cells
            document.querySelectorAll(`[data-word_id_down="${target.dataset.word_id_down}"]`)
                .forEach(cell => {
                    cell.classList.add("word-selected");
                });
        }
        else if (currDir === "ACROSS") {
            //select the across cells
            document.querySelectorAll(`[data-word_id_across="${target.dataset.word_id_across}"]`)
                .forEach(cell => {
                    cell.classList.add("word-selected");
                });
        }
    }

    function unSelectWord(target, dir) {
        if (dir === "ACROSS" && target.dataset.word_id_across !== "-1") {
            //unselect the across cells
            document.querySelectorAll(`[data-word_id_across="${target.dataset.word_id_across}"]`)
                .forEach(cell => {
                    cell.classList.remove("word-selected");
                });
        }
        else if (dir === "DOWN" && target.dataset.word_id_down !== "-1") {
            //unselect the down cells
            document.querySelectorAll(`[data-word_id_down="${target.dataset.word_id_down}"]`)
                .forEach(cell => {
                    cell.classList.remove("word-selected");
                });
        }
    }

    function updateSelectedCell(target) {
        target.classList.add("selected");
        target.focus();
        currCell = target;
    }

    async function selectCell(target) {

        //if the cell is blocked
        if (target.classList.contains("block")) return;

        let localWordID;
        let prevDir = currDir;

        //if same cell
        if (currCell === target) {
            // then replace selected to across or down according to the current state
            if (currDir === "ACROSS" && target.dataset.word_id_down !== "-1") {
                currDir = "DOWN";
            }
            else if (currDir === "DOWN" && target.dataset.word_id_across !== "-1") {
                currDir = "ACROSS";
            }
            //if the cell has only one word it can select
            //then this word has already been selected
            else return true;

            localWordID = currDir === "DOWN" ? target.dataset.word_id_down : target.dataset.word_id_across;

            //allow all players to select solved word & allow all players to solve the last words
            if (wordsAndCells.length - (solvedWordsIDs.size) >= numberOfPlayers) {
                const hasBeenApproved = await sendRequestToSelectWord(solvedWordsIDs.has(localWordID) ? -1 : localWordID);
                if (!hasBeenApproved) {
                    //re-foucs on the selected cell
                    if (currCell !== undefined) {
                        currCell.focus();
                        currDir = prevDir;
                    }
                    return false;
                }
            }

            //unselect word
            unSelectWord(currCell, prevDir);
            //select the new word
            selectWord(target);

            setWordID(localWordID);

            return true;
        }
        //not same cell
        else {
            if (currDir === "ACROSS" && solvedWordsIDs.has(target.dataset.word_id_across) && !solvedWordsIDs.has(target.dataset.word_id_down)) {
                currDir = "DOWN";
            }
            else if (currDir === "DOWN" && !solvedWordsIDs.has(target.dataset.word_id_across) && solvedWordsIDs.has(target.dataset.word_id_down)) {
                currDir = "ACROSS";
            }
            else if (currDir === "ACROSS" && target.dataset.word_id_across === "-1") {
                currDir = "DOWN";
            }
            else if (currDir === "DOWN" && target.dataset.word_id_down === "-1") {
                currDir = "ACROSS";
            }

            localWordID = currDir === "DOWN" ? target.dataset.word_id_down : target.dataset.word_id_across;

            if (wordID !== localWordID) {
                //allow all players to select solved word & allow all players to solve the last words
                if (wordsAndCells.length - (solvedWordsIDs.size) >= numberOfPlayers) {
                    const hasBeenApproved = await sendRequestToSelectWord(solvedWordsIDs.has(localWordID) ? -1 : localWordID);
                    if (!hasBeenApproved) {

                        if (target.dataset.word_id_across === "-1" || target.dataset.word_id_down === "-1") {
                            //re-foucs on the selected cell
                            if (currCell !== undefined) {
                                currCell.focus();
                            }
                            return false;
                        }

                        currDir = currDir === "DOWN" ? "ACROSS" : "DOWN";
                        localWordID = currDir === "DOWN" ? target.dataset.word_id_down : target.dataset.word_id_across;
                        const secondDirHasBeenApproved = await sendRequestToSelectWord(localWordID);
                        if (!secondDirHasBeenApproved) {
                            //re-foucs on the selected cell
                            if (currCell !== undefined) {
                                currCell.focus();
                            }
                            return false;
                        }
                    }
                }

                //unselect word
                if (currCell !== undefined) unSelectWord(currCell, prevDir);
                //select the new word
                selectWord(target);

                setWordID(localWordID);
            }

            //unselect the previous cell
            if (currCell !== undefined) currCell.classList.remove("selected");

            updateSelectedCell(target);
            return true;
        }
    }

    //if searching for players
    if (grid[0].length === 0) {

        setTimeout(() => {
            setDots(prevValue => {
                if (prevValue === "...") return ".";
                return prevValue + ".";
            })
        }, 800);

        return (
            <>
                <h1 id="searching-players-message" className="text-center fade-in-text">{GAME_ID === undefined ? "Searching " : "Waiting "}for players{dots}</h1>
                {GAME_ID !== undefined &&
                    <div className="text-center mt-3">
                        <h1>Enter this game code to join:</h1>
                        <h1>{GAME_ID}</h1>
                    </div>
                }
            </>
        );
    }
    else if (!isGameFound) {

        setTimeout(() => {
            setGameFound(true);
            // selectACellAtStart();
        }, 1200);

        return (
            <h1 id="searching-players-message" className="text-center fade-in-text">Ready to play!</h1>
        );
    }

    const clue = wordsAndCells[wordID]?.clue || "";
    const solvedWord = wordsAndCells[wordID]?.wordSecret || ""; //for development only

    return (
        <>
            <Container>
                <MultiplayerProgressBar wordsSolvedByPlayers={wordsSolvedByPlayers} totalNumberOfWords={wordsAndCells.length} />
                <Clue clue={clue}
                    word={solvedWord} //for development only
                    hashedAnswer={wordsAndCells[wordID]?.word}
                    dir={currDir}
                    isSolved={solvedWordsIDs.has(wordID)}
                    grid={grid}
                    currCell={currCell}
                    playerID={playerID}
                    getCompletedWordsIDs={getCompletedWordsIDs}
                    markWordCellsAsCorrect={markWordCellsAsCorrect}
                    numberOfFreeHints={numberOfFreeHints}
                    setNumberOfFreeHints={setNumberOfFreeHints} />
            </Container>

            {wordsAndCells.length !== 0 &&
                solvedWordsIDs.size === wordsAndCells.length &&
                <WinMessage playerID={playerID}
                    wordsSolvedByPlayers={wordsSolvedByPlayers}
                    socket={socket}
                    gameID={gameID}
                    numberOfPlayers={numberOfPlayers}
                    gridSize={gridSize} />}

            <Container
                className="grid fade-in-text"
                style={{
                    "--height": grid.length,
                    "--width": grid[0].length,
                }} >

                {grid.map((row) => {
                    return (
                        row.map((cell) => {
                            return (
                                <Cell key={cell.i + " " + cell.j}
                                    cell={cell}
                                    onClick={selectCell}
                                    goToNextCell={goToNextCell}
                                    goToPreviousCell={goToPreviousCell}
                                    grid={grid}
                                />
                            );
                        })
                    );
                })}
            </Container>
        </>
    );
}
