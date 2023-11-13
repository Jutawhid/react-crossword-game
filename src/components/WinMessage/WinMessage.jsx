import { Modal, Button } from "react-bootstrap";
import { useEffect, useState, useContext } from "react";
import { LoginContext } from '../../App';
import "./WinMessage.css";

export function WinMessage(props) {

    const { isLogin } = useContext(LoginContext);

    const isMultiPlayer = props.wordsSolvedByPlayers !== undefined;

    const maxValue = isMultiPlayer ? Math.max(...props.wordsSolvedByPlayers) : -1;

    const hasMaxWords = isMultiPlayer ? props.wordsSolvedByPlayers[props.playerID] === maxValue : false;

    let finishPlaceMessage = "Nice fight!";
    if (isMultiPlayer) {
        let count = 0;
        for (let wordsSolvedByPlayer of props.wordsSolvedByPlayers) {
            if (wordsSolvedByPlayer === maxValue) count++;
        }

        if (hasMaxWords) {
            if (count > 1) finishPlaceMessage = "Tie!";
            else finishPlaceMessage = "Great win!";
        }
    }

    const [showPlayAgainBtn, setShowPlayAgainBtn] = useState(true);
    const [dots, setDots] = useState(".");
    const [showDialog, setShowDialog] = useState(true);

    //send request to server to add 10 coins to the user
    useEffect(() => {
        // if is not signed in
        if (!isLogin) return;
        //if is multiplayer and he has not won
        if (isMultiPlayer && finishPlaceMessage === "Nice fight!") return;

        fetch("/api/v1/coins", {
            method: 'POST'
        });
    }, []);


    if (!isMultiPlayer) {
        return (
            <>
                <Modal
                    show={showDialog}
                    centered
                    onHide={() => setShowDialog(false)}>
                    <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                        <span id="solve-message">Mission accomplished!</span>
                        <span id="got-coins-message">You got 10 coins!</span>
                        {/* <Button id="play-again-btn" className="mt-3" onClick={() => {
                            props.startGame();
                        }}>
                            Play again
                        </Button> */}
                    </Modal.Body>
                </Modal>
            </>
        );
    }

    function onPlayAgain() {

        props.socket.emit("join to specific game", props.gameID, props.numberOfPlayers, props.gridSize);

        setShowPlayAgainBtn(false);
    }

    if (!showPlayAgainBtn) {
        setTimeout(() => {
            setDots(prevValue => {
                if (prevValue === "...") return ".";
                return prevValue + ".";
            })
        }, 750);
    }

    function handleCloseMultiplayer() {
        props.socket.emit("remove from specific game", props.gameID);
        setShowDialog(false);
    }

    return (
        <>
            <Modal
                show={showDialog}
                centered
                onHide={handleCloseMultiplayer}>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    <span id="solve-message">{finishPlaceMessage}</span>
                    {isLogin && hasMaxWords && <span id="got-coins-message">You got 10 coins!</span>}
                    {showPlayAgainBtn &&
                        <Button id="play-again-btn"
                            className="mt-2"
                            onClick={onPlayAgain}>
                            Play again
                        </Button>
                    }
                    {!showPlayAgainBtn && <span style={{ "fontSize": "2.6vmin", "margin-top": "1vmin" }}>Waiting for other players{dots}</span>}
                </Modal.Body>
            </Modal>
        </>
    );
}