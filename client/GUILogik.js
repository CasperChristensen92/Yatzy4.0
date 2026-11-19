import { dices, upperSectionScore, 
    sumScore, bonusScore, 
    onePairScore, twoPairScore, threeOfAKindScore, fourOfAKindScore, fullHouseScore, smallStraightScore, largeStraightScore, chanceScore, yatzyScore, decreaseCounter, counter, 
    totalScore, resetCounter
} from "../server/Logik.js"

let slåKnap = document.querySelector('#terningerKnap')
let terninger = document.querySelectorAll('.terning')
let checkbox = document.querySelectorAll('.cb')
let slagTilbage = document.querySelector('#counter')

// result.etere = document.querySelector('#et')
// result.toere = document.querySelector('#to')
// result.treere = document.querySelector('#tre')
// result.firere = document.querySelector('#fire')
// result.femere = document.querySelector('#fem')
// result.seksere = document.querySelector('#seks')
// result.sum = document.querySelector('#sum')
// result.bonus = document.querySelector('#bonus')
// result.etPar = document.querySelector('#etPar')
// result.toPar = document.querySelector('#toPar')
// result.treEns = document.querySelector('#treEns')
// result.fireEns = document.querySelector('#fireEns')
// result.lilleStraight = document.querySelector('#lilleStraight')
// result.storeStraight = document.querySelector('#storStraight')
// result.fuldtHus = document.querySelector('#fuldtHus')
// result.chance = document.querySelector('#chancen')
// result.yatzy = document.querySelector('#yatzy')
// result.total = document.querySelector('#total')
let nytSpil = document.querySelector('#nytSpilKnap')
let nyRunde = document.querySelector('#nyRundeKnap')


async function getResult() {
    const response = await fetch('http://localhost:8080/result')
    return await response.json();
}
let result = await getResult();

document.querySelector('#et').value = result.etere.value
document.querySelector('#to').value = result.toere.value
document.querySelector('#tre').value = result.treere.value
document.querySelector('#fire').value = result.firere.value
document.querySelector('#fem').value = result.femere.value
document.querySelector('#seks').value = result.seksere.value
document.querySelector('#sum').value = result.sum.value
document.querySelector('#bonus').value = result.bonus.value
document.querySelector('#etPar').value = result.etPar.value
document.querySelector('#toPar').value = result.toPar.value
document.querySelector('#treEns').value = result.treEns.value
document.querySelector('#fireEns').value = result.fireEns.value
document.querySelector('#lilleStraight').value = result.lilleStraight.value
document.querySelector('#storStraight').value = result.storeStraight.value
document.querySelector('#fuldtHus').value = result.fuldtHus.value
document.querySelector('#chancen').value = result.chance.value
document.querySelector('#yatzy').value = result.yatzy.value
document.querySelector('#total').value = result.total.value


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






for (let r of result) {
    r.addEventListener("click", function () {
        r.disabled = true
    })
}

nyRunde.addEventListener("click", async function () {
    /*for (let v of variableArray) {
        if (!v.disabled) {
            v.value = ""
        }
    }*/
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
