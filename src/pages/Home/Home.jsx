import { Button, Modal } from "react-bootstrap"
import { useState } from "react";
import { GameOptionsDialog } from "../../components/GameOptionsDialog";
import { useNavigate } from "react-router-dom";

export function Home() {

    const navigate = useNavigate();

    const [gameType, setGameType] = useState("false");

    function handleClose() {
        setGameType("false");
    }

    async function getGameID() {
        const response = await fetch('/api/v1/gameID');
        let gameID = await response.json();
        return gameID.gameID;
    }

    async function handleSubmit(numberOfPlayers, gridSize, gameID) {
        if (gameType === "single-player") {
            navigate("/single-player", { state: { numberOfPlayers, gridSize, gameID } });
            return;
        }

        //if create-multiplayer-friends then get a gameID
        if (gameType === "create-multiplayer-friends") {
            gameID = await getGameID();
        }

        navigate("/multiplayer", { state: { numberOfPlayers, gridSize, gameID } });
    }

    let dialog = <></>;
    switch (gameType) {
        case "false":
            dialog = <></>;
            break;
        case "friends":
            dialog = (
                <Modal
                    show={true}
                    centered
                    onHide={handleClose}>
                    <Modal.Body className="d-flex justify-content-center align-items-center">
                        <Button onClick={() => setGameType("create-multiplayer-friends")}
                            className="fs-3 m-3">
                            Create Game
                        </Button>
                        <Button onClick={() => setGameType("search-multiplayer-friends")}
                            className="fs-3 m-3">
                            Join Game
                        </Button>
                    </Modal.Body>
                </Modal>
            );
            break;
        default:
            dialog = <GameOptionsDialog
                handleClose={handleClose}
                gameType={gameType}
                handleSubmit={handleSubmit} />;
            break;
    }

    return (
        <>
            <h1 className="mt-5 mb-3 text-center">MultiCross</h1>
            <br />
            <br />
            <div className="d-flex flex-column justify-content-center align-items-center mt-4">
                <Button className="mb-3"
                    onClick={() => {
                        setGameType("single-player")
                    }}
                    style={{
                        fontSize: "4.5vmin",
                        width: "35vmin",
                        height: "9.5vmin"
                    }}
                >Single Player</Button>

                <Button className="mb-3 mt-3"
                    onClick={() => {
                        setGameType("multiplayer")
                    }}
                    style={{
                        fontSize: "4.5vmin",
                        width: "35vmin",
                        height: "9.5vmin"
                    }}>Multiplayer</Button>

                <Button className="mt-3"
                    onClick={() => {
                        setGameType("friends")
                    }}
                    style={{
                        fontSize: "3.7vmin",
                        width: "35vmin",
                        height: "9.5vmin"
                    }}>Play with friends</Button>
            </div>
            {dialog}
        </>
    );
}
