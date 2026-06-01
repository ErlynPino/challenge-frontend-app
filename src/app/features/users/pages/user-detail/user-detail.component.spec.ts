import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ENVIRONMENT } from '../../../../tokens/environment.token';
import { UserDetailComponent } from './user-detail.component';

const ENV = { production: false, apiUrl: 'https://dummyjson.com' };

describe('UserDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ConfirmationService,
        { provide: ENVIRONMENT, useValue: ENV },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
