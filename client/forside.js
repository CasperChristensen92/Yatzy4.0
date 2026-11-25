const startButton = document.querySelector('#start-game');

const initialStatus = document.querySelector('#game-status').dataset.status;


// Starter spillet, når en spiller trykker på knappen
async function startGame() {
    startButton.disabled = true;


    try {
        // Sender post-request til Express-serveren. Vi modtager en game-status
        const response = await fetch('api/game/start', {
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