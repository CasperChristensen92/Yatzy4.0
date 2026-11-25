import express, { request, response } from 'express';
import cors from 'cors';
import pug from 'pug';
import session from 'express-session'
import path from 'path';
import { fileURLToPath } from 'url';



import { rollDice, resetCounter, nulstilValues } from './Logik.js'; // Importer rollDice-funktionen, dices-arrayet og counter-variablen fra Logik.js
import { saveResult, createPlayer, finishedCheck } from './Player.mjs'

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

let gameStatus = 'lobby';

const scoreFields = [ // Array der bruges til at tælle brugte felter til visning på scoreboard
    'etere', 'toere', 'treere', 'firere', 'femere', 'seksere',
    'etPar', 'toPar', 'treEns', 'fireEns', 'lilleStraight',
    'storeStraight', 'fuldtHus', 'chance', 'yatzy'
];

// returnerer et scoreboard til visning på forsiden
function getScoreboard() {
    return [...players.values()].map(player => {
        const playerResult = player.result;

        return {
            name: player.name,
            total: player.result.total.value,
            completedCategories: scoreFields.filter(field => player.result[field].locked).length
        };

    });
}

function resetGameData() { // Nulstiller spil-data, når et nyt spil startes, virker måske

    for (const player of players.values()) {
        const newPlayer = createPlayer(player.name);

        player.result = newPlayer.result;
        player.dices = newPlayer.dices;
        player.counter = newPlayer.counter;
    }
}


// Når en bruger besøger forsiden. Forsiden er skrevet i .pug, så den skal renders til html
app.get('/', (request, response) => {
    response.render('forside', {
        status: gameStatus,
        players: getScoreboard(), // Pug får listen af spillere
        currentPlayer: players.get(request.sessionID)?.name ?? null // Henter navn på aktuel spiller, fra spillerens session, hvis den allerede findes
    });

});


// Modtager spillerens navn fra forsiden. Navnet gemmes i sessionen og tilføjes til listen
app.post('/join', (request, response) => {

    if (gameStatus !== 'lobby') {
        return response.status(409).send('Spillet er allerede i gang. Vent på næste spil.');
    }

    if (players.has(request.sessionID)) {
        return response.redirect('/');
    }

    const name = String(request.body.name ?? '').trim();

    if (name.length === 0 || name.length > 30) {
        return response.status(400).send('Ugyldigt navn');
    }

    const player = createPlayer(name)

    request.session.playerName = name;
    // Opretter en ny spiller med et nyt result objekt, som gemmes i players arrayet


    request.session.save((err) => {
        if (err) {
            return response.status(500).send('Sessionen kunne ikke gemmes');
        }

        players.set(request.sessionID, player)

        response.redirect('/'); // Spilleren sendes videre til spil-siden
    });
});

app.get('/api/game/status', (request, response) => { // Bruges til at sende spil-status
    response.json({
        status: gameStatus,
        currentPlayer: players.get(request.sessionID)?.name ?? null,
        isParticipant: players.has(request.sessionID)
    });
});

app.get('/api/scoreboard', (request, response) => {
    response.json({
        status: gameStatus,
        players: getScoreboard()
    });
});

app.post('/api/game/start', (request, response) => {

    if (!players.has(request.sessionID)) {
        return response.status(401).json({
            error: 'Du skal være tilmeldt'
        });
    }

    if (gameStatus !== 'lobby') {
        return response.status(409).json({
            error: 'Spillet er allerede startet'
        });
    }

    resetGameData();
    gameStatus = 'playing'; // spil-status ændres, så nye spillere ikke kan joine

    response.json({ status: gameStatus }); // returnerer spil-status (status skal tjekkes før vi kan starte et spil)
});


app.get('/game', (request, response) => {

    if (gameStatus !== 'playing' || !players.has(request.sessionID)) {
        return response.redirect('/')
    }

    response.sendFile(path.join(projectRoot, 'client', 'GUI.html')); // Sender spilleren til GUI-html (spil-siden)
});

app.get('/players', (request, response) => {
    response.json([...players.values()]);
})


app.get('/result', async (request, response) => {
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({ error: 'Ingen spiller fundet' })
    }
    response.json(player.result)
})

app.post('/rollDice', (request, response) => {
    let player = players.get(request.sessionID)
    if (!player) {
        return response.status(401).json({ error: 'Ingen spiller fundet' })
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
        return response.status(401).json({ error: 'Ingen spiller fundet' })
    }
    resetCounter(player); // Reset counteren til 3 for en ny runde
    nulstilValues(player);
    player.dices.length = 0; // Tømmer dices-arrayet for at starte en ny runde
    response.status(201).json({
        message: "Runde nulstillet på serveren"
    });
});

app.post('/newGame', (request, response) => {
    let winner;
    let winnerResult = 0
    for (let player of players.values()) {
        if (finishedCheck(player)) {
            if (winner == null) {
                winner = player
            }
            if (player.result.total.value > winnerResult) {
                winner = player
                winnerResult = player.result.total.value
            }
            if (player.result.total.value > player.highscore) {
                player.highscore = player.result.total.value
            }
            saveResult(player); // Gemmer det nuværende result objekt i player.oldResults arrayet og resetter result objektet'
        }
        player.dices.length = 0;
        resetCounter(player) // Tømmer dices-arrayet for at starte en ny runde
    }
    if (winner != null) {
        winner.wins += 1;
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
        return response.status(401).json({ error: 'Ingen spiller fundet' })
    }
    player.result[felt].locked = body.låst; //.låst tilgår værdien i body der hedder låst, altså true
    response.json(player.result)
});

app.listen(8080, () => console.log('Lytter på port 8080 ...'));