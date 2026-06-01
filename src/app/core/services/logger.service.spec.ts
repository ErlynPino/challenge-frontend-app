import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { ENVIRONMENT } from '../../tokens/environment.token';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: ENVIRONMENT, useValue: { production: false, apiUrl: '' } },
      ],
    });
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
