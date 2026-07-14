'use client';

import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

type Props = {
  latitude: number;
  longitude: number;
  onChangeAction: (latitude: number, longitude: number) => void;
};

function ClickMarker({ onChangeAction, position }: { onChangeAction: Props['onChangeAction']; position: LatLngExpression }) {
  useMapEvents({
    click(event) {
      onChangeAction(event.latlng.lat, event.latlng.lng);
    },
  });
  return <Marker position={position} />;
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
