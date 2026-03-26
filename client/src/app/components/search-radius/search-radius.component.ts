import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-search-radius',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-radius.component.html',
  styleUrl: './search-radius.component.css',
})
export class SearchRadiusComponent {
  @Input() mapCenter: { lat: number; lng: number } | null = null;
  @Output() searchResults = new EventEmitter<Address[]>();
  @Output() searchCenterChange = new EventEmitter<{ lat: number; lng: number }>();
  @Output() clearSearch = new EventEmitter<void>();

  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]],
      radius: [null, [Validators.required, Validators.min(0.1)]],
    });
  }

  useMapCenter() {
    if (this.mapCenter) {
      this.form.patchValue({
        lat: parseFloat(this.mapCenter.lat.toFixed(5)),
        lng: parseFloat(this.mapCenter.lng.toFixed(5)),
      });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { lat, lng, radius } = this.form.value;
    try {
      const results = await this.addressService.searchByRadius(radius, { lat, lng });
      this.searchResults.emit(results);
      this.searchCenterChange.emit({ lat, lng });
    } catch (e: any) {
      this.error = e?.error?.message || 'Erreur de recherche';
    } finally {
      this.loading = false;
    }
  }

  onClear() {
    this.clearSearch.emit();
    this.form.reset();
    this.error = '';
  }
}
