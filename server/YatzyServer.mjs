import express, { request, response } from 'express';
import cors from 'cors';
import { rollDice, dices, counter, resetCounter } from './Logik.js'; // Importer rollDice-funktionen, dices-arrayet og counter-variablen fra Logik.js
import { result } from './Player.mjs'

const app = express();
app.use(cors());
app.use(express.json());

app.get('/result', async(request, response) => {
    response.json(result)
})

app.post('/rollDice', (request,response) =>{
    let lockedDice = request.body; // modtager listen med de låste terninger fra klienten
    rollDice(lockedDice) // sender listen til rollDice funktionen, som ruller de terninger der ikke er låst;
    response.status(201).json({ 
        newDices: dices,
        newCounter: counter,
    });
});

app.post('/newRound', (request, response) => {
    resetCounter(); // Reset counteren til 3 for en ny runde
    dices.length = 0; // Tømmer dices-arrayet for at starte en ny runde
    response.status(201).json({ 
        message: "Runde nulstillet på serveren"
    });
});

app.post('/newGame', (request, response) => {
    resetCounter(); // Reset counteren til 3 for en ny runde
    dices.length = 0; // Tømmer dices-arrayet for at starte en ny runde
    response.status(201).json({ 
        message: "Nyt spil startet på serveren"
    });
});

app.put('/result/:felt', async (request, response) => {
    let felt = request.params.felt
    let body = request.body
    result[felt].locked = body.låst; //.låst tilgår værdien i body der hedder låst, altså true
    response.json(result)
});

app.listen(8080, () => console.log('Lytter på port 8080 ...'));