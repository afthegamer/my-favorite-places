import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [],
  templateUrl: './places-list.component.html',
  styleUrl: './places-list.component.css',
})
export class PlacesListComponent {
  @Input() addresses: Address[] = [];
  @Output() placeSelected = new EventEmitter<Address>();

  select(address: Address) {
    this.placeSelected.emit(address);
  }
}
