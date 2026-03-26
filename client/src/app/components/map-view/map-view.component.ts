import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Address } from '../../models/address.model';

const iconDefault = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css',
})
export class MapViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() addresses: Address[] = [];
  @Input() selectedPlace: Address | null = null;
  @Input() searchCenter: { lat: number; lng: number } | null = null;
  @Output() centerChange = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapContainer', { static: true }) mapEl!: ElementRef;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  ngAfterViewInit() {
    this.map = L.map(this.mapEl.nativeElement).setView([46.6, 2.2], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.centerChange.emit({ lat: center.lat, lng: center.lng });
    });

    const center = this.map.getCenter();
    this.centerChange.emit({ lat: center.lat, lng: center.lng });

    this.updateMarkers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.map) return;

    if (changes['addresses']) {
      this.updateMarkers();
    }

    if (changes['selectedPlace'] && this.selectedPlace) {
      this.map.flyTo([this.selectedPlace.lat, this.selectedPlace.lng], 14, {
        duration: 1,
      });
    }

    if (changes['searchCenter'] && this.searchCenter) {
      this.map.flyTo([this.searchCenter.lat, this.searchCenter.lng], 10, {
        duration: 1,
      });
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private updateMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    for (const addr of this.addresses) {
      const marker = L.marker([addr.lat, addr.lng]).addTo(this.map);
      marker.bindPopup(
        `<strong>${addr.name}</strong>${addr.description ? '<br>' + addr.description : ''}`
      );
      this.markers.push(marker);
    }

    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }
}
