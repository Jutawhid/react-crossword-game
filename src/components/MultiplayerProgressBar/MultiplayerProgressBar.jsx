import { ProgressBar } from 'react-bootstrap';

const variants = ["success", "danger", "warning", "info"];

export function MultiplayerProgressBar({ wordsSolvedByPlayers, totalNumberOfWords }) {

    const playersProgress = wordsSolvedByPlayers.map((wordsSolvedByPlayer) => {
        if (totalNumberOfWords === 0) return { progress: 0, numberOfWordsSolved: 0 };
        return { progress: ((wordsSolvedByPlayer * 1.0) / totalNumberOfWords) * 100, numberOfWordsSolved: wordsSolvedByPlayer };
    });

    return (
        <ProgressBar
            style={{
                width: "95%",
                margin: "0.2em auto 0 auto",
            }}>
            {
                playersProgress.map((playerProgress, i) => {
                    return <ProgressBar
                        key={i}
                        variant={variants[i]}
                        animated
                        now={playerProgress.progress}
                        label={playerProgress.numberOfWordsSolved} />
                })
            }
        </ProgressBar>
    );
}