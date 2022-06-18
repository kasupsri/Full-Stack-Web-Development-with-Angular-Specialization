import { Component, OnInit } from '@angular/core';
import { LeaderService } from '../services/leader.service';
import { Leader } from '../shared/leader';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  leaders:Leader[];

  selectedLeader:Leader;

  constructor(private leaderService:LeaderService) { 
    this.leaders = leaderService.getLeaders();
  }

  ngOnInit() {
  }

}
