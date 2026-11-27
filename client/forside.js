const startButton = document.querySelector('#start-game');

const initialStatus = document.querySelector('#game-status').dataset.status;


// Starter spillet, når en spiller trykker på knappen
async function startGame() {
    startButton.disabled = true;


    try {
        // Sender post-request til Express-serveren. Vi modtager en game-status
        const response = await fetch('/api/game/start', {
            method: 'POST'
        });

        // Tjekker om serveren kunne starte spil
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Spillet kunne ikke starte');
        }

        window.location.href = '/game'; // alt er ok = spiller sendes til /game

    } catch (error) {
        console.error('En eller anden fejl', error);
        startButton.disabled = false;
    }   
}


async function updateGameStatus() { // Bruges til at finde ud af, om spil-status har ændret sig, altså hvad der skal ske med nye sessions

    try {
        const response = await fetch('/api/game/status', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Kunne ikke hente spil-status')
        }

        const data = await response.json();


        // Hvis spillet er startet og spilleren er tilmeldt = sendes til /game
        if (data.status === 'playing' && data.isParticipant) {
            window.location.href = '/game';
            return;
        }

        if (data.status !== initialStatus) {
            window.location.reload();
        }
        

    } catch (error) {
        console.error('En eller anden fejl', error);
    }
    
}


if (startButton) {
    startButton.addEventListener('click', startGame);
}

updateGameStatus();


setInterval(updateGameStatus, 3000); // Kaldes med 3 sekunders mellemrum


const scoreboardBody = document.querySelector('#scoreboard-body')
const emptyScoreboard = document.querySelector('#empty-scoreboard')



async function updateScoreboard() {
    try {
        const response = await fetch ('/api/scoreboard', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error ('Kunne ikke hente scoreboard');
        }

        const data = await response.json();

        const players = [...data.players].sort(
            (a, b) => b.total - a.total
        );

        const rows = players.map(player => {
            const row = document.createElement('tr');

            const name = document.createElement('td');
            const points = document.createElement('td');
            const fields = document.createElement('td');

            name.textContent = player.name;
            points.textContent = player.total ?? '-';

            fields.textContent = player.completedCategories == null ? '-' : `${player.completedCategories}/15`;

            row.append(name, points, fields);

            return row;
        });


        scoreboardBody.replaceChildren(...rows);

        emptyScoreboard.hidden = players.length > 0;

    } catch (error) {
        console.error('Fejl ved opdatering af scoreboard', error);
    }
}

updateScoreboard();

setInterval(updateScoreboard, 3000);
