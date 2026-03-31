import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Color, Coords, FENChar, pieceImagePaths } from '../../chess-logic/models';
import { FENConverter } from '../../chess-logic/FENConverter';
import { ChessBoard } from '../../chess-logic/chess-board';
import { Pawn } from '../../chess-logic/pieces/pawn';
import { Rook } from '../../chess-logic/pieces/rook';
import { King } from '../../chess-logic/pieces/king';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-password.component.html',
  styleUrls: ['./register-password.component.css']
})
export class RegisterPasswordComponent {
  @ViewChild('passwordCard') passwordCardElement!: ElementRef;

  public currentStep: 1 | 2 = 1;
  public chessBoardView: (FENChar | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  public pieceImagePaths = pieceImagePaths;
  public fenInput: string = '';
  public selectedPiece: FENChar | null = null;
  public selectedSquare: Coords | null = null;
  public pieceSafeSquares: Coords[] = [];

  // Step 2 Sequence Setup
  public sequenceLength: number = 3;
  public userEnteredMoves: string[] = [];
  public showHistoryModal: boolean = false;
  public showPromotionModal: boolean = false;
  public moveHistory: string[] = [];

  private pendingPromotionMove: { prevX: number, prevY: number, newX: number, newY: number } | null = null;
  public promotionPieces: FENChar[] = [];

  public whitePieces: FENChar[] = [FENChar.WhiteKing, FENChar.WhiteQueen, FENChar.WhiteRook, FENChar.WhiteBishop, FENChar.WhiteKnight, FENChar.WhitePawn];
  public blackPieces: FENChar[] = [FENChar.BlackKing, FENChar.BlackQueen, FENChar.BlackRook, FENChar.BlackBishop, FENChar.BlackKnight, FENChar.BlackPawn];

  private fenConverter = new FENConverter();
  private chessBoard = new ChessBoard();
  private columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

  constructor(private router: Router) { }

  // ---------------- STEP 1 LOGIC ----------------

  public getPieceName(fenChar: FENChar): string {
    const names: Record<string, string> = {
      [FENChar.WhitePawn]: 'Pawn',
      [FENChar.WhiteKnight]: 'Knight',
      [FENChar.WhiteBishop]: 'Bishop',
      [FENChar.WhiteRook]: 'Rook',
      [FENChar.WhiteQueen]: 'Queen',
      [FENChar.WhiteKing]: 'King',
      [FENChar.BlackPawn]: 'Pawn',
      [FENChar.BlackKnight]: 'Knight',
      [FENChar.BlackBishop]: 'Bishop',
      [FENChar.BlackRook]: 'Rook',
      [FENChar.BlackQueen]: 'Queen',
      [FENChar.BlackKing]: 'King'
    };
    return names[fenChar] || 'Piece';
  }

  public onSquareClickStep1(x: number, y: number) {
    if (this.selectedPiece) {
      this.chessBoardView[x][y] = this.selectedPiece;
    } else {
      this.chessBoardView[x][y] = null;
    }
    this.updateFENFromBoard();
  }

  public selectPiece(piece: FENChar) {
    this.selectedPiece = this.selectedPiece === piece ? null : piece;
  }

  public clearBoard() {
    this.chessBoardView = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.fenInput = '';
  }

  public loadFEN() {
    if (!this.fenInput.trim()) return;
    try {
      this.chessBoardView = this.fenConverter.convertFENToSimpleBoard(this.fenInput);
    } catch (e) {
      console.error("Invalid FEN:", e);
      alert("Invalid FEN code");
    }
  }

  private updateFENFromBoard() {
    let fen = "";
    for (let i = 7; i >= 0; i--) {
      let empty = 0;
      for (let j = 0; j < 8; j++) {
        const piece = this.chessBoardView[i][j];
        if (piece) {
          if (empty > 0) { fen += empty; empty = 0; }
          fen += piece;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (i > 0) fen += "/";
    }
    this.fenInput = fen;
  }

  public goToStep2() {
    if (this.isBoardEmpty()) {
      alert("Please set a position first.");
      return;
    }
    this.currentStep = 2;
    this.initializeSequenceBoard();
    this.scrollToTop();
  }

  public backToStep1() {
    this.currentStep = 1;
    this.chessBoardView = this.fenConverter.convertFENToSimpleBoard(this.fenInput);
    this.selectedSquare = null;
    this.pieceSafeSquares = [];
    this.scrollToTop();
  }

  private scrollToTop() {
    setTimeout(() => {
      if (this.passwordCardElement) {
        this.passwordCardElement.nativeElement.scrollTop = 0;
      }
    }, 0);
  }

  // ---------------- STEP 2 LOGIC ----------------

  public setSequenceLength(len: number) {
    this.sequenceLength = len;
    this.initializeSequenceBoard();
  }

  private initializeSequenceBoard() {
    const fen = this.fenInput || "8/8/8/8/8/8/8/8";
    this.chessBoardView = this.fenConverter.convertFENToSimpleBoard(fen);

    // Explicitly sync the logical board with the FEN
    // Note: FENConverter.convertFENToBoard returns (Piece | null)[][]
    const pieceBoard = this.fenConverter.convertFENToBoard(fen);
    (this.chessBoard as any).chessBoard = pieceBoard;
    (this.chessBoard as any)._playerColor = Color.White;

    // Sync hasMoved state for pieces based on their positions
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = pieceBoard[x][y];
        if (!piece) continue;

        if (piece instanceof Pawn) {
          if ((piece.color === Color.White && x !== 1) || (piece.color === Color.Black && x !== 6)) {
            (piece as any).hasMoved = true;
          }
        }
        else if (piece instanceof Rook) {
          if ((piece.color === Color.White && (x !== 0 || (y !== 0 && y !== 7))) ||
            (piece.color === Color.Black && (x !== 7 || (y !== 0 && y !== 7)))) {
            (piece as any).hasMoved = true;
          }
        }
        else if (piece instanceof King) {
          if ((piece.color === Color.White && (x !== 0 || y !== 4)) || (piece.color === Color.Black && (x !== 7 || y !== 4))) {
            (piece as any).hasMoved = true;
          }
        }
      }
    }

    // Force game state resets to match engine rules
    (this.chessBoard as any)._isGameOver = false;
    (this.chessBoard as any)._gameOverMessage = undefined;
    (this.chessBoard as any)._lastMove = undefined;
    (this.chessBoard as any)._checkState = { isInCheck: false };
    (this.chessBoard as any).fiftyMoveRuleCounter = 0;
    (this.chessBoard as any).fullNumberOfMoves = 1;
    (this.chessBoard as any).threeFoldRepetitionDictionary = new Map<string, number>();
    (this.chessBoard as any).threeFoldRepetitionFlag = false;

    // Recalculate safe squares for the new board configuration
    (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();

    this.userEnteredMoves = [];
    this.moveHistory = [];
    this.selectedSquare = null;
    this.pieceSafeSquares = [];
    this.showHistoryModal = false;
    this.showPromotionModal = false;
    this.pendingPromotionMove = null;
  }

  public onSquareClickStep2(x: number, y: number) {
    if (this.showHistoryModal) return;

    if (this.selectedSquare) {
      if (this.isSquareSafe(x, y)) {
        this.recordMove(this.selectedSquare.x, this.selectedSquare.y, x, y);
      } else {
        this.selectSquare(x, y);
      }
    } else {
      this.selectSquare(x, y);
    }
  }

  private selectSquare(x: number, y: number) {
    const piece = this.chessBoardView[x][y];
    if (!piece) {
      this.selectedSquare = null;
      this.pieceSafeSquares = [];
      return;
    }
    this.selectedSquare = { x, y };

    // Logic from PasswordLoginComponent to show safe squares
    const logicalPiece = (this.chessBoard as any).chessBoard[x][y];
    if (logicalPiece) {
      (this.chessBoard as any)._playerColor = logicalPiece.color;
      (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();
      this.pieceSafeSquares = this.chessBoard.safeSquares.get(`${x},${y}`) || [];
    }
  }

  private recordMove(prevX: number, prevY: number, newX: number, newY: number) {
    const logicalPiece = (this.chessBoard as any).chessBoard[prevX][prevY];
    if (!logicalPiece) return;

    // Check for pawn promotion
    if (logicalPiece instanceof Pawn && (newX === 0 || newX === 7)) {
      this.pendingPromotionMove = { prevX, prevY, newX, newY };
      this.promotionPieces = logicalPiece.color === Color.White ?
        [FENChar.WhiteQueen, FENChar.WhiteRook, FENChar.WhiteBishop, FENChar.WhiteKnight] :
        [FENChar.BlackQueen, FENChar.BlackRook, FENChar.BlackBishop, FENChar.BlackKnight];
      this.showPromotionModal = true;
      return;
    }

    this.completeMove(prevX, prevY, newX, newY, null);
  }

  public onPromoteSelection(pieceType: FENChar) {
    if (!this.pendingPromotionMove) return;
    const { prevX, prevY, newX, newY } = this.pendingPromotionMove;
    this.completeMove(prevX, prevY, newX, newY, pieceType);
    this.showPromotionModal = false;
    this.pendingPromotionMove = null;
  }

  private completeMove(prevX: number, prevY: number, newX: number, newY: number, promotedPiece: FENChar | null) {
    const logicalPiece = (this.chessBoard as any).chessBoard[prevX][prevY];

    try {
      (this.chessBoard as any).isInCheck = () => false;
      (this.chessBoard as any)._playerColor = logicalPiece.color;
      (this.chessBoard as any)._safeSquares = (this.chessBoard as any).findSafeSqures();

      this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece);

      (this.chessBoard as any)._isGameOver = false;

      const from = this.columns[prevY] + (prevX + 1);
      const to = this.columns[newY] + (newX + 1);

      let uciMove = `${logicalPiece.FENChar}:${from}${to}`;
      let historyStr = `${this.getPieceName(logicalPiece.FENChar)} ${from} → ${to}`;

      if (promotedPiece) {
        uciMove += `=${promotedPiece}`;
        historyStr += ` (Promoted to ${promotedPiece})`;
      }

      this.userEnteredMoves.push(uciMove);
      this.moveHistory.push(historyStr);
      this.chessBoardView = this.chessBoard.chessBoardView;

      if (this.userEnteredMoves.length >= this.sequenceLength) {
        this.showHistoryModal = true;
      }
    } catch (e) {
      console.error("Illegal move:", e);
    }

    this.selectedSquare = null;
    this.pieceSafeSquares = [];
  }

  public resetSequence() {
    this.initializeSequenceBoard();
  }

  public confirmFinalPassword() {
    console.log("Password Created:", {
      position: this.fenInput,
      sequence: this.userEnteredMoves
    });
    this.router.navigate(['/']);
  }

  // ---------------- UTILS ----------------

  private isBoardEmpty(): boolean {
    return this.chessBoardView.every(row => row.every(cell => cell === null));
  }

  public isSquareDark(x: number, y: number): boolean {
    return (x + y) % 2 === 0;
  }

  public isSquareSelected(x: number, y: number): boolean {
    return this.selectedSquare?.x === x && this.selectedSquare?.y === y;
  }

  public isSquareSafe(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(s => s.x === x && s.y === y);
  }

  public getPieceImage(piece: FENChar | null): string {
    return piece ? this.pieceImagePaths[piece] : '';
  }
}
