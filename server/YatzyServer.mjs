import express, { request, response } from 'express';
import cors from 'cors';
import pug from 'pug';
import session from 'express-session'
import path from 'path';
import { fileURLToPath } from 'url';



import { rollDice, resetCounter, nulstilValues } from './Logik.js'; // Importer rollDice-funktionen, dices-arrayet og counter-variablen fra Logik.js
import { saveResult,createPlayer } from './Player.mjs'

const app = express();

const __filename = fileURLToPath(import.meta.url); // nuværende js-fil
const __dirname = path.dirname(__filename); // server-mappen

const projectRoot = path.join(__dirname, '..'); // Yatzy4.0-mappen (root)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(projectRoot, 'client')));

// Pug:
app.set('view engine', 'pug');
app.set('views', path.join(projectRoot, 'views'));


// Bruges til at huske, hvilken spiller der bruger hjemmesiden, så serveren genkender spilleren på tværs af HTTP-requests.
app.use(session({
    secret: 'hemmelig',
    resave: false,
    saveUninitialized: false
}));



const players = new Map(); // spillere gemmes med session-ID og player som key og value


// Når en bruger besøger forsiden. Forsiden er skrevet i .pug, så den skal renders til html
app.get('/', (request, response) => {
    response.render('forside', {
        players: [...players.values()], // Pug får listen af spillere
        currentPlayer: request.session.playerName // Henter navn på aktuel spiller, fra spillerens session, hvis den allerede findes
    });

});


// Modtager spillerens navn fra forsiden. Navnet gemmes i sessionen og tilføjes til listen
app.post('/join', (request, response) => {
    const name = String(request.body.name ?? '').trim();

    if (name.length === 0 || name.length > 30) {
        return response.status(400).send('Ugyldigt navn');
    }

    request.session.playerName = name;
    let player = createPlayer(name)
    players.set(request.sessionID, player)
// Opretter en ny spiller med et nyt result objekt, som gemmes i players arrayet
    
    request.session.save((err) => {
        if (err) {
            return response.status(500).send('Sessionen kunne ikke gemmes')
        }
        response.redirect('/game'); // Spilleren sendes videre til spil-siden
    });


});

app.get('/game', (request, response) => {
    if (!request.session.playerName) {
        return response.redirect('/');
    }

    response.sendFile(path.join(projectRoot, 'client', 'GUI.html'));
});

app.get('/players', (request, response) => {
    response.json( [...players.values()]);
})


app.get('/result', async(request, response) => {
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({error: 'Ingen spiller fundet'})
    }
    response.json(player.result)
})

app.post('/rollDice', (request,response) =>{
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({error: 'Ingen spiller fundet'})
    }
    let lockedDice = request.body; // modtager listen med de låste terninger fra klienten
    rollDice(lockedDice, player) // sender listen til rollDice funktionen, som ruller de terninger der ikke er låst;
    response.status(201).json({ 
        newDices: player.dices,
        newCounter: player.counter,
        result: player.result
    });
    
});

app.post('/newRound', (request, response) => {
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({error: 'Ingen spiller fundet'})
    }
    resetCounter(player); // Reset counteren til 3 for en ny runde
    nulstilValues(player);
    player.dices.length = 0; // Tømmer dices-arrayet for at starte en ny runde
    response.status(201).json({ 
        message: "Runde nulstillet på serveren"
    });
});

app.post('/newGame', (request, response) => {
    for (let player of players.values()) {
        saveResult(player); // Gemmer det nuværende result objekt i player.oldResults arrayet og resetter result objektet
        player.dices.length = 0;
        resetCounter(player) // Tømmer dices-arrayet for at starte en ny runde
    }
    response.status(201).json({ 
        message: "Nyt spil startet på serveren"
    });
});

app.put('/result/:felt', (request, response) => {
    let felt = request.params.felt
    let body = request.body
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({error: 'Ingen spiller fundet'})
    }
    player.result[felt].locked = body.låst; //.låst tilgår værdien i body der hedder låst, altså true
    response.json(player.result)
});

app.listen(8080, () => console.log('Lytter på port 8080 ...'));