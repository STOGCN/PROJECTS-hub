import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FENChar, pieceImagePaths } from '../../chess-logic/models';
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

  // Chess Password Board
  passwordBoard: (FENChar | null)[][] = [];
  selectedSquare: { x: number, y: number } | null = null;
  passwordDots = [true, true, true, false, false, false];
  isBurning = false;
  pieceImagePaths = pieceImagePaths;

  constructor() {
    this.initializePasswordBoard();
  }

  private fenConverter = new FENConverter();

  private initializePasswordBoard() {
    // Example FEN from user
    const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
    this.passwordBoard = this.fenConverter.convertFENToSimpleBoard(fen);
  }

  onSquareClick(x: number, y: number) {
    if (this.isBurning) return;

    const piece = this.passwordBoard[x][y];

    if (this.selectedSquare) {
      if (this.selectedSquare.x === 3 && this.selectedSquare.y === 0 && x === 7 && y === 0) {
        this.executeMove(this.selectedSquare.x, this.selectedSquare.y, x, y);
        this.triggerSuccess();
      } else {
        this.selectedSquare = null;
      }
    } else if (piece === FENChar.WhiteQueen) {
      this.selectedSquare = { x, y };
    }
  }

  private executeMove(prevX: number, prevY: number, newX: number, newY: number) {
    const piece = this.passwordBoard[prevX][prevY];
    this.passwordBoard[newX][newY] = piece;
    this.passwordBoard[prevX][prevY] = null;
    this.selectedSquare = null;
    this.passwordDots = [true, true, true, true, true, true];
  }

  private triggerSuccess() {
    this.isBurning = true;
    setTimeout(() => {
      console.log('Password Login Successful!');
      this.loginSuccess.emit();
    }, 2000);
  }

  getPieceImage(piece: FENChar | null): string {
    return piece ? this.pieceImagePaths[piece] : '';
  }

  isSquareDark(x: number, y: number): boolean {
    return (x + y) % 2 === 0;
  }

  onBack() {
    this.back.emit();
  }
}

