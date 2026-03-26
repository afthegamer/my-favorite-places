import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchRadiusComponent } from './search-radius.component';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

const mockResults: Address[] = [
  { id: 1, name: 'Lieu 1', description: null, lng: 2.35, lat: 48.86, createdAt: '2025-01-01' },
];

describe('SearchRadiusComponent', () => {
  let component: SearchRadiusComponent;
  let fixture: ComponentFixture<SearchRadiusComponent>;
  let addressServiceMock: { searchByRadius: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    addressServiceMock = {
      searchByRadius: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SearchRadiusComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AddressService, useValue: addressServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchRadiusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crée le formulaire avec lat, lng, radius', () => {
    expect(component.form.get('lat')).toBeTruthy();
    expect(component.form.get('lng')).toBeTruthy();
    expect(component.form.get('radius')).toBeTruthy();
  });

  it('radius rejette une valeur < 0.1', () => {
    component.form.patchValue({ lat: 48, lng: 2, radius: 0 });
    expect(component.form.valid).toBe(false);

    component.form.patchValue({ radius: 0.1 });
    expect(component.form.valid).toBe(true);
  });

  it('useMapCenter remplit le formulaire avec les coordonnées de la carte', () => {
    component.mapCenter = { lat: 48.8566, lng: 2.3522 };
    component.useMapCenter();

    expect(component.form.get('lat')?.value).toBe(48.85660);
    expect(component.form.get('lng')?.value).toBe(2.35220);
  });

  it('useMapCenter ne fait rien quand mapCenter est null', () => {
    component.mapCenter = null;
    component.form.patchValue({ lat: 10, lng: 20 });
    component.useMapCenter();

    expect(component.form.get('lat')?.value).toBe(10);
    expect(component.form.get('lng')?.value).toBe(20);
  });

  it('onSubmit appelle searchByRadius et émet les résultats et le centre', async () => {
    addressServiceMock.searchByRadius.mockResolvedValue(mockResults);
    component.form.patchValue({ lat: 48.86, lng: 2.35, radius: 5 });

    let emittedResults: Address[] | undefined;
    let emittedCenter: { lat: number; lng: number } | undefined;
    component.searchResults.subscribe((r: Address[]) => (emittedResults = r));
    component.searchCenterChange.subscribe((c: { lat: number; lng: number }) => (emittedCenter = c));

    await component.onSubmit();

    expect(addressServiceMock.searchByRadius).toHaveBeenCalledWith(5, { lat: 48.86, lng: 2.35 });
    expect(emittedResults).toEqual(mockResults);
    expect(emittedCenter).toEqual({ lat: 48.86, lng: 2.35 });
  });

  it('onClear émet clearSearch et reset le formulaire', () => {
    component.form.patchValue({ lat: 48, lng: 2, radius: 5 });
    component.error = 'some error';

    let clearEmitted = false;
    component.clearSearch.subscribe(() => (clearEmitted = true));

    component.onClear();

    expect(clearEmitted).toBe(true);
    expect(component.form.get('lat')?.value).toBeNull();
    expect(component.error).toBe('');
  });
});
