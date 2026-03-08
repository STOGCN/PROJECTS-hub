import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  profile = {
    fullName: '',
    nickname: '',
    age: null,
    gender: '',
    goals: '',
    answers: {
      question1: '',
      question2: '',
      question3: '',
      question4: '',
      question5: ''
    }
  };

  constructor(private router: Router) { }

  onSubmit() {
    console.log('Registration submitted:', this.profile);
    // Future: Handle registration logic
    this.router.navigate(['/register-password']);
  }

  onBack() {
    this.router.navigate(['/']);
  }
}
