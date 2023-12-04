import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const apiUrl = 'http://localhost:5034/api/';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
