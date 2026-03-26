import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-add-place-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-place-form.component.html',
  styleUrl: './add-place-form.component.css',
})
export class AddPlaceFormComponent {
  @Output() placeCreated = new EventEmitter<Address>();

  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      searchWord: ['', [Validators.required]],
      description: [''],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { name, searchWord, description } = this.form.value;
    try {
      const address = await this.addressService.createAddress(
        name,
        searchWord,
        description || undefined
      );
      this.placeCreated.emit(address);
      this.form.reset();
    } catch (e: any) {
      this.error = e?.error?.message || 'Erreur lors de la création';
    } finally {
      this.loading = false;
    }
  }
}
