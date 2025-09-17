import { Component } from '@angular/core';
import { ThreeDObjectComponent } from './components/three-d-object/three-d-object.component';

@Component({
  selector: 'app-root',
  imports: [ThreeDObjectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'web-3d-object-visualization-poc';
}
