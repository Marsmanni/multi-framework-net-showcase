import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import CustomData from "sap/ui/core/CustomData";
import MessageToast from "sap/m/MessageToast";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace com.24steps.ui5sample.controller
 */
export default class TicTacToe extends Controller {
	private oModel: JSONModel;

	public onInit(): void {
		this.resetGame();
	}

	private async getResourceBundle(): Promise<ResourceBundle> {
		const oView = this.getView();
		if (!oView) {
			throw new Error("View not initialized");
		}
		const oModel = oView.getModel("i18n") as ResourceModel;
		return await oModel.getResourceBundle() as ResourceBundle;
	}

	public onButtonCellPress(oEvent: Event): void {
		const aCustomData = oEvent.getSource().getCustomData();
		const oIndexData = aCustomData.find((data: CustomData) => data.getKey() === "index");
		
		if (!oIndexData) {
			console.log("TicTacToe: No index data found");
			return;
		}

		const iIndex = parseInt(oIndexData.getValue() as string);
		const aBoard = this.oModel.getProperty("/board") as string[];
		const sCurrentPlayer = this.oModel.getProperty("/currentPlayer") as string;
		const bGameOver = this.oModel.getProperty("/gameOver") as boolean;

		console.log(`TicTacToe: Cell ${iIndex} pressed by player ${sCurrentPlayer}`);

		// If game is over, reset and start new game
		if (bGameOver) {
			console.log("TicTacToe: Game over, resetting and starting new game");
			this.resetGame();
			// Make the move on the clicked cell
			const aNewBoard = this.oModel.getProperty("/board") as string[];
			aNewBoard[iIndex] = "X";
			this.oModel.setProperty("/board", aNewBoard);
			console.log(`TicTacToe: Player X placed at index ${iIndex}`);
			
			// Switch to computer
			this.oModel.setProperty("/currentPlayer", "O");
			this.getResourceBundle().then((oBundle) => {
				this.oModel.setProperty("/gameStatus", oBundle.getText("gameStatusInProgress"));
			});
			setTimeout(() => this.makeComputerMove(), 500);
			return;
		}

		// Check if cell is already taken
		if (aBoard[iIndex] !== "") {
			console.log(`TicTacToe: Cell ${iIndex} is already taken`);
			return;
		}

		// Make move
		aBoard[iIndex] = sCurrentPlayer;
		this.oModel.setProperty("/board", aBoard);
		console.log(`TicTacToe: Player ${sCurrentPlayer} placed at index ${iIndex}`);

		// Check for winner
		const sWinner = this.checkWinner(aBoard);
		if (sWinner) {
			console.log(`TicTacToe: Winner detected - Player ${sWinner}`);
			this.getResourceBundle().then((oBundle) => {
				const sWinStatus = oBundle.getText("gameStatusWin", [sWinner]);
				const sWinToast = oBundle.getText("winnerToastMessage", [sWinner]);
				this.oModel.setProperty("/gameStatus", sWinStatus);
				MessageToast.show(sWinToast);
			});
			this.oModel.setProperty("/gameOver", true);
			return;
		}

		// Check for draw
		if (aBoard.every(cell => cell !== "")) {
			console.log("TicTacToe: Draw detected - board is full");
			this.getResourceBundle().then((oBundle) => {
				const sDrawStatus = oBundle.getText("gameStatusDraw");
				const sDrawToast = oBundle.getText("drawToastMessage");
				this.oModel.setProperty("/gameStatus", sDrawStatus);
				MessageToast.show(sDrawToast);
			});
			this.oModel.setProperty("/gameOver", true);
			return;
		}

		// Switch player
		const sNextPlayer = sCurrentPlayer === "X" ? "O" : "X";
		this.oModel.setProperty("/currentPlayer", sNextPlayer);
		this.getResourceBundle().then((oBundle) => {
			this.oModel.setProperty("/gameStatus", oBundle.getText("gameStatusInProgress"));
		});
		console.log(`TicTacToe: Switched to player ${sNextPlayer}`);

		// If next player is computer (O), make computer move after slight delay
		if (sNextPlayer === "O") {
			setTimeout(() => this.makeComputerMove(), 500);
		}
	}

	public onResetGameButtonPress(): void {
		console.log("TicTacToe: Reset game button pressed");
		this.resetGame();
		this.getResourceBundle().then((oBundle) => {
			MessageToast.show(oBundle.getText("resetToastMessage"));
		});
	}

	public onComputerStartsButtonPress(): void {
		console.log("TicTacToe: Computer starts button pressed");
		this.resetGame();
		// Set computer as starting player
		this.oModel.setProperty("/currentPlayer", "O");
		this.getResourceBundle().then((oBundle) => {
			MessageToast.show(oBundle.getText("computerStartsToastMessage"));
		});
		// Make computer move after slight delay
		setTimeout(() => this.makeComputerMove(), 500);
	}

	private resetGame(): void {
		console.log("TicTacToe: Resetting game");
		const oData = {
			board: ["", "", "", "", "", "", "", "", ""],
			currentPlayer: "X",
			gameStatus: "Game in progress",
			gameOver: false
		};

		if (!this.oModel) {
			console.log("TicTacToe: Creating new model");
			this.oModel = new JSONModel(oData);
			this.getView()?.setModel(this.oModel, "ticTacToe");
		} else {
			console.log("TicTacToe: Updating existing model");
			this.oModel.setData(oData);
		}
		
		// Update game status with i18n if view is initialized
		const oView = this.getView();
		if (oView) {
			this.getResourceBundle().then((oBundle) => {
				this.oModel.setProperty("/gameStatus", oBundle.getText("gameStatusInProgress"));
			}).catch(() => {
				// Ignore error during initialization
			});
		}
	}

	private checkWinner(board: string[]): string | null {
		const winPatterns = [
			[0, 1, 2], // Top row
			[3, 4, 5], // Middle row
			[6, 7, 8], // Bottom row
			[0, 3, 6], // Left column
			[1, 4, 7], // Middle column
			[2, 5, 8], // Right column
			[0, 4, 8], // Diagonal top-left to bottom-right
			[2, 4, 6]  // Diagonal top-right to bottom-left
		];

		for (const pattern of winPatterns) {
			const [a, b, c] = pattern;
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return board[a];
			}
		}

		return null;
	}

	private makeComputerMove(): void {
		const aBoard = this.oModel.getProperty("/board") as string[];
		const sComputerPlayer = "O";
		const sHumanPlayer = "X";
		const bGameOver = this.oModel.getProperty("/gameOver") as boolean;

		if (bGameOver) {
			return;
		}

		console.log("TicTacToe: Computer is thinking...");

		// Find best move using minimax
		const bestMove = this.findBestMove(aBoard, sComputerPlayer, sHumanPlayer);

		if (bestMove !== -1) {
			// Make the move
			aBoard[bestMove] = sComputerPlayer;
			this.oModel.setProperty("/board", aBoard);
			console.log(`TicTacToe: Computer placed at index ${bestMove}`);

			// Check for winner
			const sWinner = this.checkWinner(aBoard);
			if (sWinner) {
				console.log(`TicTacToe: Winner detected - Player ${sWinner}`);
				this.getResourceBundle().then((oBundle) => {
					const sWinStatus = oBundle.getText("gameStatusWin", [sWinner]);
					const sWinToast = oBundle.getText("winnerToastMessage", [sWinner]);
					this.oModel.setProperty("/gameStatus", sWinStatus);
					MessageToast.show(sWinToast);
				});
				this.oModel.setProperty("/gameOver", true);
				return;
			}

			// Check for draw
			if (aBoard.every(cell => cell !== "")) {
				console.log("TicTacToe: Draw detected - board is full");
				this.getResourceBundle().then((oBundle) => {
					const sDrawStatus = oBundle.getText("gameStatusDraw");
					const sDrawToast = oBundle.getText("drawToastMessage");
					this.oModel.setProperty("/gameStatus", sDrawStatus);
					MessageToast.show(sDrawToast);
				});
				this.oModel.setProperty("/gameOver", true);
				return;
			}

			// Switch back to human player
			this.oModel.setProperty("/currentPlayer", sHumanPlayer);
			this.getResourceBundle().then((oBundle) => {
				this.oModel.setProperty("/gameStatus", oBundle.getText("gameStatusInProgress"));
			});
			console.log("TicTacToe: Switched back to human player");
		}
	}

	private findBestMove(board: string[], computer: string, human: string): number {
		let bestScore = -Infinity;
		const bestMoves: number[] = [];

		for (let i = 0; i < 9; i++) {
			if (board[i] === "") {
				// Try this move
				board[i] = computer;
				const score = this.minimax(board, 0, false, computer, human);
				board[i] = ""; // Undo move

				console.log(`TicTacToe: Evaluated move ${i} with score ${score}`);

				if (score > bestScore) {
					bestScore = score;
					bestMoves.length = 0; // Clear previous moves
					bestMoves.push(i);
				} else if (score === bestScore) {
					bestMoves.push(i); // Add to equally good moves
				}
			}
		}

		// If all moves have the same score, select randomly
		const bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

		console.log(`TicTacToe: Best moves are [${bestMoves.join(", ")}] with score ${bestScore}, selected ${bestMove}`);
		return bestMove;
	}

	private minimax(board: string[], depth: number, isMaximizing: boolean, computer: string, human: string): number {
		const winner = this.checkWinner(board);

		// Terminal states
		if (winner === computer) return 10 - depth; // Win faster is better
		if (winner === human) return depth - 10; // Lose slower is better
		if (board.every(cell => cell !== "")) return 0; // Draw

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (let i = 0; i < 9; i++) {
				if (board[i] === "") {
					board[i] = computer;
					const score = this.minimax(board, depth + 1, false, computer, human);
					board[i] = "";
					bestScore = Math.max(score, bestScore);
				}
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (let i = 0; i < 9; i++) {
				if (board[i] === "") {
					board[i] = human;
					const score = this.minimax(board, depth + 1, true, computer, human);
					board[i] = "";
					bestScore = Math.min(score, bestScore);
				}
			}
			return bestScore;
		}
	}
}
