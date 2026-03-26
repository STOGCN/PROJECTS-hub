import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    currentBgUrl: string = '';
    isDynamicBg: boolean = true;
    isNewGameModalOpen: boolean = false;

    showFooterActions: boolean = false;
    private footerShowTimeout: any;

    openNewGameModal() {
        this.isNewGameModalOpen = true;
    }

    closeNewGameModal() {
        this.isNewGameModalOpen = false;
    }

    onActiveCardStatus(status: { isLastCard: boolean }) {
        this.showFooterActions = false; // Hide immediately
        clearTimeout(this.footerShowTimeout);

        this.footerShowTimeout = setTimeout(() => {
            this.showFooterActions = true;
        }, 1000);
    }

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
