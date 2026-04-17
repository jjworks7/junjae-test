document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');

    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const themeToggle = document.getElementById('themeToggle');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        drawLadder();
    });

    const numPlayers = 5;
    const playerInputs = Array.from({ length: numPlayers }, (_, i) => document.getElementById(`player${i + 1}`));
    const outcomeInputs = Array.from({ length: numPlayers }, (_, i) => document.getElementById(`outcome${i + 1}`));

    const fruitEmojis = ['🍎', '🥕', '🍊', '🍇', '🍌'];
    const defaultOutcomeImages = [
        'https://i.namu.wiki/i/Y81oBcVxbKdDKw9ymTHGqnVSntRMAHiOP5iwbDt1sbiu-02abkkMxv6JkeItlHAG62RdBsHxsLN3gkjFGoRftCPu9CzNgvf5FdiQkv7lxx4852uhE-0MTJU_B9WkhEfSIIki18plBnajOchvsX1Tcg.webp',
        'https://i.namu.wiki/i/qEbWSBklqYN8Cx0VlUaLrggEfJlIBfGSwaReTkT1wDqtEW5Q2fYnGSjfykL6l4g7K3JwzSBNLCvNL_2z2d6PDuuY8uwAAJ_78rzF7gnh1e9N1zZZnGff9BGnNcNcAfy0wedcWmNTpUVoITm04okejQ.webp',
        'https://i.namu.wiki/i/bDbMG09AythoxSw3QnEyDgQhMRJSUFO47Zmixq20h0wBSDm6KVYtrkRMIjNcNZCafaEBh0HQcjE0q3TE_6l7DG6jgtVPiCnFkEWMuJqa_ox7jVCdYc1zGyUsHJDHOTMoSgY7ehIv2c29oqmkENZH1w.webp',
        'https://i.namu.wiki/i/yKlsfScf1sj2bBiIkMAhI82VzJi-_lgu0lthojF6IuhsrglfqoQLS6DWKEHDoGnrYxOAKDMwRhm4Nn2j5hrYk-OtQaZBPpMaf-7GgRghPH6MyYRQMTe8PPc48FbQz2BoKQDfbt_YeOI7RaC7SClzPQ.webp',
        'https://i.namu.wiki/i/A51UzN25a1R1lo7awjmB4ZOZcMpYXvO8B3odZdvzHSD-o69uYq3nxUFw2ZyHreISRfryVKJjgYBcq2setEbIpdUe4uK9zeaS-c8dYc1oKjGwxZcJTFmCKpnm5n-EQJimAVQFkWH8FLmxxFqGef91nQ.webp'
    ];

    let players = playerInputs.map((input, i) => input.value || fruitEmojis[i]);
    let outcomes = outcomeInputs.map((input, i) => input.value || defaultOutcomeImages[i]);
    let outcomeImages = [];

    function preloadImages() {
        outcomeImages = outcomes.map(url => {
            const img = new Image();
            img.src = url;
            img.onload = () => drawLadder();
            return img;
        });
    }
    preloadImages();

    let ladder = [];
    let results = [];
    let isAnimating = false;

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
    const lineWidth = 2;
    const rungHeight = 20;

    function drawLadder() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDark = document.body.classList.contains('dark-mode');
        const lineCol = isDark ? '#f0f0f0' : '#333';
        const rungCol = isDark ? '#aaa' : '#555';
        const textCol = isDark ? '#f0f0f0' : '#333';

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineCol;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        const spacing = canvas.width / (numPlayers + 1);

        // Draw vertical lines and text
        for (let i = 0; i < numPlayers; i++) {
            const x = spacing * (i + 1);
            ctx.beginPath();
            ctx.moveTo(x, 50); // Adjusted for emoji
            ctx.lineTo(x, canvas.height - 120); // End before image
            ctx.stroke();

            ctx.fillStyle = textCol;
            ctx.font = '24px serif'; // Larger font for emojis
            ctx.fillText(players[i], x, 35);
            
            // Draw outcome image
            const imgSize = 40;
            const img = outcomeImages[i];
            if (img && img.complete) {
                ctx.drawImage(img, x - imgSize / 2, canvas.height - 110, imgSize, imgSize);
            } else {
                ctx.font = '10px Arial';
                ctx.fillText('Loading...', x, canvas.height - 90);
            }
        }

        // Draw rungs
        ctx.strokeStyle = rungCol;
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
        players = playerInputs.map((input, i) => input.value || fruitEmojis[i]);
        outcomes = outcomeInputs.map((input, i) => input.value || defaultOutcomeImages[i]);
        preloadImages();
    }

    function tracePath(playerIndex) {
        const spacing = canvas.width / (numPlayers + 1);
        let currentLine = playerIndex;
        let y = 50;

        ctx.beginPath();
        ctx.strokeStyle = colors[playerIndex];
        ctx.lineWidth = 3;
        const startX = spacing * (playerIndex + 1);
        ctx.moveTo(startX, y);

        const path = (timestamp) => {
            if (y >= canvas.height - 120) {
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
                ctx.lineTo(endX, canvas.height - 120);
                y = canvas.height - 120;
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
        const imgSize = 30;
        for (let i = 0; i < numPlayers; i++) {
            const finalPosition = results.indexOf(i);
            const startX = canvas.width / (numPlayers + 1) * (i + 1);
            
            ctx.fillStyle = colors[i];
            ctx.font = '20px serif';
            ctx.fillText(players[i], startX - 30, canvas.height - 30);
            ctx.font = '16px Arial';
            ctx.fillText('->', startX, canvas.height - 30);
            
            const resultImg = outcomeImages[finalPosition];
            if (resultImg && resultImg.complete) {
                ctx.drawImage(resultImg, startX + 10, canvas.height - 50, imgSize, imgSize);
            }
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
        players = playerInputs.map((input, i) => fruitEmojis[i]);
        outcomes = outcomeInputs.map((input, i) => defaultOutcomeImages[i]);
        preloadImages();
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
