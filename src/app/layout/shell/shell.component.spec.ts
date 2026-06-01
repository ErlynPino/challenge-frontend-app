import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([]), MessageService, ConfirmationService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the skip navigation link', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('.skip-link');
    expect(skip).toBeTruthy();
    expect(skip?.getAttribute('href')).toBe('#main-content');
  });
});
