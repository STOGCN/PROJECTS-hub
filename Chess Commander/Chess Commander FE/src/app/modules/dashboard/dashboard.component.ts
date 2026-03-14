import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    currentBgUrl: string = '';
    isDynamicBg: boolean = true;

    onBackgroundChange(url: string) {
        this.currentBgUrl = url;
    }

    toggleDynamicBg() {
        this.isDynamicBg = !this.isDynamicBg;
    }

    get dynamicBgStyle(): string {
        if (!this.currentBgUrl) return '';
        return `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${this.currentBgUrl}')`;
    }
}
