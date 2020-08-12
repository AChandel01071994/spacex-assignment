import { Component, OnInit, Input } from '@angular/core';
import { Launch } from 'src/models/launch';

@Component({
  selector: 'app-launch-card',
  templateUrl: './launch-card.component.html',
  styleUrls: ['./launch-card.component.scss']
})
export class LaunchCardComponent implements OnInit {
  @Input('launchData') launchData: Launch;
  constructor() { }

  ngOnInit(): void {
  }

}
