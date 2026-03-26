import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddPlaceFormComponent } from './add-place-form.component';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

const mockAddress: Address = {
  id: 1,
  name: 'Tour Eiffel',
  description: 'Monument',
  lng: 2.2945,
  lat: 48.8584,
  createdAt: '2025-01-01',
};

describe('AddPlaceFormComponent', () => {
  let component: AddPlaceFormComponent;
  let fixture: ComponentFixture<AddPlaceFormComponent>;
  let addressServiceMock: { createAddress: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    addressServiceMock = {
      createAddress: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AddPlaceFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AddressService, useValue: addressServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPlaceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crée le formulaire avec name, searchWord, description', () => {
    expect(component.form.get('name')).toBeTruthy();
    expect(component.form.get('searchWord')).toBeTruthy();
    expect(component.form.get('description')).toBeTruthy();
  });

  it('le formulaire est invalide quand name ou searchWord sont vides', () => {
    expect(component.form.valid).toBe(false);
    component.form.patchValue({ name: 'Test' });
    expect(component.form.valid).toBe(false);
    component.form.patchValue({ searchWord: 'mot clé' });
    expect(component.form.valid).toBe(true);
  });

  it('onSubmit ne fait rien quand le formulaire est invalide', async () => {
    await component.onSubmit();
    expect(addressServiceMock.createAddress).not.toHaveBeenCalled();
  });

  it('onSubmit appelle createAddress et émet placeCreated', async () => {
    addressServiceMock.createAddress.mockResolvedValue(mockAddress);
    component.form.patchValue({ name: 'Tour Eiffel', searchWord: 'paris eiffel' });

    let emitted: Address | undefined;
    component.placeCreated.subscribe((addr: Address) => (emitted = addr));

    await component.onSubmit();

    expect(addressServiceMock.createAddress).toHaveBeenCalledWith(
      'Tour Eiffel',
      'paris eiffel',
      undefined
    );
    expect(emitted).toEqual(mockAddress);
  });

  it('onSubmit reset le formulaire après succès', async () => {
    addressServiceMock.createAddress.mockResolvedValue(mockAddress);
    component.form.patchValue({ name: 'Test', searchWord: 'test' });

    await component.onSubmit();

    expect(component.form.get('name')?.value).toBeFalsy();
    expect(component.form.get('searchWord')?.value).toBeFalsy();
  });

  it("onSubmit met l'erreur en cas d'échec", async () => {
    addressServiceMock.createAddress.mockRejectedValue({
      error: { message: 'Adresse introuvable' },
    });
    component.form.patchValue({ name: 'Bad', searchWord: 'bad' });

    await component.onSubmit();

    expect(component.error).toBe('Adresse introuvable');
    expect(component.loading).toBe(false);
  });
});
