import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OPERATING_SYSTEMS } from '../../../../core/constants/operating-systems';
import { VM_STATUS_OPTIONS } from '../../../../core/constants/vm-status';
import { CreateVmPayload, VirtualMachine } from '../../../../core/models/vm.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { VmStore } from '../../../../store/vm.store';

@Component({
  selector: 'app-vm-form-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vm-form.page.html',
  styleUrl: './vm-form.page.scss',
})
export class VmFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vmStore = inject(VmStore);

  readonly osOptions = OPERATING_SYSTEMS;
  readonly statusOptions = VM_STATUS_OPTIONS;
  readonly submitting = signal(false);
  readonly editingId = signal<number | null>(this.parseIdFromRoute());

  readonly isEdit = computed(() => this.editingId() !== null);
  readonly pageTitle = computed(() => (this.isEdit() ? 'Edit VM' : 'New virtual machine'));
  readonly pageSubtitle = computed(() =>
    this.isEdit()
      ? 'Update the configuration of an existing virtual machine.'
      : 'Provision a new VM with the resources you need.',
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    os: ['Ubuntu 22.04', [Validators.required]],
    status: this.fb.nonNullable.control<VirtualMachine['status']>('STOPPED', {
      validators: [Validators.required],
    }),
    cores: [2, [Validators.required, Validators.min(1), Validators.max(64)]],
    ram: [4, [Validators.required, Validators.min(1), Validators.max(1024)]],
    disk: [40, [Validators.required, Validators.min(10), Validators.max(10000)]],
  });

  constructor() {
    const id = this.editingId();
    if (id !== null) {
      this.hydrateFromStore(id);
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateVmPayload = {
      name: value.name.trim(),
      os: value.os,
      status: value.status,
      cores: value.cores,
      ram: value.ram,
      disk: value.disk,
    };

    this.submitting.set(true);

    const id = this.editingId();
    const action$ = id !== null ? this.vmStore.updateVm(id, payload) : this.vmStore.createVm(payload);

    action$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/vms']);
      },
      error: () => this.submitting.set(false),
    });
  }

  errorOf(controlName: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength as number;
      return `Must be at least ${requiredLength} characters`;
    }
    if (control.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength'].requiredLength as number;
      return `Must be at most ${requiredLength} characters`;
    }
    if (control.hasError('min')) {
      const min = control.errors?.['min'].min as number;
      return `Must be greater than or equal to ${min}`;
    }
    if (control.hasError('max')) {
      const max = control.errors?.['max'].max as number;
      return `Must be less than or equal to ${max}`;
    }
    return 'Invalid value';
  }

  private parseIdFromRoute(): number | null {
    const param = this.route.snapshot.paramMap.get('id');
    if (!param) {
      return null;
    }
    const parsed = Number(param);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private hydrateFromStore(id: number): void {
    const vm = this.vmStore.vms().find((entry) => entry.id === id);
    if (vm) {
      this.form.patchValue({
        name: vm.name,
        os: vm.os,
        status: vm.status,
        cores: vm.cores,
        ram: vm.ram,
        disk: vm.disk,
      });
    } else {
      // If the store hasn't loaded yet, defer hydration with a microtask.
      queueMicrotask(() => {
        const refreshed = this.vmStore.vms().find((entry) => entry.id === id);
        if (refreshed) {
          this.form.patchValue({
            name: refreshed.name,
            os: refreshed.os,
            status: refreshed.status,
            cores: refreshed.cores,
            ram: refreshed.ram,
            disk: refreshed.disk,
          });
        }
      });
    }
  }
}
