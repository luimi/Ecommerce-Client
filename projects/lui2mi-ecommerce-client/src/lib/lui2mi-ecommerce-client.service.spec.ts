import { TestBed } from '@angular/core/testing';

import { Lui2miEcommerceClientService } from './lui2mi-ecommerce-client.service';

describe('Lui2miEcommerceClientService', () => {
  let service: Lui2miEcommerceClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lui2miEcommerceClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
