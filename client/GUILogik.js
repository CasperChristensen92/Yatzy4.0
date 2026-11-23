let slåKnap = document.querySelector('#terningerKnap')
let terninger = document.querySelectorAll('.terning')
let checkbox = document.querySelectorAll('.cb')
let slagTilbage = document.querySelector('#counter')
let serverIP = "10.10.139.21:8080"
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
    const response = await fetch('http://'+serverIP+'/result')
    return await response.json();
}

async function opdaterResults() {
let result = await getResult();
document.querySelector('#etere').value = result.etere.value
document.querySelector('#toere').value = result.toere.value
document.querySelector('#treere').value = result.treere.value
document.querySelector('#firere').value = result.firere.value
document.querySelector('#femere').value = result.femere.value
document.querySelector('#seksere').value = result.seksere.value
document.querySelector('#sum').value = result.sum.value
document.querySelector('#bonus').value = result.bonus.value
document.querySelector('#etPar').value = result.etPar.value
document.querySelector('#toPar').value = result.toPar.value
document.querySelector('#treEns').value = result.treEns.value
document.querySelector('#fireEns').value = result.fireEns.value
document.querySelector('#lilleStraight').value = result.lilleStraight.value
document.querySelector('#storeStraight').value = result.storeStraight.value
document.querySelector('#fuldtHus').value = result.fuldtHus.value
document.querySelector('#chance').value = result.chance.value
document.querySelector('#yatzy').value = result.yatzy.value
document.querySelector('#total').value = result.total.value
}
opdaterResults()


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

async function put(url, objekt) {
    const respons = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    });
    if (respons.status !== 200) // Created
        throw new Error(respons.status);
    return await respons.json();
}

slåKnap.addEventListener("click", async function () {
    try {
        let lockedDice = [] // laver liste med de terninger der er låst, så de ikke bliver rullet igen
        for (let i = 0; i < checkbox.length; i++) { // checker hvilke terninger der er låst
            lockedDice.push(checkbox[i].checked) // true hvis terningen er låst, false hvis den ikke er låst
        }

        let rollResult = await post("http://"+serverIP+"/rollDice", lockedDice) // sender listen til serveren, som ruller de terninger der ikke er låst;
        slagTilbage.innerHTML = "Slag tilbage: " + rollResult.newCounter // opdaterer counteren på klienten
        for (let i = 0; i < terninger.length; i++) { // opdaterer billederne på klienten
            terninger[i].src = "images/dice" + rollResult.newDices[i] + ".png"
        }
        opdaterResults()
        //decreaseCounter() // skal nok flyttes til serveren, men for nu er det her
        //opdaterValues() // skal nok flyttes til serveren, men for nu er det her
    } catch (error) {
        console.error("Fejl ved rulning af terninger:", error);
    }
});




let resultatFelter = document.querySelectorAll('.labelText input')

for (let r of resultatFelter) {
    r.addEventListener("click", async function () {
        await put(`http://${serverIP}/result/${r.id}`, {
            låst: true }
        )
        r.disabled = true
    })
}


nyRunde.addEventListener("click", async function () {
    for (let t of terninger) {
        t.src = "images/dice1.png"
    }
    for (let cb of checkbox) {
        cb.checked = false
    }
    for (let r of resultatFelter) {
        if (!r.disabled) {
            r.value = ""
        }
    }
    
    try {
        await post("http://" + serverIP + "/newRound", {}) // sender en anmodning til serveren om at starte en ny runde
            slagTilbage.innerHTML = "Slag tilbage: 3"; // opdaterer counteren på klienten
        } catch (error) {
            console.error("Fejl ved nulstilling af runde:", error);
        }
})

nytSpil.addEventListener("click", async function() {
    for (let r of resultatFelter) {
        r.disabled = false
        r.value = ""
    }
    for (let cb of checkbox) {
        cb.checked = false
    }
        for (let t of terninger) {
        t.src = "images/dice1.png"
    }

    try {
        await post("http://" + serverIP + "/newGame", {}) // sender en anmodning til serveren om at starte et nyt spil
        slagTilbage.innerHTML = "Slag tilbage: 3"; // opdaterer counteren på klienten
    } catch (error) {
        console.error("Fejl ved nulstilling af spil:", error);
    }
})
