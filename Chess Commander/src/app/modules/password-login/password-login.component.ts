import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FENChar, pieceImagePaths, Coords, Color } from '../../chess-logic/models';
import { ChessBoard } from '../../chess-logic/chess-board';
import { FENConverter } from '../../chess-logic/FENConverter';

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

  // Password moves sequence (prevX, prevY -> nextX, nextY)
  // Nf3 (2,5) -> e5 (4,4)
  // nc6 (5,2) -> e5 (4,4)
  // nf6 (5,5) -> e4 (3,4)
  public passwordSequence = [
    { prev: { x: 2, y: 5 }, curr: { x: 4, y: 4 } },
    { prev: { x: 5, y: 2 }, curr: { x: 4, y: 4 } },
    { prev: { x: 5, y: 5 }, curr: { x: 3, y: 4 } }
  ];

  public currentMoveIndex = 0;
  public chessBoardView: (FENChar | null)[][] = [];
  public selectedSquare: Coords | null = null;
  public pieceSafeSquares: Coords[] = [];
  public isBurning = false;
  public pieceImagePaths = pieceImagePaths;

  constructor() {
    this.initializePasswordBoard();
  }

  private initializePasswordBoard() {
    // Initial FEN for the password board
    const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
    this.chessBoardView = this.fenConverter.convertFENToSimpleBoard(fen);
    this.manualSyncChessBoard(fen);
  }

  private manualSyncChessBoard(fen: string) {
    // Hack: Forcing the internal board to match our FEN so rules work
    const pieceBoard = this.fenConverter.convertFENToBoard(fen);
    (this.chessBoard as any).chessBoard = pieceBoard;
    (this.chessBoard as any)._playerColor = Color.White; // Reset start color

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
    if (this.isBurning) return;

    if (this.selectedSquare) {
      if (this.isSquareSafeForSelectedPiece(x, y)) {
        this.verifyAndMove(this.selectedSquare.x, this.selectedSquare.y, x, y);
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

  private verifyAndMove(prevX: number, prevY: number, newX: number, newY: number) {
    const targetMove = this.passwordSequence[this.currentMoveIndex];

    // Perform move in ChessBoard to maintain rules
    try {
      // Force turn to piece color so move can execute
      const piece = (this.chessBoard as any).chessBoard[prevX][prevY];
      if (piece) {
        (this.chessBoard as any)._playerColor = piece.color;
        // MUST recalculate safe squares for the newly forced side
        (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();
      }

      this.chessBoard.move(prevX, prevY, newX, newY, null);

      // Check if this move matches the password sequence
      if (prevX === targetMove.prev.x && prevY === targetMove.prev.y &&
        newX === targetMove.curr.x && newY === targetMove.curr.y) {
        this.currentMoveIndex++;

        if (this.currentMoveIndex === this.passwordSequence.length) {
          this.triggerSuccess();
        }
      } else {
        // Wrong move in sequence - reset
        console.log("Wrong move in sequence! Resetting...");
        this.currentMoveIndex = 0;
        this.initializePasswordBoard();
      }
    } catch (e) {
      console.error("Illegal move according to chess rules:", e);
    }

    this.selectedSquare = null;
    this.updateLocalView();
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

