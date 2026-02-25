import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FENChar, Color, pieceImagePaths } from '../../chess-logic/models';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    logoTitle = 'Chess Commander';
    playerName = '';

    // States: 'landing', 'form', 'password', 'success'
    loginState: 'landing' | 'form' | 'password' | 'success' = 'landing';

    // Chess Password Board
    passwordBoard: (FENChar | null)[][] = [];
    selectedSquare: { x: number, y: number } | null = null;
    passwordDots = [true, true, true, false, false, false]; // Visual indicator from mock-up
    isBurning = false;

    pieceImagePaths = pieceImagePaths;

    constructor() {
        this.initializePasswordBoard();
    }

    private initializePasswordBoard() {
        // FEN: 8/1N2N3/2r5/3qp2R/QP2kp1K/5R2/6B1/6B1
        this.passwordBoard = [
            [null, null, null, null, null, null, FENChar.WhiteBishop, null], // Rank 1
            [null, null, null, null, null, null, FENChar.WhiteBishop, null], // Rank 2
            [null, null, null, null, null, FENChar.WhiteRook, null, null],   // Rank 3
            [FENChar.WhiteQueen, FENChar.WhitePawn, null, null, FENChar.BlackKing, FENChar.BlackPawn, null, FENChar.WhiteKing], // Rank 4
            [null, null, null, FENChar.BlackQueen, FENChar.BlackPawn, null, null, FENChar.WhiteRook], // Rank 5
            [null, null, FENChar.BlackRook, null, null, null, null, null],   // Rank 6
            [null, FENChar.WhiteKnight, null, null, FENChar.WhiteKnight, null, null, null], // Rank 7
            [null, null, null, null, null, null, null, null],               // Rank 8
        ];
    }

    onLogin() {
        this.loginState = 'form';
    }

    onBack() {
        if (this.loginState === 'form') this.loginState = 'landing';
        else if (this.loginState === 'password') this.loginState = 'form';
    }

    onEnterBet() {
        this.loginState = 'password';
    }

    onSquareClick(x: number, y: number) {
        if (this.loginState !== 'password' || this.isBurning) return;

        const piece = this.passwordBoard[x][y];

        if (this.selectedSquare) {
            // Check for Qa8 move (White Queen at (3,0) to (7,0))
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
        // Update dots to show completion
        this.passwordDots = [true, true, true, true, true, true];
    }

    private triggerSuccess() {
        this.isBurning = true;
        setTimeout(() => {
            this.loginState = 'success';
            console.log('Login Successful!');
            // Navigation would happen here
        }, 2000);
    }

    getPieceImage(piece: FENChar | null): string {
        return piece ? this.pieceImagePaths[piece] : '';
    }

    isSquareDark(x: number, y: number): boolean {
        return (x + y) % 2 === 0;
    }
}
