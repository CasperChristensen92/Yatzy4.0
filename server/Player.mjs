// Returnerer et nyt result objekt med alle værdier sat til 0 og alle låst sat til false
function createResult() {
    return {
    "etere" : {"value" :0, "locked" : false },
    "toere" : {"value" :0, "locked" : false },
    "treere" : {"value" :0, "locked" : false },
    "firere" : {"value" :0, "locked" : false },
    "femere" : {"value" :0, "locked" : false },
    "seksere" : {"value" :0, "locked" : false },
    "sum" : {"value" :0, "locked" : false },
    "bonus" : {"value" :0, "locked" : false },
    "etPar" : {"value" :0, "locked" : false },
    "toPar" : {"value" :0, "locked" : false },
    "treEns" : {"value" :0, "locked" : false },
    "fireEns" : {"value" :0, "locked" : false },
    "lilleStraight" : {"value" :0, "locked" : false },
    "storeStraight" : {"value" :0, "locked" : false },
    "fuldtHus" : {"value" :0, "locked" : false },
    "chance" : {"value" :0, "locked" : false },
    "yatzy" : {"value" :0, "locked" : false },
    "total" : {"value" :0, "locked" : false }
    };
}
let result = createResult()

function createPlayer(navn) {
    const newPlayer = {
        "name" : navn,
        "highscore" : 0,
        "result" : createResult(),
        "counter" : 3,
        "dices" : [],
        "oldResults" : [],
        "wins" : 0
    };
    return newPlayer;
}

let player = createPlayer()




// Resetter result objektet til et nyt objekt med alle værdier sat til 0 og alle låst sat til false
function resetResult(player) {
    player.result = createResult()
}

// Gemmer det nuværende result objekt i player.oldResults arrayet og resetter result objektet
function saveResult(player) {
    player.oldResults.push(player.result)
    resetResult(player)
}

function finishedCheck(player){
    let result = player.result;
    for (let felt of Object.keys(result)) {
        if (!result[felt].locked) {
            return false
        }
    }
    return true
}

export {result, player, resetResult, saveResult, createPlayer, finishedCheck}