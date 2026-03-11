import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-life-timer',
  templateUrl: './life-timer.component.html',
  styleUrls: ['./life-timer.component.css']
})
export class LifeTimerComponent implements OnInit, OnDestroy {
  // Start time: 83219:59:59.999
  private totalMs = (83219 * 3600000) + (59 * 60000) + (59 * 1000) + 999;
  private intervalId: any;

  timeMain: string = '83219:59:59';
  timeMs: string = '.999';

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startTimer() {
    this.intervalId = setInterval(() => {
      this.totalMs -= 10;
      if (this.totalMs <= 0) {
        this.totalMs = 0;
        clearInterval(this.intervalId);
      }
      this.updateDisplay();
    }, 10);
  }

  private updateDisplay() {
    const totalSeconds = Math.floor(this.totalMs / 1000);
    const ms = Math.floor((this.totalMs % 1000) / 10);

    const totalHours = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const totalDays = Math.floor(totalHours / 24);
    const h = totalHours % 24;

    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    // Formatting YMD if needed in future, but keeping requested main display
    // this.timeYMD = `${years}Y / ${months}M / ${days}D`;

    // Formatting with padding for consistent width
    this.timeMain = `${totalHours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    this.timeMs = `.${ms.toString().padStart(2, '0')}`;
  }
}
