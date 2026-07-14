'use client';

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { divIcon, type LatLngBounds } from 'leaflet';
import Link from 'next/link';
import type { Task } from '@/types';
import { formatReward } from '@/lib/currency';

type Props = { tasks: Task[]; onBoundsChangeAction: (bounds: LatLngBounds) => void };

const markerIcon = divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:999px;background:#007B63;box-shadow:0 2px 8px #0005"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function BoundsWatcher({ onBoundsChangeAction }: Pick<Props, 'onBoundsChangeAction'>) {
  const map = useMapEvents({ moveend: () => onBoundsChangeAction(map.getBounds()), zoomend: () => onBoundsChangeAction(map.getBounds()) });
  return null;
}

export default function TasksMap({ tasks, onBoundsChangeAction }: Props) {
  return (
    <MapContainer center={[20, 10]} zoom={2} minZoom={2} scrollWheelZoom className="h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <BoundsWatcher onBoundsChangeAction={onBoundsChangeAction} />
      {tasks.filter((task) => task.latitude != null && task.longitude != null).map((task) => (
        <Marker key={task.id} position={[task.latitude!, task.longitude!]} icon={markerIcon}>
          <Popup>
            <Link href={`/tasks/${task.id}`} className="block min-w-40 font-sans">
              <strong>{task.title}</strong><br />
              <span>{task.location} · {formatReward(task.reward, task.currency)}</span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
