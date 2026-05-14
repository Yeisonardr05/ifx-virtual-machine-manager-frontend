import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import { CreateVmPayload, VirtualMachine, VmUpdateRequestBody } from '../models/vm.model';
import { unwrapVm, unwrapVmList } from '../utils/vm-api-response';

@Injectable({ providedIn: 'root' })
export class VmService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiBaseUrl}/vms`;

  list(): Observable<VirtualMachine[]> {
    return this.http
      .get<unknown>(this.baseUrl)
      .pipe(map((body) => unwrapVmList(body)));
  }

  getById(id: number): Observable<VirtualMachine> {
    return this.http
      .get<unknown>(`${this.baseUrl}/${id}`)
      .pipe(map((body) => unwrapVm(body)));
  }

  create(payload: CreateVmPayload): Observable<VirtualMachine> {
    return this.http
      .post<unknown>(this.baseUrl, payload)
      .pipe(map((body) => unwrapVm(body)));
  }

  update(id: number, body: VmUpdateRequestBody): Observable<VirtualMachine> {
    return this.http
      .put<unknown>(`${this.baseUrl}/${id}`, body)
      .pipe(map((body) => unwrapVm(body)));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
