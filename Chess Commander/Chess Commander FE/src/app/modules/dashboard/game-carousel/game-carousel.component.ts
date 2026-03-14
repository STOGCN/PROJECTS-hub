import { Component } from '@angular/core';

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  timer: string;
  gameClock: string;
  gameNumber: string;
  imageUrl: string;
  isCritical: boolean;
  isLocked: boolean;
}

@Component({
  selector: 'app-game-carousel',
  templateUrl: './game-carousel.component.html',
  styleUrls: ['./game-carousel.component.css']
})
export class GameCarouselComponent {
  squares = Array(64).fill(0);
  activeIndex = 1;

  missions: Mission[] = [
    {
      id: '8411',
      title: 'LOST HERITAGE',
      subtitle: 'มรดกที่สาบสูญ',
      timer: ':04:12.822',
      gameClock: ':12:42.159',
      gameNumber: '8411',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBexjYCnlKD6w4xcoqyJKoJZuGCw7f0OrLQDi5LugwTX9zDfhYSy2AE9J6KHfgEgpDMwaKOxpN3EYPOoZFMtNrBZ1nv-RUC4pf_GoVijUevG9J8VTdSEjD5qRScoOB_hjbid7s0gmogvWyDLlBbyog0DYY5_jMIGgO58k45hlyOIKQvhN8r1OtBk0Ajo1EO1VAzXIKqlodtNHzuUWUqKsJU1j8xDRPNCiFzTq-_rB_SMgw5fNK8anVlDtYva2te8sGT5JTv5c8gqsY',
      isCritical: false,
      isLocked: true
    },
    {
      id: '8412',
      title: 'THE LAST FREEDOM',
      subtitle: 'อิสรภาพ สุดท้าย: อิสรภาพ',
      timer: ':59:42.159',
      gameClock: ':59:42.159',
      gameNumber: '8412',
      imageUrl: '',
      isCritical: true,
      isLocked: false
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
      isLocked: false
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
      isLocked: false
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
      isLocked: false
    }
  ];

  selectMission(index: number) {
    this.activeIndex = index;
  }

  getCardClass(index: number): string {
    const diff = index - this.activeIndex;
    
    if (diff === 0) return 'active-card';
    if (diff === -1) return 'side-card left-card';
    if (diff === 1) return 'side-card right-card';
    
    // Handle wrap-around or further distances
    if (diff < -1) return 'side-card hidden-left';
    if (diff > 1) return 'side-card hidden-right';
    
    return 'side-card';
  }
}
