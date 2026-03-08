import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  onEnterBet() {
    this.enterBet.emit(this.playerName);
    console.log('Entering bet with player:', this.playerName);
  }

  onBack() {
    this.back.emit();
  }

  onNewPlayer() {
    this.router.navigate(['/register']);
  }
}

