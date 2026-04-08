import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  timer: string;
  gameClock: string;
  gameNumber: string;
  imageUrl: string;
  isCritical: boolean;
  isLocked: boolean;
  importance?: 'CASUAL' | 'SERIOUS' | 'CRITICAL';
  totalMs?: number;
  playMode?: string;
  fen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private initialMissions: Mission[] = [
    {
      id: '8411',
      title: 'LOST HERITAGE',
      subtitle: 'มรดกที่สาบสูญ',
      timer: ':04:12.822',
      gameClock: ':12:42.159',
      gameNumber: '8411',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBexjYCnlKD6w4xcoqyJKoJZuGCw7f0OrLQDi5LugwTX9zDfhYSy2AE9J6KHfgEgpDMwaKOxpN3EYPOoZFMtNrBZ1nv-RUC4pf_GoVijUevG9J8VTdSEjD5qRScoOB_hjbid7s0gmogvWyDLlBbyog0DYY5_jMIGgO58k45hlyOIKQvhN8r1OtBk0Ajo1EO1VAzXIKqlodtNHzuUWUqKsJU1j8xDRPNCiFzTq-_rB_SMgw5fNK8anVlDtYva2te8sGT5JTv5c8gqsY',
      isCritical: false,
      importance: 'CASUAL',
      isLocked: true,
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R'
    },
    {
      id: '8412',
      title: 'THE LAST FREEDOM',
      subtitle: 'อิสรภาพ สุดท้าย: อิสรภาพ',
      timer: ':59:42.159',
      gameClock: ':59:42.159',
      gameNumber: '8412',
      imageUrl: 'assets/pieces/ChatGPT Image Mar 12, 2026, 03_25_47 PM.png',
      isCritical: true,
      isLocked: false,
      fen: '8/1k6/p6p/8/1K6/P7/8/8'
    },
    {
      id: '8413',
      title: 'SECRET NETWORK',
      subtitle: 'เครือข่ายลับ',
      timer: ':22:05.118',
      gameClock: ':08:15.332',
      gameNumber: '8413',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDljhuM9rR-F4KH2ZOjCGBIxtJotyrgWknNxOuFSon-oteoI3bbidkipNYMY6UrwozYR61-Bh6mEfNE1OsJw0D7Fq-ppCrCo6ltngocaibn0mGOa-f89kxo0HD6bMM-zRYVvhlPyFgXtBNzy7h6IH8bDkcUQPIK83qHOBYo-rqtzbxl3W47jJ4_KKty6H2gMqyMHXQ0mdHn_adrcsO_4cUeTUosmni743TfPp9zz7l1jU-R0BqwUk-SJelUVYZXAVPKKSwctCCN00E',
      isCritical: false,
      isLocked: false,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    },
    {
      id: '8414',
      title: 'QUANTUM BREACH',
      subtitle: 'การเจาะระบบควอนตัม',
      timer: ':15:30.000',
      gameClock: ':15:30.000',
      gameNumber: '8414',
      imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070&auto=format&fit=crop',
      isCritical: true,
      isLocked: false,
      fen: 'r1b2rk1/ppQ2ppp/2n1pn2/8/2P1q3/8/PP2BPPP/RNB2RK1'
    },
    {
      id: '8415',
      title: 'SILENT SIGNAL',
      subtitle: 'สัญญาณเงียบ',
      timer: ':02:45.999',
      gameClock: ':02:45.999',
      gameNumber: '8415',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
      isCritical: false,
      isLocked: false,
      fen: '6k1/5pp1/7p/8/8/8/pr3PPP/R5K1'
    }
  ];

  public missions$ = new BehaviorSubject<Mission[]>(this.initialMissions);
  public activeMissionId$ = new BehaviorSubject<string | null>(null);

  addMission(mission: Mission) {
    const currentList = this.missions$.value;
    // Add to the front of the list so it appears first in the carousel
    this.missions$.next([mission, ...currentList]);
  }
}
