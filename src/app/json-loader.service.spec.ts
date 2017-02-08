/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { JsonLoaderService } from './json-loader.service';

describe('JsonLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonLoaderService]
    });
  });

  it('should ...', inject([JsonLoaderService], (service: JsonLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
