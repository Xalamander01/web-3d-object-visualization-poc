import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-info-modal',
  imports: [MatDialogModule],
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.scss',
  standalone: true
})
export class InfoModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}
