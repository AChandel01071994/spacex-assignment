import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import nodefetch from 'node-fetch';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const router = express.Router();
  const distFolder = join(process.cwd(), 'dist/spacex/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // === this usually goes into controller ===
  router.get('/launchdata', async (req, res, next) => {
    const { limit, launch_success, land_success, launch_year } = <any>req.query;
    const data = await getSpaceXData(launch_success, land_success, launch_year, limit || 100);
    res.json(data);
  })

  async function getSpaceXData(launchSuccess: string, landSuccess: string, launchYear: string, limit: string) {
    let qParams: any = {}, url = `https://api.spaceXdata.com/v3/launches`;
    if (limit) qParams.limit = limit;
    if (launchSuccess) qParams.launch_success = launchSuccess;
    if (landSuccess) qParams.land_success = landSuccess;
    if (launchYear) qParams.launch_year = launchYear;
    // form full url with query params
    url = `${url}?${new URLSearchParams(qParams).toString()}`;
    return nodefetch(url).then(res => res.json());
  }
  // === this usually goes into controller ===

  // Example Express Rest API endpoints
  server.use('/api', router);
  // server.get('/api/**', (req, res) => {
  //   res.status(404).send('data requests are not yet supported');
  // });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 3001;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
