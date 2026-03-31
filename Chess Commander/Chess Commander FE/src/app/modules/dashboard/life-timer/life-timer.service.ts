import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LifeTimerService implements OnDestroy {
  // Initial totalMs: 83219:59:59.999
  private readonly DEFAULT_MS = (83219 * 3600000) + (59 * 60000) + (59 * 1000) + 999;
  private readonly STORAGE_KEY = 'life_timer_total_ms';
  private readonly LAST_TIME_KEY = 'life_timer_last_timestamp';
  
  private totalMs: number;
  private intervalId: any;
  private lastUpdateTimestamp: number;

  private timeYMDSubject = new BehaviorSubject<string>('');
  private timeMainSubject = new BehaviorSubject<string>('');
  private timeMsSubject = new BehaviorSubject<string>('');

  timeYMD$ = this.timeYMDSubject.asObservable();
  timeMain$ = this.timeMainSubject.asObservable();
  timeMs$ = this.timeMsSubject.asObservable();

  constructor() {
    const savedTime = localStorage.getItem(this.STORAGE_KEY);
    const lastTimestamp = localStorage.getItem(this.LAST_TIME_KEY);
    
    this.totalMs = savedTime ? parseInt(savedTime, 10) : this.DEFAULT_MS;
    this.lastUpdateTimestamp = Date.now();

    // If we have a saved timestamp, account for the time passed while the app was closed/reloading
    if (lastTimestamp) {
        const elapsedSinceLastExit = Date.now() - parseInt(lastTimestamp, 10);
        this.totalMs -= elapsedSinceLastExit;
        if (this.totalMs < 0) this.totalMs = 0;
    }

    this.updateDisplay();
    this.startTimer();
  }

  public setTime(ms: number) {
    this.totalMs = ms;
    this.lastUpdateTimestamp = Date.now();
    this.saveToStorage();
    this.updateDisplay();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startTimer() {
    this.stopTimer();
    this.lastUpdateTimestamp = Date.now();
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastUpdateTimestamp;
      this.lastUpdateTimestamp = now;

      this.totalMs -= elapsed;
      if (this.totalMs <= 0) {
        this.totalMs = 0;
        this.stopTimer();
      }
      
      this.updateDisplay();
      this.saveToStorage();
    }, 100); // 100ms is enough for display, and less CPU intensive than 10ms
  }

  private saveToStorage() {
    // Save current state and timestamp
    localStorage.setItem(this.STORAGE_KEY, this.totalMs.toString());
    localStorage.setItem(this.LAST_TIME_KEY, Date.now().toString());
  }

  private updateDisplay() {
    const totalSeconds = Math.floor(this.totalMs / 1000);
    const ms = Math.floor(this.totalMs % 1000);

    const totalHours = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const totalDays = Math.floor(totalHours / 24);
    
    // Simple calc for YMD
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    this.timeYMDSubject.next(`${years} Y / ${months} M / ${days} D`);
    this.timeMainSubject.next(`${totalHours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    this.timeMsSubject.next(`.${ms.toString().padStart(3, '0')}`);
  }
}
