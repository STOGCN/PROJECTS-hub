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
    private footerHideTimeout: any;

    openNewGameModal() {
        this.isNewGameModalOpen = true;
    }

    closeNewGameModal() {
        this.isNewGameModalOpen = false;
    }

    onCarouselHover(isHovered: boolean) {
        if (isHovered) {
            clearTimeout(this.footerHideTimeout);
            this.showFooterActions = true;
        } else {
            this.footerHideTimeout = setTimeout(() => {
                this.showFooterActions = false;
            }, 300);
        }
    }

    onFooterHover(isHovered: boolean) {
        if (isHovered) {
            clearTimeout(this.footerHideTimeout);
            this.showFooterActions = true;
        } else {
            this.footerHideTimeout = setTimeout(() => {
                this.showFooterActions = false;
            }, 300);
        }
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
