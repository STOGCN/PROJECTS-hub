import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @Input() showActionButtons: boolean = false;

  constructor(private router: Router) { }

  onRecordsClick() {
    console.log('Records clicked');
    // this.router.navigate(['/records']); // Placeholder
  }

  onPlayClick() {
    console.log('Play clicked');
    this.router.navigate(['/against-computer']);
  }

  onMoveLogClick() {
    console.log('Move Log clicked');
  }

  onSettingsClick() {
    console.log('Settings clicked');
  }
}
