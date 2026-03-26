import { Component, OnInit } from '@angular/core';
import { AddPlaceFormComponent } from '../../components/add-place-form/add-place-form.component';
import { PlacesListComponent } from '../../components/places-list/places-list.component';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { SearchRadiusComponent } from '../../components/search-radius/search-radius.component';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AddPlaceFormComponent,
    PlacesListComponent,
    MapViewComponent,
    SearchRadiusComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  addresses: Address[] = [];
  searchResults: Address[] | null = null;
  selectedPlace: Address | null = null;
  mapCenter: { lat: number; lng: number } | null = null;

  constructor(private addressService: AddressService) {}

  async ngOnInit() {
    await this.loadAddresses();
  }

  async loadAddresses() {
    try {
      this.addresses = await this.addressService.getAddresses();
    } catch (e) {
      console.error('Erreur lors du chargement des lieux :', e);
    }
  }

  get displayedAddresses(): Address[] {
    return this.searchResults ?? this.addresses;
  }

  onPlaceCreated(address: Address) {
    this.addresses = [...this.addresses, address];
    this.selectedPlace = address;
    this.searchResults = null;
  }

  onPlaceSelected(address: Address) {
    this.selectedPlace = address;
  }

  searchCenter: { lat: number; lng: number } | null = null;

  onSearchResults(results: Address[]) {
    this.searchResults = results;
    this.selectedPlace = null;
  }

  onSearchCenter(center: { lat: number; lng: number }) {
    this.searchCenter = center;
  }

  onClearSearch() {
    this.searchResults = null;
    this.searchCenter = null;
  }

  onMapCenterChange(center: { lat: number; lng: number }) {
    this.mapCenter = center;
  }
}
