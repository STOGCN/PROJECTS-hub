import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutographComponent } from '../autograph-longin/autograph.component';
import { PasswordLoginComponent } from '../password-login/password-login.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, AutographComponent, PasswordLoginComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    logoTitle = 'Chess Commander';
    playerName = '';

    // States: 'landing', 'form', 'password', 'success'
    loginState: 'landing' | 'form' | 'password' | 'success' = 'landing';

    constructor() { }

    onLogin() {
        this.loginState = 'form';
    }

    handleNext(name: string) {
        this.playerName = name;
        this.loginState = 'password';
    }

    handleBack() {
        if (this.loginState === 'form') {
            this.loginState = 'landing';
        } else if (this.loginState === 'password') {
            this.loginState = 'form';
        }
    }

    handleSuccess() {
        this.loginState = 'success';
        console.log('Flow Complete: Success!');
    }
}
