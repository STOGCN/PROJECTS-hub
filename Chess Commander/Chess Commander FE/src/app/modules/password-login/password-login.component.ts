import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FENChar, pieceImagePaths, Coords, Color } from '../../chess-logic/models';
import { ChessBoard } from '../../chess-logic/chess-board';
import { FENConverter } from '../../chess-logic/FENConverter';
import { Pawn } from '../../chess-logic/pieces/pawn';
import { Rook } from '../../chess-logic/pieces/rook';
import { King } from '../../chess-logic/pieces/king';

@Component({
  selector: 'app-password-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-login.component.html',
  styleUrls: ['./password-login.component.css']
})
export class PasswordLoginComponent {
  @Output() back = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  private fenConverter = new FENConverter();
  private chessBoard = new ChessBoard();

  // Password moves sequence with piece prefix (e.g., "N:f3e5")
  public passwordSequence = ["N:f3e5", "n:c6e5", "n:f6e4"];

  public userEnteredMoves: string[] = [];
  public chessBoardView: (FENChar | null)[][] = [];
  public selectedSquare: Coords | null = null;
  public pieceSafeSquares: Coords[] = [];
  public isBurning = false;
  public isError = false;
  public pieceImagePaths = pieceImagePaths;

  private columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

  constructor() {
    this.initializePasswordBoard();
  }

  private initializePasswordBoard() {
    // Initial FEN for the password board
    const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
    this.chessBoardView = this.fenConverter.convertFENToSimpleBoard(fen);
    this.manualSyncChessBoard(fen);
    this.userEnteredMoves = [];
    this.isError = false;
  }

  private manualSyncChessBoard(fen: string) {
    // Hack: Forcing the internal board to match our FEN so rules work
    const pieceBoard = this.fenConverter.convertFENToBoard(fen);
    (this.chessBoard as any).chessBoard = pieceBoard;
    (this.chessBoard as any)._playerColor = Color.White; // Reset start color

    // Sync hasMoved state for pieces based on their positions
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = pieceBoard[x][y];
        if (!piece) continue;

        // Pawns: White home is rank 1, Black home is rank 6
        if (piece instanceof Pawn) {
          if ((piece.color === Color.White && x !== 1) ||
            (piece.color === Color.Black && x !== 6)) {
            (piece as any).hasMoved = true;
          }
        }
        // Rooks: White home (0,0),(0,7), Black home (7,0),(7,7)
        else if (piece instanceof Rook) {
          if ((piece.color === Color.White && (x !== 0 || (y !== 0 && y !== 7))) ||
            (piece.color === Color.Black && (x !== 7 || (y !== 0 && y !== 7)))) {
            (piece as any).hasMoved = true;
          }
        }
        // King: White home (0,4), Black home (7,4)
        else if (piece instanceof King) {
          if ((piece.color === Color.White && (x !== 0 || y !== 4)) ||
            (piece.color === Color.Black && (x !== 7 || y !== 4))) {
            (piece as any).hasMoved = true;
          }
        }
      }
    }

    // Reset game state flags
    (this.chessBoard as any)._isGameOver = false;
    (this.chessBoard as any)._gameOverMessage = undefined;
    (this.chessBoard as any)._lastMove = undefined;
    (this.chessBoard as any)._checkState = { isInCheck: false };
    (this.chessBoard as any).fiftyMoveRuleCounter = 0;
    (this.chessBoard as any).threeFoldRepetitionDictionary = new Map<string, number>();
    (this.chessBoard as any).threeFoldRepetitionFlag = false;

    // Recalculate safe squares for the new board configuration
    (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();

    this.updateLocalView();
  }

  private updateLocalView() {
    this.chessBoardView = this.chessBoard.chessBoardView;
    if (this.selectedSquare) {
      const x = this.selectedSquare.x;
      const y = this.selectedSquare.y;

      const piece = (this.chessBoard as any).chessBoard[x][y];
      if (piece) {
        // Force the board's internal turn to match the selected piece
        // so that findSafeSquares() shows hints for this specific piece
        (this.chessBoard as any)._playerColor = piece.color;
        (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();
      }

      // Get safe squares directly from the board state
      this.pieceSafeSquares = this.chessBoard.safeSquares.get(`${x},${y}`) || [];
    } else {
      this.pieceSafeSquares = [];
    }
  }

  public onSquareClick(x: number, y: number) {
    if (this.isBurning || this.isError) return;

    if (this.selectedSquare) {
      if (this.isSquareSafeForSelectedPiece(x, y)) {
        this.recordMove(this.selectedSquare.x, this.selectedSquare.y, x, y);
      } else {
        this.selectingPiece(x, y);
      }
    } else {
      this.selectingPiece(x, y);
    }
  }

  private selectingPiece(x: number, y: number) {
    const piece = this.chessBoardView[x][y];
    if (!piece) {
      this.selectedSquare = null;
      this.pieceSafeSquares = [];
      return;
    }
    this.selectedSquare = { x, y };
    this.updateLocalView();
  }

  private convertToUCI(piece: FENChar, prevX: number, prevY: number, newX: number, newY: number): string {
    const from = this.columns[prevY] + (prevX + 1);
    const to = this.columns[newY] + (newX + 1);
    return `${piece}:${from}${to}`;
  }

  private recordMove(prevX: number, prevY: number, newX: number, newY: number) {
    try {
      // Force turn to piece color so move can execute
      const piece = (this.chessBoard as any).chessBoard[prevX][prevY];
      if (piece) {
        (this.chessBoard as any)._playerColor = piece.color;
        (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();
      }

      this.chessBoard.move(prevX, prevY, newX, newY, null);

      // Record move with piece prefix (e.g., "N:f3e5")
      const uciMove = this.convertToUCI(piece.FENChar, prevX, prevY, newX, newY);
      this.userEnteredMoves.push(uciMove);

      if (this.userEnteredMoves.length === this.passwordSequence.length) {
        this.validateSequence();
      }
    } catch (e) {
      console.error("Illegal move:", e);
    }

    this.selectedSquare = null;
    this.updateLocalView();
  }

  private validateSequence() {
    const isCorrect = this.userEnteredMoves.every((move, index) => {
      return move === this.passwordSequence[index];
    });

    if (isCorrect) {
      this.triggerSuccess();
    } else {
      this.triggerFailure();
    }
  }

  private triggerFailure() {
    this.isError = true;
    console.log("Password entry incorrect.");
    // Wait a bit before resetting so user can see they finished the moves
    setTimeout(() => {
      this.initializePasswordBoard();
    }, 1500);
  }

  private triggerSuccess() {
    this.isBurning = true;
    setTimeout(() => {
      this.loginSuccess.emit();
    }, 2000);
  }

  public isSquareDark(x: number, y: number): boolean {
    return (x + y) % 2 === 0;
  }

  public isSquareSelected(x: number, y: number): boolean {
    return this.selectedSquare?.x === x && this.selectedSquare?.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(s => s.x === x && s.y === y);
  }

  public getPieceImage(piece: FENChar | null): string {
    return piece ? this.pieceImagePaths[piece] : '';
  }

  public onBack() {
    this.back.emit();
  }
}

