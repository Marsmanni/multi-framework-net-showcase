<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Player = 'X' | 'O' | '';
type Board = Player[];
const { t } = useI18n();
const board = ref<Board>(Array(9).fill(''));
const currentPlayer = ref<Player>('X');
const status = ref<'inProgress' | 'win' | 'draw' | ''>('inProgress');
const winningPlayer = ref<Player>('');
const gameOver = ref(false);
let computerTimer: ReturnType<typeof setTimeout> | undefined;
const gameStatus = computed(() => {
  if (status.value === 'win') return t('gameWin', { player: winningPlayer.value });
  if (status.value === 'draw') return t('gameDraw');
  if (status.value === 'inProgress') return t('gameInProgress');
  return '';
});

const winPatterns: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(cells: Board): Player {
  for (const [a, b, c] of winPatterns) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
  }
  return '';
}

function minimax(cells: Board, depth: number, maximizing: boolean): number {
  const winner = checkWinner(cells);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (cells.every(Boolean)) return 0;

  let best = maximizing ? -Infinity : Infinity;
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index]) continue;
    cells[index] = maximizing ? 'O' : 'X';
    const score = minimax(cells, depth + 1, !maximizing);
    cells[index] = '';
    best = maximizing ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function findBestMove(cells: Board) {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index]) continue;
    cells[index] = 'O';
    const score = minimax(cells, 0, false);
    cells[index] = '';
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}

function updateStatus(cells: Board) {
  const winner = checkWinner(cells);
  if (winner) {
    status.value = 'win';
    winningPlayer.value = winner;
    gameOver.value = true;
  } else if (cells.every(Boolean)) {
    status.value = 'draw';
    gameOver.value = true;
  } else {
    status.value = '';
    gameOver.value = false;
  }
}

function makeComputerMove() {
  const nextBoard = [...board.value];
  const index = findBestMove(nextBoard);
  if (index < 0) return;
  nextBoard[index] = 'O';
  board.value = nextBoard;
  updateStatus(nextBoard);
  if (!gameOver.value) currentPlayer.value = 'X';
}

function play(index: number) {
  if (gameOver.value || currentPlayer.value !== 'X' || board.value[index]) return;
  const nextBoard = [...board.value];
  nextBoard[index] = 'X';
  board.value = nextBoard;
  updateStatus(nextBoard);
  if (!gameOver.value) {
    currentPlayer.value = 'O';
    computerTimer = setTimeout(makeComputerMove, 500);
  }
}

function resetGame() {
  if (computerTimer) clearTimeout(computerTimer);
  board.value = Array(9).fill('');
  currentPlayer.value = 'X';
  status.value = 'inProgress';
  winningPlayer.value = '';
  gameOver.value = false;
}

function computerStarts() {
  resetGame();
  const nextBoard: Board = Array(9).fill('');
  nextBoard[Math.floor(Math.random() * nextBoard.length)] = 'O';
  board.value = nextBoard;
}

resetGame();
onBeforeUnmount(() => {
  if (computerTimer) clearTimeout(computerTimer);
});
</script>

<template>
  <section class="card game-card">
    <div class="card-header">
      <h2>{{ t('ticTacToeTitle') }}</h2>
      <p>{{ t('ticTacToeSubtitle') }}</p>
    </div>
    <div class="card-content game-content">
      <div class="game-info">
        <span>{{ t('currentPlayerLabel') }}</span><strong>{{ currentPlayer }}</strong>
      </div>
      <p class="game-status" aria-live="polite">{{ gameStatus }}</p>
      <div class="game-board" role="grid" :aria-label="t('ticTacToeTitle')">
        <button
          v-for="(cell, index) in board"
          :key="index"
          class="game-cell"
          type="button"
          role="gridcell"
          :aria-label="`${index + 1}: ${cell || 'empty'}`"
          :disabled="Boolean(cell) || gameOver || currentPlayer === 'O'"
          @click="play(index)"
        >{{ cell }}</button>
      </div>
      <div class="game-actions">
        <button class="button-primary" type="button" @click="resetGame">🔄 {{ t('resetGameButton') }}</button>
        <button class="button-secondary" type="button" @click="computerStarts">🤖 {{ t('computerStartsButton') }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.game-info {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
}

.game-status {
  min-height: 1.5rem;
  margin: 0.6rem 0;
  text-align: center;
  color: var(--muted);
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  width: min(100%, 260px);
  margin: 0 auto;
}

.game-cell {
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f8f9fc;
  color: #4a56a8;
  font-size: 2rem;
  font-weight: 700;
}

.game-cell:not(:disabled):hover {
  background: #eef0ff;
}

.game-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}

.game-actions button {
  font-size: 0.88rem;
}
</style>
