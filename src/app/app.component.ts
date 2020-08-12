import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Launch } from "../models/launch";
import { Observable } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  launchData: Launch[] = [];
  successfulLaunch = '';
  successfulLanding = '';
  launchyear = -1;
  inTheBrowser: boolean;
  inTheServer: boolean;

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ngxService: NgxUiLoaderService
    // @Inject(PLATFORM_ID) platformId: string,
  ) {
    // this.inTheBrowser = isPlatformBrowser(platformId);
    // this.inTheServer = isPlatformServer(platformId);
  }

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(
      switchMap(params => {
        // read query params
        const { launch_success, land_success, launch_year } = params;
        this.successfulLaunch = launch_success || '';
        this.successfulLanding = land_success || '';
        this.launchyear = launch_year ? parseInt(launch_year) - 2006 : -1;
        return this.getSpaceXData();
      })
    ).subscribe(res => {
      this.launchData = res;
      this.ngxService.stop()
    })
  }

  getSpaceXData(): Observable<Launch[]> {
    // TODO: usually we create a http service separatly
    const baseUrl = `https://api.spaceXdata.com/v3/launches`;
    // use absolute URL instead of relative URL
    // const baseUrl = `/api/launchdata`;
    let url = `${baseUrl}?limit=100&${new URLSearchParams(this.genQueryParams()).toString()}`;
    this.ngxService.start()
    return this.httpClient.get<Launch[]>(url);
  }

  genQueryParams() {
    // generate query param object
    let qParams: any = {};
    if (this.successfulLaunch) qParams.launch_success = this.successfulLaunch;
    if (this.successfulLanding) qParams.land_success = this.successfulLanding;
    if (this.launchyear >= 0) {
      qParams.launch_year = String(this.launchyear + 2006);
    }
    return qParams;
  }

  onYearClick(index: number) {
    if (this.launchyear === index) {
      this.launchyear = -1;
    } else {
      this.launchyear = index;
    }
    this.updateURL()
  }

  updateURL() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: this.genQueryParams()
      })
  }

  onLaunchClick(val: string) {
    if (val === this.successfulLaunch) {
      this.successfulLaunch = '';
    } else {
      this.successfulLaunch = val;
    }
    this.updateURL()
  }

  onLandingClick(val: string) {
    if (val === this.successfulLanding) {
      this.successfulLanding = '';
    } else {
      this.successfulLanding = val;
    }
    this.updateURL();
  }

}

