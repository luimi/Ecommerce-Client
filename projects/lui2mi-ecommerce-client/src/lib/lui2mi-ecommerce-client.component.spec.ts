import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lui2miEcommerceClientComponent } from './lui2mi-ecommerce-client.component';

describe('Lui2miEcommerceClientComponent', () => {
  let component: Lui2miEcommerceClientComponent;
  let fixture: ComponentFixture<Lui2miEcommerceClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Lui2miEcommerceClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Lui2miEcommerceClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
