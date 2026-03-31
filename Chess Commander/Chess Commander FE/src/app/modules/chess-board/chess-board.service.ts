import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FENConverter } from 'src/app/chess-logic/FENConverter';

@Injectable({
  providedIn: 'root'
})
export class ChessBoardService {
  public chessBoardState$ = new BehaviorSubject<string>(FENConverter.initalPosition);
  public gameTimeMs$ = new BehaviorSubject<number>(300000); // Default 5 mins
}