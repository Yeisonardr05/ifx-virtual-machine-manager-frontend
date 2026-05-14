import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthStore } from '../../../../store/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appRef = inject(ApplicationRef);

  protected readonly loading = this.auth.loading;

  readonly form = this.fb.nonNullable.group({
    email: ['admin@test.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly demoAccounts = [
    { label: 'Admin', email: 'admin@test.com', password: '123456' },
    { label: 'Client', email: 'client@test.com', password: 'client123' },
  ];

  protected showPassword = false;

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: async () => {
        const raw = this.route.snapshot.queryParamMap.get('redirect');
        const target = this.sanitizeInternalPath(raw) ?? '/dashboard';
        // Microtask: let the browser attach Set-Cookie before the shell fires GET /vms.
        await new Promise<void>((r) => queueMicrotask(r));
        let ok = await this.router.navigateByUrl(target);
        if (!ok) {
          ok = await this.router.navigate(['/dashboard']);
        }
        this.appRef.tick();
      },
      error: () => undefined,
    });
  }

  fillAccount(email: string, password: string): void {
    this.form.patchValue({ email, password });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  emailError(): string | null {
    const control = this.form.controls.email;
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) return 'Email is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    return null;
  }

  passwordError(): string | null {
    const control = this.form.controls.password;
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) return 'Password is required';
    if (control.hasError('minlength')) return 'Password must be at least 6 characters';
    return null;
  }

  /** Only same-origin absolute paths; prevents open redirects via ?redirect=. */
  private sanitizeInternalPath(raw: string | null): string | null {
    if (!raw?.trim()) {
      return null;
    }
    const path = raw.trim();
    if (!path.startsWith('/') || path.startsWith('//')) {
      return null;
    }
    return path;
  }
}
