import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Launch } from "../models/launch";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data: Launch[] = [];
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.pipe(
      switchMap(params => {
        const { limit, launch_success, land_success, launch_year } = params;
        return this.getSpaceXData(launch_success, land_success, launch_year, limit || '100');
      })
    ).subscribe(res => {
      this.data = res;
    })

  }

  getSpaceXData(launchSuccess?: string, landSuccess?: string, launchYear?: string, limit?: string) {
    // usually we create a http service separatly
    // we can also move this call to server-side/nodejs code
    let qParams: any = {}, url = `https://api.spaceXdata.com/v3/launches`;
    if (limit) qParams.limit = limit;
    if (launchSuccess) qParams.launch_success = launchSuccess;
    if (landSuccess) qParams.land_success = landSuccess;
    if (launchYear) qParams.launch_year = launchYear;
    // form full url with query params
    url = `${url}?${new URLSearchParams(qParams).toString()}`;
    return this.httpClient.get<Launch[]>(url);
  }

}

