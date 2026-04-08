import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Mission } from './mission.service';
import { ChessBoardService } from '../chess-board/chess-board.service';

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
    selectedMission: Mission | null = null;

    constructor(
        private router: Router,
        private chessBoardService: ChessBoardService
    ) {}

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

    onActiveMissionChange(mission: Mission) {
        this.selectedMission = mission;
    }

    onPlayGame() {
        if (!this.selectedMission) return;

        let ms = this.selectedMission.totalMs;
        if (ms === undefined) {
           ms = 300000; // Mock fallback 5 mins
        }
        
        this.chessBoardService.gameTimeMs$.next(ms);
        
        if (this.selectedMission.fen) {
            this.chessBoardService.chessBoardState$.next(this.selectedMission.fen);
        } else {
            // Provide default if empty
            this.chessBoardService.chessBoardState$.next('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }

        let route = '/against-computer';
        if (this.selectedMission.playMode === 'MANUAL') {
            route = '/against-friend';
        }
        
        this.router.navigate([route]);
    }
}
