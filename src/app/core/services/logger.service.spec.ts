import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { ENVIRONMENT } from '../../tokens/environment.token';

describe('LoggerService', () => {
  function setup(production: boolean) {
    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: ENVIRONMENT, useValue: { production, apiUrl: '' } },
      ],
    });
    return TestBed.inject(LoggerService);
  }

  it('should be created', () => {
    const service = setup(false);
    expect(service).toBeTruthy();
  });

  it('should call console.log in development', () => {
    const service = setup(false);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.log('test message');
    expect(spy).toHaveBeenCalledWith('[LOG] test message');
    spy.mockRestore();
  });

  it('should NOT call console.log in production', () => {
    const service = setup(true);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.log('test message');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should always call console.error regardless of environment', () => {
    const service = setup(true);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.error('critical error');
    expect(spy).toHaveBeenCalledWith('[ERROR] critical error');
    spy.mockRestore();
  });

  it('should NOT call console.warn in production', () => {
    const service = setup(true);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.warn('warning');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
