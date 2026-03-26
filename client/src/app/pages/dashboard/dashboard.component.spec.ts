import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

@Component({ selector: 'app-map-view', template: '', standalone: true })
class MockMapViewComponent {
  @Input() addresses: Address[] = [];
  @Input() selectedPlace: Address | null = null;
  @Input() searchCenter: { lat: number; lng: number } | null = null;
  @Output() centerChange = new EventEmitter<{ lat: number; lng: number }>();
}

const mockAddresses: Address[] = [
  { id: 1, name: 'Tour Eiffel', description: 'Monument', lng: 2.2945, lat: 48.8584, createdAt: '2025-01-01' },
  { id: 2, name: 'Colisée', description: null, lng: 12.4924, lat: 41.8902, createdAt: '2025-01-02' },
];

const newAddress: Address = {
  id: 3, name: 'Big Ben', description: 'Horloge', lng: -0.1246, lat: 51.5007, createdAt: '2025-01-03',
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let addressServiceMock: { getAddresses: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    addressServiceMock = {
      getAddresses: vi.fn().mockResolvedValue(mockAddresses),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AddressService, useValue: addressServiceMock },
      ],
    })
      .overrideComponent(DashboardComponent, {
        remove: { imports: [await import('../../components/map-view/map-view.component').then(m => m.MapViewComponent)] },
        add: { imports: [MockMapViewComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('charge les adresses au démarrage', async () => {
    await component.ngOnInit();
    expect(addressServiceMock.getAddresses).toHaveBeenCalled();
    expect(component.addresses).toEqual(mockAddresses);
  });

  it('displayedAddresses retourne addresses quand pas de searchResults', async () => {
    await component.ngOnInit();
    expect(component.displayedAddresses).toEqual(mockAddresses);
  });

  it('displayedAddresses retourne searchResults quand défini', async () => {
    await component.ngOnInit();
    const searchResult = [mockAddresses[0]!];
    component.searchResults = searchResult;
    expect(component.displayedAddresses).toEqual(searchResult);
  });

  it('onPlaceCreated ajoute une adresse et annule la recherche', async () => {
    await component.ngOnInit();
    component.searchResults = [mockAddresses[0]!];

    component.onPlaceCreated(newAddress);

    expect(component.addresses).toHaveLength(3);
    expect(component.addresses[2]).toEqual(newAddress);
    expect(component.selectedPlace).toEqual(newAddress);
    expect(component.searchResults).toBeNull();
  });

  it('onPlaceSelected met à jour selectedPlace', () => {
    component.onPlaceSelected(mockAddresses[0]!);
    expect(component.selectedPlace).toEqual(mockAddresses[0]);
  });

  it('onSearchResults met les résultats et annule selectedPlace', () => {
    component.selectedPlace = mockAddresses[0]!;
    component.onSearchResults([mockAddresses[1]!]);

    expect(component.searchResults).toEqual([mockAddresses[1]]);
    expect(component.selectedPlace).toBeNull();
  });

  it('onClearSearch réinitialise searchResults et searchCenter', () => {
    component.searchResults = [mockAddresses[0]!];
    component.searchCenter = { lat: 48, lng: 2 };

    component.onClearSearch();

    expect(component.searchResults).toBeNull();
    expect(component.searchCenter).toBeNull();
  });
});
