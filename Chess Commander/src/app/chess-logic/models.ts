import { Piece } from "./pieces/piece";

export enum Color {
    White,
    Black
}

export type Coords = {
    x: number;
    y: number;
}

export enum FENChar {
    WhitePawn = "P",
    WhiteKnight = "N",
    WhiteBishop = "B",
    WhiteRook = "R",
    WhiteQueen = "Q",
    WhiteKing = "K",
    BlackPawn = "p",
    BlackKnight = "n",
    BlackBishop = "b",
    BlackRook = "r",
    BlackQueen = "q",
    BlackKing = "k"
}

// export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
//     [FENChar.WhitePawn]: "assets/pieces/white pawn.svg",
//     [FENChar.WhiteKnight]: "assets/pieces/white knight.svg",
//     [FENChar.WhiteBishop]: "assets/pieces/white bishop.svg",
//     [FENChar.WhiteRook]: "assets/pieces/white rook.svg",
//     [FENChar.WhiteQueen]: "assets/pieces/white queen.svg",
//     [FENChar.WhiteKing]: "assets/pieces/white king.svg",
//     [FENChar.BlackPawn]: "assets/pieces/black pawn.svg",
//     [FENChar.BlackKnight]: "assets/pieces/black knight.svg",
//     [FENChar.BlackBishop]: "assets/pieces/black bishop.svg",
//     [FENChar.BlackRook]: "assets/pieces/black rook.svg",
//     [FENChar.BlackQueen]: "assets/pieces/black queen.svg",
//     [FENChar.BlackKing]: "assets/pieces/black king.svg"
// }
export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
    [FENChar.WhitePawn]: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/120px-Chess_plt45.svg.png",
    [FENChar.WhiteKnight]: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/120px-Chess_nlt45.svg.png",
    [FENChar.WhiteBishop]: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/120px-Chess_blt45.svg.png",
    [FENChar.WhiteRook]: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/120px-Chess_rlt45.svg.png",
    [FENChar.WhiteQueen]: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chess_qlt45.svg/120px-Chess_qlt45.svg.png",
    [FENChar.WhiteKing]: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/120px-Chess_klt45.svg.png",
    [FENChar.BlackPawn]: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/120px-Chess_pdt45.svg.png",
    [FENChar.BlackKnight]: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/120px-Chess_ndt45.svg.png",
    [FENChar.BlackBishop]: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/120px-Chess_bdt45.svg.png",
    [FENChar.BlackRook]: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/120px-Chess_rdt45.svg.png",
    [FENChar.BlackQueen]: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chess_qdt45.svg/120px-Chess_qdt45.svg.png",
    [FENChar.BlackKing]: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/120px-Chess_kdt45.svg.png"
}
export type SafeSquares = Map<string, Coords[]>;

export enum MoveType {
    Capture,
    Castling,
    Promotion,
    Check,
    CheckMate,
    BasicMove
}

export type LastMove = {
    piece: Piece;
    prevX: number;
    prevY: number;
    currX: number;
    currY: number;
    moveType: Set<MoveType>;
}

type KingChecked = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotChecked = {
    isInCheck: false;
}

export type CheckState = KingChecked | KingNotChecked;

export type MoveList = ([string, string?])[];

export type GameHistory = {
    lastMove: LastMove | undefined;
    checkState: CheckState;
    board: (FENChar | null)[][];
}[];