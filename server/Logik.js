export {dices, upperSectionScore, sumScore, bonusScore, onePairScore, twoPairScore, threeOfAKindScore, fourOfAKindScore, smallStraightScore, largeStraightScore, fullHouseScore, chanceScore, yatzyScore, decreaseCounter, counter, totalScore, resetCounter,rollDice, nulstilValues, setLockedFalse}
import { result } from './Player.mjs'

let counter = 3 //tæller til at sørge for der kun er 3 slag i alt, opdateres efter hvert slag
const dices = []

// øvre sektion
let etere , toere, treere, firere, femere, seksere;
let sum; // nødvendig?
let bonus; // nødvendig?

// nedre sektion
let etPar, toPar, treEns, fireEns, lilleStraight, storeStraight, fuldtHus, chance, Yatzy;
let total; // nødvendig?

let info = {
    "counter" : 3,
    "dices" : []
}

let scoreMethods = {
    etere: () => upperSectionScore(1),
    toere: () => upperSectionScore(2),
    treere: () => upperSectionScore(3),
    firere: () => upperSectionScore(4),
    femere: () => upperSectionScore(5),
    seksere: () => upperSectionScore(6),
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

function opdaterValues() {
    for (let felt of Object.keys(scoreMethods)) {
        if (!result[felt].locked) {
            result[felt].value = scoreMethods[felt]()
        }
    }
    let selectedUpperScores = [result.etere, result.toere, result.treere, result.firere, result.femere, result.seksere].filter(v => v.locked==true).map(v => parseInt(v.value))
    let selectedLowerScores = [result.etPar, result.toPar, result.treEns, result.fireEns, result.lilleStraight, result.storeStraight, result.fuldtHus, result.chance, result.yatzy].filter(v => v.locked==true).map(v => parseInt(v.value))

    result.sum.value = sumScore(selectedUpperScores)
    result.bonus.value = bonusScore(selectedUpperScores)
    result.total.value = totalScore(selectedUpperScores, selectedLowerScores)
}

function nulstilValues() {
    for (let felt in result) {
        if (!result[felt].locked) {
            result[felt].value = 0;
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

function decreaseCounter() {
    counter--
}

function resetCounter() {
    counter = 3
}

// Felterne 1-6 symboliserer hver sin terning. "Count" tæller hvor mange terninger der er af hver "størrelse"
// Feltet 0 bliver ikke brugt
function countEyes() {
        let counts = [0,0,0,0,0,0,0];
        for (let d of dices) {
            counts[d]++;
        }
        return counts;
    }



function upperSectionScore(eye) {
    let c = countEyes();
    return c[eye] * eye;
}

function sumScore(sectionScores) {
    let sum = 0;
    for (let score of sectionScores) {
        sum += score;
    }
    return sum;
}
/*function sumScore() {
    let sum = result.etere + result.toere + result.trere + result.firere + result.femere + result.seksere;
    
    return sum;
}*/

function bonusScore(lockedUpperSectionScores) {
    if (sumScore(lockedUpperSectionScores) >= 63) {
        return 50;
    }
    else return 0;
}
/*function bonusScore() {
    if (sumScore() >= 63) {
        return 50;
    }
    else return 0;
}*/

// Starter med højeste tal (6). Hvis hvis der findes flere terninger, vælges den. 
function onePairScore() {
    let c = countEyes();
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 2) return i * 2;
    }
    return 0;
}

function twoPairScore() {
    let c = countEyes();
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

function threeOfAKindScore() {
    let c = countEyes();
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 3) return i * 3;
    }
    return 0;
}

function fourOfAKindScore() {
    let c = countEyes();
    for (let i = 6; i >= 1; i--) {
        if (c[i] >= 4) return i * 4;
    }
    return 0;
}

function smallStraightScore() {
    let c = countEyes();
    for (let i = 1; i <= 5; i++) {
        if (c[i] != 1) return 0;
    }
    return 15; // fast score
}

function largeStraightScore() {
    let c = countEyes();
    for (let i = 2; i <= 6; i++) {
        if (c[i] != 1) return 0;
    }
    return 20; // fast score
}

function fullHouseScore() {
    let c = countEyes();
    let three = 0, two = 0;
    for (let i = 1; i <= 6; i++) {
        if (c[i] == 3) three = i * 3;
        if (c[i] == 2) two = i * 2;
    }
    return (three > 0 && two > 0) ? three + two : 0;
}

function chanceScore() {
    let sum = 0;
    for (let d of dices) sum += d;
    return sum;
}

function yatzyScore() {
    let first = dices[0];
    for (let d of dices) {
        if (d != first) return 0;
    }
    return 50;
}

function totalScore(lockedUpperSectionScores, lockedLowerSectionScores) {
    return sumScore(lockedUpperSectionScores) + bonusScore(lockedUpperSectionScores) + sumScore(lockedLowerSectionScores);
}
/*function totalScore() {
    return result.sum + result.bonusScore + result.etPar + result.toPar + result.treEns + result.fireEns + result.fuldtHus + result.lilleStraight  +result.storeStraight + result.chance + result.yatzy;
} */


function rollDice(lockedDice) {
    if (counter > 0) {
        for (let i = 0; i < 5; i++) {
            if (!lockedDice[i]) {
                let slag = Math.floor(Math.random() * 6) + 1;
                dices[i] = slag;
            }
        }
    decreaseCounter()
    }
    opdaterValues()
}