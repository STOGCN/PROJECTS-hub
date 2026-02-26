import { columns } from "../modules/chess-board/models";
import { Color, FENChar, LastMove } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class FENConverter {
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public convertBoardToFEN(
        board: (Piece | null)[][],
        playerColor: Color,
        lastMove: LastMove | undefined,
        fiftyMoveRuleCounter: number,
        numberOfFullMoves: number
    ): string {
        let FEN: string = "";

        for (let i = 7; i >= 0; i--) {
            let FENRow: string = "";
            let consecutiveEmptySquaresCounter = 0;

            for (const piece of board[i]) {
                if (!piece) {
                    consecutiveEmptySquaresCounter++;
                    continue;
                }

                if (consecutiveEmptySquaresCounter !== 0)
                    FENRow += String(consecutiveEmptySquaresCounter);

                consecutiveEmptySquaresCounter = 0;
                FENRow += piece.FENChar;
            }

            if (consecutiveEmptySquaresCounter !== 0)
                FENRow += String(consecutiveEmptySquaresCounter);

            FEN += (i === 0) ? FENRow : FENRow + "/";
        }

        const player: string = playerColor === Color.White ? "w" : "b";
        FEN += " " + player;
        FEN += " " + this.castlingAvailability(board);
        FEN += " " + this.enPassantPosibility(lastMove, playerColor);
        FEN += " " + fiftyMoveRuleCounter * 2;
        FEN += " " + numberOfFullMoves;
        return FEN;
    }
    ////////////////////////////////////////////////////////////////////////////////////

    public convertFENToBoard(FEN: string): (Piece | null)[][] {
        const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
        const [piecesPart] = FEN.split(" ");
        const rows = piecesPart.split("/");

        for (let i = 0; i < 8; i++) {
            const row = rows[i];
            let colIndex = 0;

            for (const char of row) {
                if (isNaN(Number(char))) {
                    const fenChar = char as FENChar;
                    board[7 - i][colIndex] = this.createPiece(fenChar);
                    colIndex++;
                } else {
                    colIndex += Number(char);
                }
            }
        }

        return board;
    }

    public convertFENToSimpleBoard(FEN: string): (FENChar | null)[][] {
        const board: (FENChar | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
        const [piecesPart] = FEN.split(" ");
        const rows = piecesPart.split("/");

        for (let i = 0; i < 8; i++) {
            const row = rows[i];
            let colIndex = 0;

            for (const char of row) {
                if (isNaN(Number(char))) {
                    board[7 - i][colIndex] = char as FENChar;
                    colIndex++;
                } else {
                    colIndex += Number(char);
                }
            }
        }

        return board;
    }

    private createPiece(fenChar: FENChar): Piece {
        const color = fenChar === fenChar.toUpperCase() ? Color.White : Color.Black;

        switch (fenChar.toLowerCase()) {
            case "p": return new Pawn(color);
            case "n": return new Knight(color);
            case "b": return new Bishop(color);
            case "r": return new Rook(color);
            case "q": return new Queen(color);
            case "k": return new King(color);
            default: throw new Error(`Invalid FEN character: ${fenChar}`);
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private castlingAvailability(board: (Piece | null)[][]): string {
        const castlingPossibilities = (color: Color): string => {
            let castlingAvailability: string = "";

            const kingPositionX: number = color === Color.White ? 0 : 7;
            const king: Piece | null = board[kingPositionX][4];

            if (king instanceof King && !king.hasMoved) {
                const rookPositionX: number = kingPositionX;
                const kingSideRook = board[rookPositionX][7];
                const queenSideRook = board[rookPositionX][0];

                if (kingSideRook instanceof Rook && !kingSideRook.hasMoved)
                    castlingAvailability += "k";

                if (queenSideRook instanceof Rook && !queenSideRook.hasMoved)
                    castlingAvailability += "q";

                if (color === Color.White)
                    castlingAvailability = castlingAvailability.toUpperCase();
            }
            return castlingAvailability;
        }

        const castlingAvailability: string = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
        return castlingAvailability !== "" ? castlingAvailability : "-";
    }

    private enPassantPosibility(lastMove: LastMove | undefined, color: Color): string {
        if (!lastMove) return "-";
        const { piece, currX: newX, prevX, prevY } = lastMove;

        if (piece instanceof Pawn && Math.abs(newX - prevX) === 2) {
            const row: number = color === Color.White ? 6 : 3;
            return columns[prevY] + String(row);
        }
        return "-";
    }
}