import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { StockfishService } from '../../../computer-mode/stockfish.service';
import { LifeTimerService } from '../../life-timer/life-timer.service';
import { Color } from 'src/app/chess-logic/models';

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent {
  @Output() close = new EventEmitter<void>();

  // Form State
  gameName: string = '';
  coverImage: string | null = null;
  importance: 'CASUAL' | 'SERIOUS' | 'CRITICAL' = 'SERIOUS';
  goal: string = '';
  
  // Time Settings
  timeValues: Record<'MINUTES' | 'DAYS' | 'YEARS', number> = {
    MINUTES: 5,
    DAYS:   0,
    YEARS: 0
  };
  timeUnit: 'MINUTES' | 'DAYS' | 'YEARS' = 'MINUTES';

  // Play Mode
  playMode: 'NONE' | 'MANUAL' | 'STOCKFISH' = 'MANUAL';

  // Stockfish Settings
  showAdvanced: boolean = false;
  showTutorial: boolean = false;
  playerColor: 'white' | 'black' = 'white';
  depth: number = 15;
  movetime: number = 1000;
  skillLevel: number = 10;

  constructor(
    private router: Router,
    private stockfishService: StockfishService,
    private lifeTimerService: LifeTimerService
  ) {}

  get totalMs(): number {
    return (this.timeValues['MINUTES'] || 0) * 60000 
         + (this.timeValues['DAYS'] || 0) * 86400000 
         + (this.timeValues['YEARS'] || 0) * 31536000000;
  }

  get timePreview(): string {
    const ms = this.totalMs;
    if (ms === 0) return '0 Y / 0 M / 0 D - 0:00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const totalHours = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const totalDays = Math.floor(totalHours / 24);
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    return `${years} Y / ${months} M / ${days} D - ${totalHours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Handlers
  closeModal() {
    this.close.emit();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // add visual cue class if needed
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleImageUpload(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleImageUpload(input.files[0]);
    }
  }

  private handleImageUpload(file: File) {
    if (file.type.match(/image\/*/) == null) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.coverImage = reader.result as string;
    }
  }

  setImportance(level: 'CASUAL' | 'SERIOUS' | 'CRITICAL') {
    this.importance = level;
  }

  setPlayMode(mode: 'NONE' | 'MANUAL' | 'STOCKFISH') {
    this.playMode = mode;
  }

  setPlayerColor(color: 'white' | 'black') {
    this.playerColor = color;
  }

  setTimeUnit(unit: 'MINUTES' | 'DAYS' | 'YEARS') {
    this.timeUnit = unit;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  toggleTutorial(event: Event) {
    event.stopPropagation();
    this.showTutorial = !this.showTutorial;
    if (this.showTutorial) {
      this.showAdvanced = true; // Auto-expand settings if tutorial is opened
    }
  }

  decreaseTime() {
    if (this.timeValues[this.timeUnit] > 0) this.timeValues[this.timeUnit]--;
  }

  increaseTime() {
    if (!this.timeValues[this.timeUnit]) this.timeValues[this.timeUnit] = 0;
    this.timeValues[this.timeUnit]++;
  }

  startGame() {
    this.lifeTimerService.setTime(this.totalMs);

    this.closeModal();
    
    if (this.playMode === 'MANUAL' || this.playMode === 'NONE') {
      this.router.navigate(['against-friend']);
    } else if (this.playMode === 'STOCKFISH') {
      // Setup stockfish engine configs
      this.stockfishService.computerConfiguration$.next({
        color: this.playerColor === 'white' ? Color.Black : Color.White, // If player is white, AI is Black
        level: 3, // Fallback default
        depth: this.depth // User's customized depth selection overrides standard level
      });
      this.router.navigate(['against-computer']);
    }
  }
}
