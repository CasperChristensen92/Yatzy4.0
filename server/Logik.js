export {upperSectionScore, sumScore, bonusScore, onePairScore, twoPairScore, threeOfAKindScore, fourOfAKindScore, smallStraightScore, largeStraightScore, fullHouseScore, chanceScore, yatzyScore, decreaseCounter, totalScore, resetCounter,rollDice, nulstilValues, setLockedFalse}
import { result, player } from './Player.mjs'

// let counter = 3 //tæller til at sørge for der kun er 3 slag i alt, opdateres efter hvert slag
// const dices = []

// let info = {
//     "counter" : 3,
//     "dices" : []
// }

let scoreMethods = {
    etere : (player) => upperSectionScore(1, player),
    toere: (player) => upperSectionScore(2, player),
    treere: (player) => upperSectionScore(3, player),
    firere: (player) => upperSectionScore(4, player),
    femere: (player) => upperSectionScore(5, player),
    seksere: (player) => upperSectionScore(6, player),
    etPar: onePairScore,
    toPar: twoPairScore,
    treEns: threeOfAKindScore,
    fireEns: fourOfAKindScore,
    lilleStraight: smallStraightScore,
    storeStraight: largeStraightScore,
    fuldtHus: fullHouseScore,
    chance: chanceScore,
    yatzy: yatzyScore
}

function opdaterValues(player) {
    let result = player.result;
    for (let felt of Object.keys(scoreMethods)) {
        if (!result[felt].locked) {
            result[felt].value = scoreMethods[felt](player)
        }
    }
    let selectedUpperScores = [result.etere, result.toere, result.treere, result.firere, result.femere, result.seksere].filter(v => v.locked==true).map(v => parseInt(v.value))
    let selectedLowerScores = [result.etPar, result.toPar, result.treEns, result.fireEns, result.lilleStraight, result.storeStraight, result.fuldtHus, result.chance, result.yatzy].filter(v => v.locked==true).map(v => parseInt(v.value))

    result.sum.value = sumScore(selectedUpperScores)
    result.bonus.value = bonusScore(selectedUpperScores)
    result.total.value = totalScore(selectedUpperScores, selectedLowerScores)
}

function nulstilValues(player) {
    for (let felt in scoreMethods) {
        if (!player.result[felt].locked) {
            player.result[felt].value = 0;
        }
    }
}

function setLockedFalse() {
    for (let felt in result) {
        if (result[felt].locked) {
            result[felt].locked = false
        }
    }
    nulstilValues();
}

function decreaseCounter(player) {
    player.counter--
}

function resetCounter(player) {
    player.counter = 3
}

// Felterne 1-6 symboliserer hver sin terning. "Count" tæller hvor mange terninger der er af hver "størrelse"
// Feltet 0 bliver ikke brugt
function countEyes(player) {
        let counts = [0,0,0,0,0,0,0];
        for (let d of player.dices) {
            counts[d]++;
        }
        return counts;
    }


function upperSectionScore(eye, player) {
    let c = countEyes(player);
    return c[eye] * eye;
}

function sumScore(sectionScores) {
    let sum = 0;
    for (let score of sectionScores) {
        sum += score;
    }
    return sum;
}


function bonusScore(lockedUpperSectionScores) {
    if (sumScore(lockedUpperSectionScores) >= 63) {
        return 50;
    }
    else return 0;
}


// Starter med højeste tal (6). Hvis hvis der findes flere terninger, vælges den. 
function onePairScore(player) {
    let c = countEyes(player);
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 2) return i * 2;
    }
    return 0;
}

function twoPairScore(player) {
    let c = countEyes(player);
    let pairs = 0;
    let score = 0;
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 2) {
            pairs++;
            score += i * 2;
            if (pairs == 2) return score;
        }
    }
    return 0;
}

function threeOfAKindScore(player) {
    let c = countEyes(player);
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 3) return i * 3;
    }
    return 0;
}

function fourOfAKindScore(player) {
    let c = countEyes(player);
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 4) return i * 4;
    }
    return 0;
}

function smallStraightScore(player) {
    let c = countEyes(player);
    for (let i = 1; i <= 5; i++) {
        if (c[i] != 1) return 0;
    }
    return 15; // fast score
}

function largeStraightScore(player) {
    let c = countEyes(player);
    for (let i = 2; i <= 6; i++) {
        if (c[i] != 1) return 0;
    }
    return 20; // fast score
}

function fullHouseScore(player) {
    let c = countEyes(player);
    let three = 0, two = 0;
    for (let i = 1; i <= 6; i++) {
        if (c[i] == 3) three = i * 3;
        if (c[i] == 2) two = i * 2;
    }
    return (three > 0 && two > 0) ? three + two : 0;
}

function chanceScore(player) {
    let sum = 0;
    for (let d of player.dices) sum += d;
    return sum;
}

function yatzyScore(player) {
    if (player.dices.length !== 5) return 0;

    let first = player.dices[0];
    for (let d of player.dices) {
        if (d != first) return 0;
    }
    return 50;
}

function totalScore(lockedUpperSectionScores, lockedLowerSectionScores) {
    return sumScore(lockedUpperSectionScores) + bonusScore(lockedUpperSectionScores) + sumScore(lockedLowerSectionScores);
}


function rollDice(lockedDice, player) {
    if (player.counter > 0) {
        for (let i = 0; i < 5; i++) {
            if (!lockedDice[i]) {
                let slag = Math.floor(Math.random() * 6) + 1;
                player.dices[i] = slag;
            }
        }
    decreaseCounter(player)
    }
    opdaterValues(player)
}