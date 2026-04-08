import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { CheckState, Color, Coords, FENChar, GameHistory, LastMove, MoveList, MoveType, SafeSquares, pieceImagePaths } from 'src/app/chess-logic/models';
import { SelectedSquare } from './models';
import { ChessBoardService } from './chess-board.service';
import { Subscription, filter, fromEvent, tap } from 'rxjs';
import { FENConverter } from 'src/app/chess-logic/FENConverter';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit, OnDestroy {
  public pieceImagePaths = pieceImagePaths;

  protected chessBoard: ChessBoard;
  public chessBoardView: (FENChar | null)[][];
  public get playerColor(): Color { return this.chessBoard.playerColor; };
  public get safeSquares(): SafeSquares { return this.chessBoard.safeSquares; };
  public get gameOverMessage(): string | undefined { return this.chessBoard.gameOverMessage; };

  private selectedSquare: SelectedSquare = { piece: null };
  private pieceSafeSquares: Coords[] = [];
  private lastMove: LastMove | undefined;
  private checkState: CheckState;

  public get moveList(): MoveList { return this.chessBoard.moveList; };
  public get gameHistory(): GameHistory { return this.chessBoard.gameHistory; };
  public gameHistoryPointer: number = 0;

  // promotion properties
  public isPromotionActive: boolean = false;
  private promotionCoords: Coords | null = null;
  private promotedPiece: FENChar | null = null;
  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White ?
      [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] :
      [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen];
  }

  public flipMode: boolean = false;
  private subscriptions$ = new Subscription();
  
  // Timer Properties
  public whiteTime: number = 0;
  public blackTime: number = 0;
  private timerInterval: any;
  public Color = Color; // Expose Color enum to template

  constructor(protected chessBoardService: ChessBoardService) {
    const initialState = this.chessBoardService.chessBoardState$.value;
    this.chessBoard = new ChessBoard(initialState);
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.lastMove = this.chessBoard.lastMove;
    this.checkState = this.chessBoard.checkState;
  }

  public ngOnInit(): void {
    const keyEventSubscription$: Subscription = fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(
        filter(event => event.key === "ArrowRight" || event.key === "ArrowLeft"),
        tap(event => {
          switch (event.key) {
            case "ArrowRight":
              if (this.gameHistoryPointer === this.gameHistory.length - 1) return;
              this.gameHistoryPointer++;
              break;
            case "ArrowLeft":
              if (this.gameHistoryPointer === 0) return;
              this.gameHistoryPointer--;
              break;
            default:
              break;
          }

          this.showPreviousPosition(this.gameHistoryPointer);
        })
      )
      .subscribe();

    this.subscriptions$.add(keyEventSubscription$);

    const timeSubscription = this.chessBoardService.gameTimeMs$.subscribe(time => {
      this.whiteTime = time;
      this.blackTime = time;
      this.startTimer();
    });
    this.subscriptions$.add(timeSubscription);
  }

  public ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.subscriptions$.unsubscribe();
    this.chessBoardService.chessBoardState$.next(FENConverter.initalPosition);
  }

  public flipBoard(): void {
    this.flipMode = !this.flipMode;
  }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) return false;
    const { prevX, prevY, currX, currY } = this.lastMove;
    return x === prevX && y === prevY || x === currX && y === currY;
  }

  public isSquareChecked(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  public isSquarePromotionSquare(x: number, y: number): boolean {
    if (!this.promotionCoords) return false;
    return this.promotionCoords.x === x && this.promotionCoords.y === y;
  }

  private unmarkingPreviouslySlectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];

    if (this.isPromotionActive) {
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }

  private selectingPiece(x: number, y: number): void {
    if (this.gameOverMessage !== undefined) return;
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmarkingPreviouslySlectedAndSafeSquares();
    if (isSameSquareClicked) return;

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }

  private placingPiece(newX: number, newY: number): void {
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    // pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawnOnlastRank: boolean = isPawnSelected && (newX === 7 || newX === 0);
    const shouldOpenPromotionDialog: boolean = !this.isPromotionActive && isPawnOnlastRank;

    if (shouldOpenPromotionDialog) {
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = { x: newX, y: newY };
      // because now we wait for player to choose promoted piece
      return;
    }

    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  protected updateBoard(prevX: number, prevY: number, newX: number, newY: number, promotedPiece: FENChar | null): void {
    this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece);
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.markLastMoveAndCheckState(this.chessBoard.lastMove, this.chessBoard.checkState);
    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);
    this.gameHistoryPointer++;
  }

  public promotePiece(piece: FENChar): void {
    if (!this.promotionCoords || !this.selectedSquare.piece) return;
    this.promotedPiece = piece;
    const { x: newX, y: newY } = this.promotionCoords;
    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  public closePawnPromotionDialog(): void {
    this.unmarkingPreviouslySlectedAndSafeSquares();
  }

  private markLastMoveAndCheckState(lastMove: LastMove | undefined, checkState: CheckState): void {
    this.lastMove = lastMove;
    this.checkState = checkState;

    if (this.lastMove)
      this.moveSound(this.lastMove.moveType);
    else
      this.moveSound(new Set<MoveType>([MoveType.BasicMove]));
  }
  public move(x: number, y: number): void {
    this.selectingPiece(x, y);
    this.placingPiece(x, y);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor === Color.Black ||
      !isWhitePieceSelected && this.playerColor === Color.White;
  }

  public showPreviousPosition(moveIndex: number): void {
    const { board, checkState, lastMove } = this.gameHistory[moveIndex];
    this.chessBoardView = board;
    this.markLastMoveAndCheckState(lastMove, checkState);
    this.gameHistoryPointer = moveIndex;
  }

  private moveSound(moveType: Set<MoveType>): void {
    const moveSound = new Audio("assets/sound/move.mp3");

    if (moveType.has(MoveType.Promotion)) moveSound.src = "assets/sound/promote.mp3";
    else if (moveType.has(MoveType.Capture)) moveSound.src = "assets/sound/capture.mp3";
    else if (moveType.has(MoveType.Castling)) moveSound.src = "assets/sound/castling.mp3";

    if (moveType.has(MoveType.CheckMate)) moveSound.src = "assets/sound/checkmate.mp3";
    else if (moveType.has(MoveType.Check)) moveSound.src = "assets/sound/check.mp3";

    moveSound.play();
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.whiteTime === 0 && this.blackTime === 0) return;

    this.timerInterval = setInterval(() => {
      if (this.gameOverMessage) {
        clearInterval(this.timerInterval);
        return;
      }
      
      if (this.playerColor === Color.White) {
        this.whiteTime = Math.max(0, this.whiteTime - 100);
        if (this.whiteTime === 0) clearInterval(this.timerInterval);
      } else {
        this.blackTime = Math.max(0, this.blackTime - 100);
        if (this.blackTime === 0) clearInterval(this.timerInterval);
      }
    }, 100);
  }

  public formatTime(ms: number): string {
    if (ms <= 0) return "00:00.0";
    
    const totalDays = Math.floor(ms / 86400000);
    
    if (totalDays > 30) {
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
    }
    
    if (totalDays >= 1) {
      return `${totalDays} days left`;
    }
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (hours === 0 && m === 0 && s < 60) {
      const tenths = Math.floor((ms % 1000) / 100);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
    }

    if (hours > 0) {
       return `${hours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  public isTimerActive(color: Color): boolean {
    return this.playerColor === color && this.gameOverMessage === undefined;
  }

  public isLowTime(timeMs: number): boolean {
    return timeMs < 60000 && timeMs > 0; // Red if less than 60s
  }
}
