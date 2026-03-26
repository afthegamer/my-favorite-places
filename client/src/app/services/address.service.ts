import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address } from '../models/address.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddressService {
  constructor(private http: HttpClient) {}

  async getAddresses(): Promise<Address[]> {
    const res = await firstValueFrom(
      this.http.get<{ items: Address[] }>('/api/addresses')
    );
    return res.items;
  }

  async createAddress(
    name: string,
    searchWord: string,
    description?: string
  ): Promise<Address> {
    const res = await firstValueFrom(
      this.http.post<{ item: Address }>('/api/addresses', {
        name,
        searchWord,
        description,
      })
    );
    return res.item;
  }

  async searchByRadius(
    radius: number,
    from: { lng: number; lat: number }
  ): Promise<Address[]> {
    const res = await firstValueFrom(
      this.http.post<{ items: Address[] }>('/api/addresses/searches', {
        radius,
        from,
      })
    );
    return res.items;
  }
}
