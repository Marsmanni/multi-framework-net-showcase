import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './TicTacToe.css';

type Player = 'X' | 'O' | '';
type Board = Player[];

export default function TicTacToe() {
  const { t } = useI18n();
  const [board, setBoard] = useState<Board>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameStatus, setGameStatus] = useState<'win' | 'draw' | ''>('');
  const [winningPlayer, setWinningPlayer] = useState<Player>('');
  const [isGameOver, setIsGameOver] = useState(false);

  const checkWinner = (boardToCheck: Board): Player => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return boardToCheck[a];
      }
    }

    return '';
  };

  const isBoardFull = (boardToCheck: Board): boolean => {
    return boardToCheck.every(cell => cell !== '');
  };

  const minimax = (boardToCheck: Board, depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(boardToCheck);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(boardToCheck)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardToCheck[i] === '') {
          boardToCheck[i] = 'O';
          const score = minimax(boardToCheck, depth + 1, false);
          boardToCheck[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardToCheck[i] === '') {
          boardToCheck[i] = 'X';
          const score = minimax(boardToCheck, depth + 1, true);
          boardToCheck[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = (boardToCheck: Board): number => {
    let bestScore = -Infinity;
    const bestMoves: number[] = [];

    for (let i = 0; i < 9; i++) {
      if (boardToCheck[i] === '') {
        boardToCheck[i] = 'O';
        const score = minimax(boardToCheck, 0, false);
        boardToCheck[i] = '';

        if (score > bestScore) {
          bestScore = score;
          bestMoves.length = 0;
          bestMoves.push(i);
        } else if (score === bestScore) {
          bestMoves.push(i);
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  };

  const makeComputerMove = (currentBoard: Board) => {
    const bestMove = findBestMove([...currentBoard]);
    const newBoard = [...currentBoard];
    newBoard[bestMove] = 'O';
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setGameStatus('win');
      setWinningPlayer(winner);
      setIsGameOver(true);
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setIsGameOver(true);
    } else {
      setCurrentPlayer('X');
      setGameStatus('');
    }
    
    setBoard(newBoard);
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || isGameOver || currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setGameStatus('win');
      setWinningPlayer(winner);
      setIsGameOver(true);
      setBoard(newBoard);
      return;
    }
    
    if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setIsGameOver(true);
      setBoard(newBoard);
      return;
    }

    setBoard(newBoard);
    setCurrentPlayer('O');
    
    // Computer move after short delay
    setTimeout(() => makeComputerMove(newBoard), 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameStatus('');
    setIsGameOver(false);
  };

  const computerStarts = () => {
    resetGame();
    const newBoard = Array(9).fill('');
    const randomIndex = Math.floor(Math.random() * 9);
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);
    setCurrentPlayer('X');
  };

  return (
    <div className="card tictactoe-card">
      <div className="card-header">
        <h2>{t('ticTacToeTitle')}</h2>
        <p className="card-subtitle">{t('ticTacToeSubtitle')}</p>
      </div>
      <div className="card-content">
        <div className="game-info">
          <span className="current-player-label">{t('currentPlayerLabel')}</span>
          <span className="current-player">{currentPlayer}</span>
        </div>
        {gameStatus && (
          <div className="game-status">
            {gameStatus === 'win' ? t('gameWin', winningPlayer) : t('gameDraw')}
          </div>
        )}
        
        <div className="game-board">
          {board.map((cell, index) => (
            <button
              key={index}
              className="game-cell"
              onClick={() => handleCellClick(index)}
              disabled={cell !== '' || isGameOver}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="game-buttons">
          <button className="btn-primary" onClick={resetGame}>
            🔄 {t('resetGameButton')}
          </button>
          <button className="btn-secondary" onClick={computerStarts}>
            🤖 {t('computerStartsButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
