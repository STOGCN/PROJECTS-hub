import { Component, EventEmitter, Output } from '@angular/core';

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
  
  // Time limit
  timeValue: number = 30;
  timeUnit: 'MINUTES' | 'DAYS' | 'YEARS' = 'MINUTES';

  // Play Mode
  playMode: 'NONE' | 'MANUAL' | 'STOCKFISH' = 'MANUAL';

  // Stockfish Settings
  showAdvanced: boolean = false;
  depth: number = 10;
  movetime: number = 1000;
  skillLevel: number = 10;

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

  setTimeUnit(unit: 'MINUTES' | 'DAYS' | 'YEARS') {
    this.timeUnit = unit;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  decreaseTime() {
    if (this.timeValue > 0) this.timeValue--;
  }

  increaseTime() {
    this.timeValue++;
  }

  startGame() {
    // Collect all data and emit or call service
    console.log('Starting game with:', {
      gameName: this.gameName,
      coverImage: this.coverImage,
      importance: this.importance,
      goal: this.goal,
      timeLimit: `${this.timeValue} ${this.timeUnit}`,
      playMode: this.playMode,
      stockfishOptions: this.playMode === 'STOCKFISH' ? {
        depth: this.depth,
        movetime: this.movetime,
        skillLevel: this.skillLevel
      } : null
    });
    this.closeModal();
  }
}
