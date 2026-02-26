import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autograph-longin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autograph.component.html',
  styleUrls: ['./autograph.component.css']
})
export class AutographComponent {
  @Output() enterBet = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  logoTitle = 'Chess Commander';
  playerName = '';

  onEnterBet() {
    this.enterBet.emit(this.playerName);
    console.log('Entering bet with player:', this.playerName);
  }

  onBack() {
    this.back.emit();
  }
}

