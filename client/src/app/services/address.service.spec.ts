import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AddressService } from './address.service';
import { Address } from '../models/address.model';

const mockAddress: Address = {
  id: 1,
  name: 'Tour Eiffel',
  description: 'Monument parisien',
  lng: 2.2945,
  lat: 48.8584,
  createdAt: '2025-01-01',
};

const mockAddress2: Address = {
  id: 2,
  name: 'Colisée',
  description: null,
  lng: 12.4924,
  lat: 41.8902,
  createdAt: '2025-01-02',
};

describe('AddressService', () => {
  let service: AddressService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AddressService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('getAddresses envoie GET /api/addresses et retourne les items', async () => {
    const promise = service.getAddresses();

    const req = httpTesting.expectOne('/api/addresses');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [mockAddress, mockAddress2] });

    const result = await promise;
    expect(result).toEqual([mockAddress, mockAddress2]);
    expect(result).toHaveLength(2);
  });

  it('getAddresses retourne un tableau vide quand pas de lieux', async () => {
    const promise = service.getAddresses();

    httpTesting.expectOne('/api/addresses').flush({ items: [] });

    const result = await promise;
    expect(result).toEqual([]);
  });

  it('createAddress envoie POST /api/addresses avec les bons paramètres', async () => {
    const promise = service.createAddress('Tour Eiffel', 'paris eiffel', 'Monument parisien');

    const req = httpTesting.expectOne('/api/addresses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Tour Eiffel',
      searchWord: 'paris eiffel',
      description: 'Monument parisien',
    });
    req.flush({ item: mockAddress });

    const result = await promise;
    expect(result).toEqual(mockAddress);
  });

  it('createAddress envoie sans description quand non fournie', async () => {
    const promise = service.createAddress('Colisée', 'rome colosseum');

    const req = httpTesting.expectOne('/api/addresses');
    expect(req.request.body.description).toBeUndefined();
    req.flush({ item: mockAddress2 });

    await promise;
  });

  it('searchByRadius envoie POST /api/addresses/searches avec radius et from', async () => {
    const promise = service.searchByRadius(5, { lng: 2.35, lat: 48.86 });

    const req = httpTesting.expectOne('/api/addresses/searches');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ radius: 5, from: { lng: 2.35, lat: 48.86 } });
    req.flush({ items: [mockAddress] });

    const result = await promise;
    expect(result).toEqual([mockAddress]);
  });

  it('searchByRadius retourne un tableau vide quand pas de résultats', async () => {
    const promise = service.searchByRadius(1, { lng: 0, lat: 0 });

    httpTesting.expectOne('/api/addresses/searches').flush({ items: [] });

    const result = await promise;
    expect(result).toEqual([]);
  });
});
