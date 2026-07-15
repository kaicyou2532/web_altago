'use client';

import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { divIcon, type LatLngExpression } from 'leaflet';

type Props = {
  latitude: number;
  longitude: number;
  onChangeAction: (latitude: number, longitude: number) => void;
};

// Leaflet標準アイコンはNext.js環境で画像URLを解決できないことがあるため、
// public画像に依存しないHTMLアイコンを使用する。
const locationPinIcon = divIcon({
  className: 'altago-location-pin',
  html: `
    <span style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:32px;
      height:32px;
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      background:#007B63;
      box-shadow:0 4px 12px rgba(0,0,0,.28);
      transform:rotate(-45deg);
    ">
      <span style="
        display:block;
        width:9px;
        height:9px;
        border-radius:50%;
        background:#fff;
      "></span>
    </span>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function ClickMarker({ onChangeAction, position }: { onChangeAction: Props['onChangeAction']; position: LatLngExpression }) {
  useMapEvents({
    click(event) {
      onChangeAction(event.latlng.lat, event.latlng.lng);
    },
  });
  return <Marker position={position} icon={locationPinIcon} />;
}

export default function TaskLocationPicker({ latitude, longitude, onChangeAction }: Props) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const position: LatLngExpression = [latitude, longitude];

  async function searchLocation() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const [result] = await response.json();
      if (result) onChangeAction(Number(result.lat), Number(result.lon));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="住所・施設名を地図検索" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#007B63]" />
        <button type="button" onClick={searchLocation} className="rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">{searching ? '検索中' : '検索'}</button>
      </div>
      <div className="h-56 overflow-hidden rounded-xl border border-gray-200">
        <MapContainer key={`${latitude.toFixed(4)}-${longitude.toFixed(4)}`} center={position} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickMarker position={position} onChangeAction={onChangeAction} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400">地図をクリックして実施場所を調整できます。</p>
    </div>
  );
}
