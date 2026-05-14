import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { sampleVm } from '../../../testing/fixtures';
import { APP_CONFIG } from '../config/app.config';
import { VmService } from './vm.service';

describe('VmService', () => {
  let httpMock: HttpTestingController;
  let service: VmService;
  const vm = sampleVm();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VmService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VmService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list unwraps array', () => {
    service.list().subscribe((vms) => expect(vms).toEqual([vm]));
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    req.flush([vm]);
  });

  it('getById unwraps envelope', () => {
    service.getById(1).subscribe((v) => expect(v).toEqual(vm));
    httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms/1`).flush({ data: vm });
  });

  it('create posts payload', () => {
    const payload = {
      name: 'n',
      cores: 1,
      ram: 1,
      disk: 1,
      os: 'Ubuntu 22.04',
    };
    service.create(payload).subscribe((v) => expect(v).toEqual(vm));
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    expect(req.request.method).toBe('POST');
    req.flush(vm);
  });

  it('update sends put', () => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = vm;
    service.update(vm.id, body).subscribe();
    httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms/${vm.id}`).flush(vm);
  });

  it('remove deletes', () => {
    service.remove(1).subscribe();
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
