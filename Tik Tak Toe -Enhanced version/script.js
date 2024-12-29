// Game state variables
const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let playerXType = 'human';
let playerOType = 'human';
let scores = { 'X': 0, 'O': 0 };
let gameActive = true;
let isProcessingMove = false;
let touchStartTime = 0;
const TOUCH_DURATION_THRESHOLD = 200; // ms

// Initialize touch events for mobile
cells.forEach((cell, index) => {
    // Mouse events
    cell.addEventListener('click', (e) => {
        if (gameActive && !isProcessingMove) {
            handleMove(index);
        }
    });

    // Touch events with improved handling
    cell.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameActive && !isProcessingMove) {
            touchStartTime = Date.now();
            cell.classList.add('cell-active');
        }
    });

    cell.addEventListener('touchend', (e) => {
        e.preventDefault();
        cell.classList.remove('cell-active');
        if (gameActive && !isProcessingMove) {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < TOUCH_DURATION_THRESHOLD) {
                handleMove(index);
            }
        }
    });

    // Cancel touch if moved out
    cell.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        cell.classList.remove('cell-active');
    });
});

// Handle move for both click and touch
function handleMove(index) {
    if (gameBoard[index] === '' && 
        ((currentPlayer === 'X' && playerXType === 'human') || 
         (currentPlayer === 'O' && playerOType === 'human'))) {
        
        isProcessingMove = true;
        makeMove(index);
        
        // Check for game end conditions
        if (!checkWinner()) {
            switchPlayer();
            // Trigger computer move if applicable
            if (gameActive && isComputerTurn()) {
                setTimeout(() => computerTurn(), 500);
            }
        }
        isProcessingMove = false;
    }
}

function makeMove(index) {
    cells[index].textContent = currentPlayer;
    gameBoard[index] = currentPlayer;
    // Add visual feedback
    cells[index].classList.add('cell-filled');
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function isComputerTurn() {
    return (currentPlayer === 'X' && playerXType === 'computer') || 
           (currentPlayer === 'O' && playerOType === 'computer');
}

function computerTurn() {
    if (!gameActive) return;
    
    isProcessingMove = true;
    const emptyCells = getEmptyCells();
    
    if (emptyCells.length === 0) {
        announceDraw();
        return;
    }

    // Improved computer AI
    const computerChoice = getComputerMove(emptyCells);
    makeMove(computerChoice);

    if (!checkWinner()) {
        switchPlayer();
        isProcessingMove = false;
    }
}

function getEmptyCells() {
    return gameBoard.reduce((acc, val, index) => 
        val === '' ? [...acc, index] : acc, []);
}

function getComputerMove(emptyCells) {
    // Increased intelligence probability
    const useSmartMove = Math.random() < 0.75; // 75% chance for intelligent move
    return useSmartMove ? getBestMove() : getRandomMove(emptyCells);
}

function getBestMove() {
    const emptyCells = getEmptyCells();
    
    // If board is empty, choose a random corner or center
    if (emptyCells.length === 9) {
        const preferredFirstMoves = [0, 2, 4, 6, 8];
        return preferredFirstMoves[Math.floor(Math.random() * preferredFirstMoves.length)];
    }

    // Check for winning move
    const winningMove = findWinningMove(currentPlayer);
    if (winningMove !== -1) return winningMove;

    // Block opponent's winning move
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    const blockingMove = findWinningMove(opponent);
    if (blockingMove !== -1) return blockingMove;

    // Strategic moves priority
    return getStrategicMove(emptyCells);
}

function findWinningMove(player) {
    const emptyCells = getEmptyCells();
    
    for (let cell of emptyCells) {
        const testBoard = [...gameBoard];
        testBoard[cell] = player;
        if (checkWinningCondition(testBoard, player)) {
            return cell;
        }
    }
    return -1;
}

function getStrategicMove(emptyCells) {
    // Priority order: Center, Corners, Edges
    const center = 4;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];
    
    if (emptyCells.includes(center)) return center;
    
    const availableCorners = corners.filter(corner => emptyCells.includes(corner));
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    const availableEdges = edges.filter(edge => emptyCells.includes(edge));
    return availableEdges[Math.floor(Math.random() * availableEdges.length)];
}

function getRandomMove(emptyCells) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function checkWinner() {
    if (checkWinningCondition(gameBoard, currentPlayer)) {
        announceWinner(currentPlayer);
        return true;
    } else if (gameBoard.every(cell => cell !== '')) {
        announceDraw();
        return true;
    }
    return false;
}

function checkWinningCondition(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player));
}

function announceWinner(winner) {
    gameActive = false;
    scores[winner]++;
    updateScoreDisplay();
    showPopup(`${winner} wins!`);
}

function announceDraw() {
    gameActive = false;
    showPopup('Draw!');
}

function updateScoreDisplay() {
    document.getElementById('scoreX').textContent = scores['X'];
    document.getElementById('scoreO').textContent = scores['O'];
}

function showPopup(message) {
    const popup = document.getElementById('winnerPopup');
    document.body.classList.add('popup-active');
    popup.textContent = message;
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.display = 'none';
        document.body.classList.remove('popup-active');
        resetGame();
    }, 2000);
}

function resetGame() {
    gameBoard.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('cell-filled');
    });
    currentPlayer = 'X';
    gameActive = true;
    isProcessingMove = false;

    if (playerXType === 'computer') {
        setTimeout(() => computerTurn(), 500);
    }
}

function resetScores() {
    scores = { 'X': 0, 'O': 0 };
    updateScoreDisplay();
}

// Dropdown management
function toggleDropdown(player) {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => dropdown.style.display = 'none');
    
    const currentDropdown = document.getElementById(`player${player}Dropdown`)
        .querySelector('.dropdown-content');
    currentDropdown.style.display = 'block';

    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.matches('.dropbtn')) {
            currentDropdown.style.display = 'none';
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function changePlayerType(player, type) {
    if (player === 'X') {
        playerXType = type;
        document.getElementById('selectedPlayerX').textContent = 
            type.charAt(0).toUpperCase() + type.slice(1);
    } else {
        playerOType = type;
        document.getElementById('selectedPlayerO').textContent = 
            type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Hide dropdown after selection
    document.getElementById(`player${player}Dropdown`)
        .querySelector('.dropdown-content').style.display = 'none';
        
    resetGame();
}