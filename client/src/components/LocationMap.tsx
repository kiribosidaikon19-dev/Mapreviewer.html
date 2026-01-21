import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { type Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";

// Fix for default Leaflet icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  locations: Location[];
  selectedLocationId: number | null;
  onSelectLocation: (id: number) => void;
  onAddLocationClick: (lat: number, lng: number) => void;
}

// Component to handle map clicks for adding new locations
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly to selected location
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export function LocationMap({ 
  locations, 
  selectedLocationId, 
  onSelectLocation,
  onAddLocationClick 
}: LocationMapProps) {
  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude] 
    : [37.3989, 140.3881]; // Koriyama City, Fukushima, Japan

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        minZoom={5}
        maxBounds={[[20, 122], [46, 154]]}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <MapClickHandler onMapClick={onAddLocationClick} />
        <MapUpdater center={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : null} />

        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]}
            eventHandlers={{
              click: () => onSelectLocation(loc.id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-display font-bold text-base mb-1">{loc.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{loc.description}</p>
                <Button 
                  size="sm" 
                  className="w-full h-8 text-xs"
                  onClick={() => onSelectLocation(loc.id)}
                >
                  詳細を表示
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Action Button for hint */}
      <div className="absolute top-4 left-4 z-[400] bg-card/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border/50 text-xs font-medium text-foreground flex items-center gap-2 pointer-events-none">
        <MapPin className="h-3 w-3 text-primary" />
        地図上のどこかをクリックして場所を追加
      </div>
    </div>
  );
}
