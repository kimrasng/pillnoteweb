import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

export const pharmacies = [
  {
    name: "예시 약국 A",
    distance: "150m",
    position: [37.5666, 126.9767] as L.LatLngTuple,
    address: "서울시청 서쪽 · 위치 예시",
  },
  {
    name: "예시 약국 B",
    distance: "280m",
    position: [37.5681, 126.9801] as L.LatLngTuple,
    address: "서울시청 북동쪽 · 위치 예시",
  },
  {
    name: "예시 약국 C",
    distance: "410m",
    position: [37.5646, 126.9805] as L.LatLngTuple,
    address: "서울시청 남동쪽 · 위치 예시",
  },
];

export default function PharmacyMap({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const callback = useRef(onSelect);
  callback.current = onSelect;
  useEffect(() => {
    if (!element.current) return;
    const map = L.map(element.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      zoomAnimation: false,
      markerZoomAnimation: false,
    }).setView([37.5665, 126.978], 16);
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.circleMarker([37.5665, 126.978], {
      radius: 6,
      color: "#fff",
      weight: 3,
      fillColor: "#2563eb",
      fillOpacity: 1,
    }).addTo(map);
    markers.current = pharmacies.map((pharmacy, index) => {
      const marker = L.marker(pharmacy.position, {
        title: pharmacy.name,
        keyboard: true,
        icon: L.divIcon({
          className: "pharmacy-marker",
          html: "<span>+</span>",
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        }),
      }).addTo(map);
      marker.getElement()?.setAttribute("aria-label", pharmacy.name);
      marker.on("click", () => callback.current(index));
      return marker;
    });
    map.fitBounds(
      pharmacies.map((pharmacy) => pharmacy.position),
      { padding: [30, 30], maxZoom: 16, animate: false },
    );
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(element.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markers.current = [];
    };
  }, []);
  useEffect(() => {
    markers.current.forEach((marker, index) =>
      marker.getElement()?.classList.toggle("is-selected", selected === index),
    );
  }, [selected]);
  return (
    <div
      className="pharmacy-map"
      ref={element}
      aria-label="서울시청 주변 지도, 약국 표시는 예시입니다"
    />
  );
}
