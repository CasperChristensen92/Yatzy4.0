import { dices, upperSectionScore, 
    sumScore, bonusScore, 
    onePairScore, twoPairScore, threeOfAKindScore, fourOfAKindScore, fullHouseScore, smallStraightScore, largeStraightScore, chanceScore, yatzyScore, decreaseCounter, counter, 
    totalScore, resetCounter
} from "../server/Logik.js"
let slåKnap = document.querySelector('#terningerKnap')
let terninger = document.querySelectorAll('.terning')
let checkbox = document.querySelectorAll('.cb')
let slagTilbage = document.querySelector('#counter')

let et = document.querySelector('#et')
let to = document.querySelector('#to')
let tre = document.querySelector('#tre')
let fire = document.querySelector('#fire')
let fem = document.querySelector('#fem')
let seks = document.querySelector('#seks')
let sum = document.querySelector('#sum')
let bonus = document.querySelector('#bonus')

let etPar = document.querySelector('#etPar')
let toPair = document.querySelector('#toPar')
let treEns = document.querySelector('#treEns')
let fireEns = document.querySelector('#fireEns')
let lilleStraight = document.querySelector('#lilleStraight')
let storStraight = document.querySelector('#storStraight')
let fuldtHus = document.querySelector('#fuldtHus')
let chance = document.querySelector('#chancen')
let yatzy = document.querySelector('#yatzy')
let total = document.querySelector('#total')

let variableArray = [et, to, tre, fire, fem, seks, etPar, toPair, treEns, fireEns, lilleStraight, storStraight, fuldtHus, chance, yatzy]
let nytSpil = document.querySelector('#nytSpilKnap')
let nyRunde = document.querySelector('#nyRundeKnap')


async function post(url, objekt) {
    const respons = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    });
    if (respons.status !== 201) // Created
        throw new Error(respons.status);
    return await respons.json();
}

slåKnap.addEventListener("click", async function () {
    try {
        let lockedDice = [] // laver liste med de terninger der er låst, så de ikke bliver rullet igen
        for (let i = 0; i < checkbox.length; i++) { // checker hvilke terninger der er låst
            lockedDice.push(checkbox[i].checked) // true hvis terningen er låst, false hvis den ikke er låst
        }

        let result = await post("http://localhost:8080/rollDice", lockedDice) // sender listen til serveren, som ruller de terninger der ikke er låst;
        slagTilbage.innerHTML = "Slag tilbage: " + result.newCounter // opdaterer counteren på klienten
        for (let i = 0; i < terninger.length; i++) { // opdaterer billederne på klienten
            terninger[i].src = "images/dice" + result.newDices[i] + ".png"
        }

        //decreaseCounter() // skal nok flyttes til serveren, men for nu er det her
        opdaterValues() // skal nok flyttes til serveren, men for nu er det her
    } catch (error) {
        console.error("Fejl ved rulning af terninger:", error);
    }
});




function opdaterValues() {
    et.value = upperSectionScore(1)
    to.value = upperSectionScore(2)
    tre.value = upperSectionScore(3)
    fire.value = upperSectionScore(4)
    fem.value = upperSectionScore(5)
    seks.value = upperSectionScore(6)
    
    etPar.value = onePairScore()
    toPair.value = twoPairScore()
    treEns.value = threeOfAKindScore()
    fireEns.value = fourOfAKindScore()
    lilleStraight.value = smallStraightScore()
    storStraight.value = largeStraightScore()
    fuldtHus.value = fullHouseScore()
    chance.value = chanceScore()
    yatzy.value = yatzyScore()
    let selectedUpperScores = [et, to, tre, fire, fem, seks].filter(v => v.disabled).map(v => parseInt(v.value))
    let selectedLowerScores = [etPar, toPair, treEns, fireEns, lilleStraight, storStraight, fuldtHus, chance, yatzy].filter(v => v.disabled).map(v => parseInt(v.value))

    sum.value = sumScore(selectedUpperScores)
    bonus.value = bonusScore(selectedUpperScores)
    total.value = totalScore(selectedUpperScores, selectedLowerScores)
}

for (let v of variableArray) {
    v.addEventListener("click", function () {
        v.disabled = true
    })
}

nyRunde.addEventListener("click", async function () {
    for (let v of variableArray) {
        if (!v.disabled) {
            v.value = ""
        }
    }
    for (let t of terninger) {
        t.src = "images/dice1.png"
    }
    for (let cb of checkbox) {
        cb.checked = false
    }
    
    try {
        await post("http://localhost:8080/newRound", {}) // sender en anmodning til serveren om at starte en ny runde
            slagTilbage.innerHTML = "Slag tilbage: 3"; // opdaterer counteren på klienten
        } catch (error) {
            console.error("Fejl ved nulstilling af runde:", error);
        }
})

nytSpil.addEventListener("click", async function() {
    for (let v of variableArray) {
        v.disabled = false
        v.value = ""
    }
    for (let cb of checkbox) {
        cb.checked = false
    }
        for (let t of terninger) {
        t.src = "images/dice1.png"
    }

    try {
        await post("http://localhost:8080/newGame", {}) // sender en anmodning til serveren om at starte et nyt spil
        slagTilbage.innerHTML = "Slag tilbage: 3"; // opdaterer counteren på klienten
    } catch (error) {
        console.error("Fejl ved nulstilling af spil:", error);
    }
})
