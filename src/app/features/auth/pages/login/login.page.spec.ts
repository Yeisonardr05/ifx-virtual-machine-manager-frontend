import { ApplicationRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { sampleUser } from '../../../../../testing/fixtures';
import { AuthStore } from '../../../../store/auth.store';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  const login = vi.fn();
  const authMock = {
    loading: signal(false),
    login,
  };
  const navigateByUrl = vi.fn().mockResolvedValue(true);
  const navigate = vi.fn().mockResolvedValue(true);

  beforeEach(async () => {
    login.mockReturnValue(of(sampleUser()));
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideNoopAnimations(),
        { provide: AuthStore, useValue: authMock },
        { provide: Router, useValue: { navigateByUrl, navigate } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();
  });

  it('does not submit invalid form', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentInstance.form.patchValue({ email: 'x', password: 'short' });
    fixture.componentInstance.submit();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const appRef = TestBed.inject(ApplicationRef);
    const tickSpy = vi.spyOn(appRef, 'tick');
    fixture.componentInstance.form.patchValue({ email: 'admin@test.com', password: '123456' });
    fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(login).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalled();
    expect(tickSpy).toHaveBeenCalled();
  });

  it('emailError surfaces validation messages', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const email = fixture.componentInstance.form.controls.email;
    email.setValue('bad');
    email.markAsTouched();
    expect(fixture.componentInstance.emailError()).toBeTruthy();
  });

  it('fillAccount patches form', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentInstance.fillAccount('a@b.com', 'secret12');
    expect(fixture.componentInstance.form.getRawValue().email).toBe('a@b.com');
  });

  it('togglePasswordVisibility flips flag', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const cmp = fixture.componentInstance as unknown as { showPassword: boolean; togglePasswordVisibility: () => void };
    expect(cmp.showPassword).toBe(false);
    cmp.togglePasswordVisibility();
    expect(cmp.showPassword).toBe(true);
  });

  it('passwordError surfaces validation', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const pwd = fixture.componentInstance.form.controls.password;
    pwd.setValue('x');
    pwd.markAsTouched();
    expect(fixture.componentInstance.passwordError()).toBeTruthy();
  });
});
