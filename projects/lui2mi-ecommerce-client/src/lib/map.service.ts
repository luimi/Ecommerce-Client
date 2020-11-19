import { Injectable } from '@angular/core';
import { Map, latLng, tileLayer, Layer, marker, icon, featureGroup } from 'leaflet';
import Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  maps: any = {};
  courierSubscription;
  constructor() { }
  private init(layer, page, center) {
    if (this.maps[page]) {
      this.maps[page].remove();
    }
    const map = new Map('map', { zoomControl: false }).setView([center.latitude, center.longitude], 15);
    tileLayer(layer, {
      attribution: "Q'pido",
    }).addTo(map);
    this.maps[page] = map;
  }

  public async initAddressMap(layer, center, dragend, click) {
    const config = await Parse.Config.get();
    const shopLocation = config.get('ECommerceLocation');
    center = center ? center : shopLocation;
    await this.init(layer, 'address', center);
    const m = this.addMarker(this.maps['address'], [center.latitude, center.longitude]);
    m.dragging.enable();
    m.on('dragend', (e) => {
      const l = e.target._latlng;
      const location = new Parse.GeoPoint({ latitude: l.lat, longitude: l.lng });
      dragend(location);
    });
    this.maps['address'].on('click', (e) => {
      const l = e.latlng;
      m.setLatLng(l);
      const location = new Parse.GeoPoint({ latitude: l.lat, longitude: l.lng });
      click(location);
    });
  }
  public async initDeliveryMap(layer, delivery) {
    const config = await Parse.Config.get();
    const shopLocation = config.get('ECommerceLocation');
    await this.init(layer, 'delivery', shopLocation);
    this.disableMap(this.maps['delivery']);
    const al = delivery.get('address').get('location');
    const am = this.addMarker(this.maps['delivery'],[al.latitude, al.longitude]);
    if (delivery.get('status') === 3 && delivery.has('courier')) {
      const courier = delivery.get('courier');
      await courier.fetch();
      const cl = courier.get('lastLocation');
      const courierMarker = this.addMarker(this.maps['delivery'],[cl.latitude, cl.longitude]);
      this.fitMap(this.maps['delivery'], [am,courierMarker]);
      const courierQuery = new Parse.Query(Parse.User).equalTo('objectId', courier.id);
      if(this.courierSubscription){
        this.courierSubscription.unsubscribe();
        this.courierSubscription = undefined;
      }
      this.courierSubscription = await courierQuery.subscribe();
      this.courierSubscription.on('update', (courier)=> {
        let lastLocation = courier.get('lastLocation');
        let location = [lastLocation.latitude, lastLocation.longitude];
        this.moveTo(courierMarker, location);
        this.fitMap(this.maps['delivery'],[am,courierMarker]);
      });
    } else {
      const sm = this.addMarker(this.maps['delivery'],[shopLocation.latitude, shopLocation.longitude]);
      this.fitMap(this.maps['delivery'],[am,sm]);
    }
  }
  public addMarker(map, location, title?, iconUrl?, size?) {
    let options: any = {};
    if (title) {
      options.title = title;
    }
    if (iconUrl) {
      let i = icon({
        iconUrl: iconUrl,
        iconSize: size ? size : [23, 32],
        iconAnchor: size ? [size[0] / 2, size[1]] : [11, 32],
        popupAnchor: [0, -32]
      });
      options.icon = i;

    }
    let m = marker(location, options).addTo(map);
    return m;
  }
  isInitialized(id) {
    return this.maps[id];
  }
  removeMap(id) {
    if (this.maps[id]) {
      this.maps[id].remove();
    }
  }
  public fitMap(map, markers) {
    var group = new featureGroup(markers);
    map.fitBounds(group.getBounds(),{padding:[10,10]});
  }
  public disableMap(map) {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }
  public enableMap(map) {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  }
  public moveTo(marker, location) {
    const distanceBtwnPoints = 10;
    const timeBtwnPoints = 50;
    let ml = marker.getLatLng();
    ml = [ml.lat, ml.lng];
    let segments = Math.floor(this.computeDistanceBetween(ml, location) / distanceBtwnPoints);
    if (segments > 1) {
      for (let i = 0; i < segments; i++) {
        setTimeout(() => {
          marker.setLatLng(this.computeOffset(ml, (distanceBtwnPoints * i), location));
        }, timeBtwnPoints * i);

      }
    }
  }
  private computeOffset(from, distance, to) {
    distance /= 6378137;
    let fromLat = this.toRadians(from[0]);
    let toLat = this.toRadians(to[0]);
    let deltaLng = this.toRadians(to[1]) - this.toRadians(from[1]);
    let fmod = (a, b) => Number((a - (Math.floor(a / b) * b)).toPrecision(8));
    let angle = this.toDegrees(
      Math.atan2(
        Math.sin(deltaLng) * Math.cos(toLat),
        Math.cos(fromLat) * Math.sin(toLat) -
        Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng)
      )
    );
    if (angle === 180) { }
    else {
      angle = fmod((fmod((angle - -180), 360) + 360), 360) + -180;
    }
    let heading = this.toRadians(angle);

    let cosDistance = Math.cos(distance);
    let sinDistance = Math.sin(distance);
    let sinFromLat = Math.sin(fromLat);
    let cosFromLat = Math.cos(fromLat);
    let sc = cosDistance * sinFromLat + sinDistance * cosFromLat * Math.cos(heading);
    return [
      this.toDegrees(Math.asin(sc)),
      this.toDegrees(this.toRadians(from[1]) +
        Math.atan2(sinDistance * cosFromLat * Math.sin(heading),
          cosDistance - sinFromLat * sc))
    ];
  }
  private toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  private toRadians(angleDegrees) {
    return angleDegrees * Math.PI / 180.0;
  }
  public computeDistanceBetween(from, to) {
    let radFromLat = this.toRadians(from[0])
    let radFromLng = this.toRadians(from[1]);
    let radToLat = this.toRadians(to[0])
    let radToLng = this.toRadians(to[1]);
    return 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((radFromLat - radToLat) / 2), 2)
      + Math.cos(radFromLat) * Math.cos(radToLat) *
      Math.pow(Math.sin((radFromLng - radToLng) / 2), 2)
    )) * 6378137;
  }
}
