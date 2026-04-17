document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');

    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');

    const numPlayers = 5;
    const playerInputs = Array.from({ length: numPlayers }, (_, i) => document.getElementById(`player${i + 1}`));
    const outcomeInputs = Array.from({ length: numPlayers }, (_, i) => document.getElementById(`outcome${i + 1}`));

    let players = playerInputs.map(input => input.placeholder);
    let outcomes = outcomeInputs.map(input => input.placeholder);
    let ladder = [];
    let results = [];
    let isAnimating = false;

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
    const lineWidth = 2;
    const rungHeight = 20;

    function drawLadder() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        const spacing = canvas.width / (numPlayers + 1);

        // Draw vertical lines and text
        for (let i = 0; i < numPlayers; i++) {
            const x = spacing * (i + 1);
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, canvas.height - 40);
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.fillText(players[i], x, 30);
            ctx.fillText(outcomes[i], x, canvas.height - 15);
        }

        // Draw rungs
        ctx.strokeStyle = '#555';
        ladder.forEach(rung => {
            const x1 = spacing * (rung.start + 1);
            const x2 = spacing * (rung.end + 1);
            ctx.beginPath();
            ctx.moveTo(x1, rung.y);
            ctx.lineTo(x2, rung.y);
            ctx.stroke();
        });
    }

    function generateLadder() {
        ladder = [];
        const spacing = canvas.width / (numPlayers + 1);
        const numRungs = 15; // Adjust for more or fewer rungs
        const ladderHeight = canvas.height - 80;

        for (let i = 0; i < numRungs; i++) {
            const y = Math.floor(Math.random() * (ladderHeight - 40)) + 60;
            const start = Math.floor(Math.random() * (numPlayers - 1));

            // Ensure no overlapping rungs
            const isOverlapping = ladder.some(r => Math.abs(r.y - y) < rungHeight && (r.start === start || r.end === start));

            if (!isOverlapping) {
                ladder.push({ start: start, end: start + 1, y: y });
            }
        }
        ladder.sort((a, b) => a.y - b.y);
    }

    function updateNames() {
        players = playerInputs.map((input, i) => input.value || input.placeholder);
        outcomes = outcomeInputs.map((input, i) => input.value || input.placeholder);
        drawLadder();
    }

    function tracePath(playerIndex) {
        const spacing = canvas.width / (numPlayers + 1);
        let currentLine = playerIndex;
        let y = 40;

        ctx.beginPath();
        ctx.strokeStyle = colors[playerIndex];
        ctx.lineWidth = 3;
        const startX = spacing * (playerIndex + 1);
        ctx.moveTo(startX, y);

        const path = (timestamp) => {
            if (y >= canvas.height - 40) {
                ctx.stroke();
                results[playerIndex] = currentLine;
                if(results.filter(r => r !== undefined).length === numPlayers) {
                    displayResults();
                }
                return;
            }

            const nextRung = ladder.find(rung => rung.y > y && (rung.start === currentLine || rung.end === currentLine));

            if (nextRung) {
                const targetY = nextRung.y;
                const fromX = spacing * (currentLine + 1);
                ctx.lineTo(fromX, targetY);
                y = targetY;
                
                const isStart = nextRung.start === currentLine;
                currentLine = isStart ? nextRung.end : nextRung.start;
                const toX = spacing * (currentLine + 1);
                ctx.lineTo(toX, y);

            } else {
                const endX = spacing * (currentLine + 1);
                ctx.lineTo(endX, canvas.height - 40);
                y = canvas.height - 40;
            }

            ctx.stroke();
            ctx.beginPath();
            const currentX = spacing * (currentLine + 1);
            ctx.moveTo(currentX, y);

            requestAnimationFrame(path);
        };
        requestAnimationFrame(path);
    }
    
    function displayResults() {
        ctx.font = 'bold 16px Arial';
        for (let i = 0; i < numPlayers; i++) {
            const finalPosition = results.indexOf(i);
            const startX = canvas.width / (numPlayers + 1) * (i + 1);
            const endX = canvas.width / (numPlayers + 1) * (finalPosition + 1);

            ctx.fillStyle = colors[i];
            const resultText = `${players[i]} -> ${outcomes[finalPosition]}`;
            ctx.fillText(resultText, startX , canvas.height - 15);
        }
         isAnimating = false;
         startButton.disabled = false;
    }


    function startGame() {
        if (isAnimating) return;
        isAnimating = true;
        startButton.disabled = true;
        results = new Array(numPlayers).fill(undefined);

        updateNames();
        generateLadder();
        drawLadder();

        for (let i = 0; i < numPlayers; i++) {
            setTimeout(() => tracePath(i), i * 200);
        }
    }

    function resetGame() {
        isAnimating = false;
        startButton.disabled = false;
        playerInputs.forEach(input => input.value = '');
        outcomeInputs.forEach(input => input.value = '');
        players = playerInputs.map(input => input.placeholder);
        outcomes = outcomeInputs.map(input => input.placeholder);
        ladder = [];
        drawLadder();
    }

    playerInputs.forEach(input => input.addEventListener('input', updateNames));
    outcomeInputs.forEach(input => input.addEventListener('input', updateNames));
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);

    // Initial draw
    drawLadder();
});
