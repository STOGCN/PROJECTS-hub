import { Component, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { Mission, MissionService } from '../mission.service';
import { FENChar, pieceImagePaths } from 'src/app/chess-logic/models';

@Component({
  selector: 'app-game-carousel',
  templateUrl: './game-carousel.component.html',
  styleUrls: ['./game-carousel.component.css']
})
export class GameCarouselComponent implements OnInit, OnDestroy {
  @Output() backgroundChange = new EventEmitter<string>();
  @Output() activeCardStatus = new EventEmitter<{ isLastCard: boolean }>();
  @Output() activeMissionChange = new EventEmitter<Mission>();

  squares = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return (row + col) % 2 === 0 ? 'light' : 'dark';
  });
  activeIndex = 0;
  missions: Mission[] = [];
  private sub: Subscription = new Subscription();

  // Mock boards
  parseFen(fen: string): {char: string, src: string}[] {
    const pieces: {char: string, src: string}[] = [];
    const rows = fen.split(' ')[0].split('/');

    for (const row of rows) {
      for (const char of row) {
        if (!isNaN(parseInt(char))) {
          const emptyCount = parseInt(char);
          for (let i = 0; i < emptyCount; i++) {
            pieces.push({ char: '', src: '' });
          }
        } else {
          pieces.push({
            char: char,
            src: pieceImagePaths[char as FENChar] || ''
          });
        }
      }
    }
    return pieces;
  }

  getBoard(fen?: string): {char: string, src: string}[] {
    if (fen) {
      return this.parseFen(fen);
    }
    // Default starting
    return this.parseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  }

  // Swipe State
  private startX = 0;
  private isDragging = false;

  constructor(private missionService: MissionService) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    // Prevent carousel movement if user is typing in an input field
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.selectMission(this.activeIndex - 1);
    }
  }

  next() {
    if (this.activeIndex < this.missions.length - 1) {
      this.selectMission(this.activeIndex + 1);
    }
  }

  onPointerDown(event: PointerEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    } catch(e) {}
  }

  onPointerUp(event: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch(e) {}

    const diff = event.clientX - this.startX;
    if (diff > 50) {
      this.prev(); // Dragged right -> show previous card
    } else if (diff < -50) {
      this.next(); // Dragged left -> show next card
    }
  }

  ngOnInit() {
    this.sub.add(
      this.missionService.missions$.subscribe(missions => {
        this.missions = missions;
        
        let targetIndex = 0;
        const savedId = this.missionService.activeMissionId$.value;
        if (savedId) {
          const found = this.missions.findIndex(m => m.id === savedId);
          if (found !== -1) targetIndex = found;
        }

        this.activeIndex = targetIndex;
        
        // Ensure activeIndex is valid if missions array changes
        if (this.activeIndex >= this.missions.length && this.missions.length > 0) {
           this.activeIndex = this.missions.length - 1;
        }

        if (this.missions.length > 0) {
          setTimeout(() => {
            this.emitBackground();
            this.emitActiveStatus();
            this.activeMissionChange.emit(this.missions[this.activeIndex]);
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  selectMission(index: number) {
    this.activeIndex = index;
    const mission = this.missions[this.activeIndex];
    if (mission) {
      this.missionService.activeMissionId$.next(mission.id);
    }
    
    this.emitBackground();
    this.emitActiveStatus();
    this.activeMissionChange.emit(mission);
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

  private emitBackground() {
    const activeMission = this.missions[this.activeIndex];
    this.backgroundChange.emit(activeMission.imageUrl);
  }

  private emitActiveStatus() {
    const isLastCard = this.activeIndex === this.missions.length - 1;
    this.activeCardStatus.emit({ isLastCard });
  }
}
