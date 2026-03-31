import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Mission, MissionService } from '../mission.service';

@Component({
  selector: 'app-game-carousel',
  templateUrl: './game-carousel.component.html',
  styleUrls: ['./game-carousel.component.css']
})
export class GameCarouselComponent implements OnInit, OnDestroy {
  @Output() backgroundChange = new EventEmitter<string>();
  @Output() activeCardStatus = new EventEmitter<{ isLastCard: boolean }>();
  @Output() activeMissionChange = new EventEmitter<Mission>();

  squares = Array(64).fill(0);
  activeIndex = 0;
  missions: Mission[] = [];
  private sub: Subscription = new Subscription();

  constructor(private missionService: MissionService) {}

  ngOnInit() {
    this.sub.add(
      this.missionService.missions$.subscribe(missions => {
        this.missions = missions;
        
        let targetIndex = 0;
        const savedId = this.missionService.activeMissionId$.value;
        if (savedId) {
          const found = this.missions.findIndex(m => m.id === savedId);
          if (found !== -1) targetIndex = found;
        }

        this.activeIndex = targetIndex;
        
        // Ensure activeIndex is valid if missions array changes
        if (this.activeIndex >= this.missions.length && this.missions.length > 0) {
           this.activeIndex = this.missions.length - 1;
        }

        if (this.missions.length > 0) {
          setTimeout(() => {
            this.emitBackground();
            this.emitActiveStatus();
            this.activeMissionChange.emit(this.missions[this.activeIndex]);
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  selectMission(index: number) {
    this.activeIndex = index;
    const mission = this.missions[this.activeIndex];
    if (mission) {
      this.missionService.activeMissionId$.next(mission.id);
    }
    
    this.emitBackground();
    this.emitActiveStatus();
    this.activeMissionChange.emit(mission);
  }

  getCardClass(index: number): string {
    const diff = index - this.activeIndex;

    if (diff === 0) return 'active-card';
    if (diff === -1) return 'side-card left-card';
    if (diff === 1) return 'side-card right-card';

    // Handle wrap-around or further distances
    if (diff < -1) return 'side-card hidden-left';
    if (diff > 1) return 'side-card hidden-right';

    return 'side-card';
  }

  private emitBackground() {
    const activeMission = this.missions[this.activeIndex];
    this.backgroundChange.emit(activeMission.imageUrl);
  }

  private emitActiveStatus() {
    const isLastCard = this.activeIndex === this.missions.length - 1;
    this.activeCardStatus.emit({ isLastCard });
  }
}
