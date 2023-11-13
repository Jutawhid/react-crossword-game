import './Cell.css';

var previousValue = "";

export function Cell({ cell, onClick, goToNextCell, goToPreviousCell, grid }) {

    function onKeyUp(e) {
        console.log('onKeyUp ='+ e.target.value)

        let value = e.target.value.toLowerCase();

        //get the position of the cell
        let [i, j] = e.target.dataset.pos.split(" ").map((string) => parseInt(string));

        //if this is blocked cell then do nothing
        if (grid[i][j].char === "#") return;
        
        //if backspace or delete were clicked
        if (e.keyCode === 8 || e.keyCode === 46) {
            
            //if you try to delete a correct char
            //then it will go to the previous cell and delete it
            if (isCorrect(e.target)) {
                e.target.value = previousValue;
                goToPreviousCell();
                return;
            }


            grid[i][j].char = '';
            //if cell is empty already then go to the previous cell and delete what inside
            if (previousValue === "") {
                goToPreviousCell();
                return;
            }

            e.target.value = "";

            return;
        }

        let newChar = getLastChar(value);
        
        if (newChar === undefined) return;

        if (isCorrect(e.target)) {
           
            e.target.value = previousValue;
            if (newChar === previousValue) {
                goToNextCell();
            }
            return;
        }

        //if key is not a-z,A-Z, then return
        if (newChar < 'a' || newChar > 'z') {
            e.target.value = previousValue;
            return;
        }
        
        //if there is already char in cell then delete it
        if (value.length > 1) {
            e.target.value = newChar;
        }
        
        //if the char is correct and the user is trying to put
        //inccorect char instead then don't let him
        if ((isCorrect(e.target)) && grid[i][j].char !== newChar) return;

        grid[i][j].char = newChar;

        //alert(newChar)

        goToNextCell();
    }

    function onKeyDown({ target }) {
        console.log('onKeyDown = '+ target.value)
        previousValue = target.value.toLowerCase();
    }

    function getLastChar(currValue) {
        
        if (previousValue === "") return currValue[0];
        if (currValue[1] === previousValue) return currValue[0];
        console.log('cell = '+currValue[0])
    
        return currValue[1];
    }

    function isCorrect(cell) {
        console.log('cell = '+cell.classList)
        return cell.classList.contains("correct");
    }

    return (
        <>
            <input className={"cell" + (grid[cell.i][cell.j].char === "#" ? " block" : "")}
                tabIndex={0}
                data-pos={cell.i + " " + cell.j}
                data-word_id_across={cell.word_id_across}
                data-word_id_down={cell.word_id_down}
                onClick={(e) => onClick(e.target)}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                autoCapitalize="none"
                style={{ "--gridsize": grid.length }}
            >
            </input>
        </>
    );
}