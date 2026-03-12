import { Component, OnInit, OnDestroy } from '@angular/core';
import { LifeTimerService } from './life-timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-life-timer',
  templateUrl: './life-timer.component.html',
  styleUrls: ['./life-timer.component.css']
})
export class LifeTimerComponent implements OnInit, OnDestroy {
  timeYMD: string = '';
  timeMain: string = '';
  timeMs: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(private lifeTimerService: LifeTimerService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.lifeTimerService.timeYMD$.subscribe(val => this.timeYMD = val)
    );
    this.subscriptions.add(
      this.lifeTimerService.timeMain$.subscribe(val => this.timeMain = val)
    );
    this.subscriptions.add(
      this.lifeTimerService.timeMs$.subscribe(val => this.timeMs = val)
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
