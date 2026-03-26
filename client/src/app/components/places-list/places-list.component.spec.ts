import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlacesListComponent } from './places-list.component';
import { Address } from '../../models/address.model';

const mockAddresses: Address[] = [
  { id: 1, name: 'Tour Eiffel', description: 'Monument', lng: 2.2945, lat: 48.8584, createdAt: '2025-01-01' },
  { id: 2, name: 'Colisée', description: null, lng: 12.4924, lat: 41.8902, createdAt: '2025-01-02' },
  { id: 3, name: 'Big Ben', description: 'Horloge', lng: -0.1246, lat: 51.5007, createdAt: '2025-01-03' },
];

describe('PlacesListComponent', () => {
  let component: PlacesListComponent;
  let fixture: ComponentFixture<PlacesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlacesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlacesListComponent);
    component = fixture.componentInstance;
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('affiche "Aucun lieu enregistré" quand la liste est vide', () => {
    component.addresses = [];
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty')?.textContent).toContain('Aucun lieu enregistré');
  });

  it('affiche le bon nombre dans le titre', () => {
    component.addresses = mockAddresses;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3')?.textContent).toContain('3');
  });

  it('crée un .place-item pour chaque adresse', () => {
    component.addresses = mockAddresses;
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.place-item');
    expect(items.length).toBe(3);
  });

  it('émet placeSelected quand on clique sur un lieu', () => {
    component.addresses = mockAddresses;
    fixture.detectChanges();

    let emitted: Address | undefined;
    component.placeSelected.subscribe((addr: Address) => (emitted = addr));

    const firstItem = fixture.nativeElement.querySelector('.place-item') as HTMLElement;
    firstItem.click();

    expect(emitted).toEqual(mockAddresses[0]);
  });
});
