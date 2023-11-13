import { Modal, Form, Button } from 'react-bootstrap';
import { useState } from 'react';

export function GameOptionsDialog({ handleClose, gameType, handleSubmit }) {

    const [gameID, setGameID] = useState("");
    const [numberOfPlayers, setNumberOfPlayers] = useState("2");
    const [gridSize, setGridSize] = useState("Medium");

    if (gameType === "search-multiplayer-friends") {
        return (
            <Modal
                size="sm"
                show={true}
                centered
                onHide={handleClose}>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    <form>
                        <div className="fs-5 form-group mt-3">
                            <label>Game code</label>
                            <input
                                type="text"
                                className="form-control mt-1"
                                placeholder="Game code"
                                onChange={(e) => setGameID(e.target.value)}
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center align-items-center">
                    <Button className="fs-4" onClick={() => handleSubmit(numberOfPlayers, gridSize, gameID)}>
                        Join
                    </Button>
                </Modal.Footer>
            </Modal >
        );
    }

    return (
        <Modal
            size="sm"
            show={true}
            centered
            onHide={handleClose}>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {gameType !== "single-player" && <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="fs-5 m-2">Number of players:</div>
                    <Form.Select
                        defaultValue={"2"}
                        onChange={(e) => setNumberOfPlayers(e.target.value)}
                        style={{ width: "65px" }}>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </Form.Select>
                </div>
                }
                <div className="d-flex justify-content-center align-items-center">
                    <div className="fs-5 m-2">Grid size:</div>
                    <Form.Select
                        defaultValue={"Medium"}
                        onChange={(e) => setGridSize(e.target.value)}
                        style={{ width: "110px" }}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </Form.Select>
                </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center align-items-center">
                <Button className="fs-4" onClick={() => handleSubmit(numberOfPlayers, gridSize)}>
                    {gameType.includes("multiplayer") ?
                        (gameType === "multiplayer" ? "Go" : "Create") :
                        "Start"
                    }
                </Button>
            </Modal.Footer>
        </Modal >
    );
}