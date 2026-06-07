import { Marker, Popup, GeoJSON, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { MapConfigResponse, MapProps } from "@/shared/types/types";
import { RecenterMap } from "@/shared";
import { lazy, useEffect, useMemo } from "react";
import L from 'leaflet';
import { useQuery } from "@tanstack/react-query";

import myCustomIconUrl from '@/shared/assets/icons/waterlevel_logo22_black.png';

const MapContainer = lazy(() =>
  import("react-leaflet").then((module) => ({ default: module.MapContainer }))
);
const TileLayer = lazy(() =>
  import("react-leaflet").then((module) => ({ default: module.TileLayer }))
);

const DefaultIcon = L.icon({
    iconUrl: myCustomIconUrl,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export function Map({ selectedTopicId, topics, onMapClick, isAdding, mergedGeoJSON }: MapProps) {
    const currentTopicInfo = topics.find(t => t.id_topic === selectedTopicId);

    const configQuery = useQuery<MapConfigResponse>({
        queryKey: ['globalConfig'],
        queryFn: async () => {
            const response = await fetch(`/config.json?t=${Date.now()}`);
            if (!response.ok) throw new Error("Config not found");
            return response.json();
        },
        refetchInterval: (query) => query.state.data?.CONFIG_CHECK_INTERVAL ?? 30000,
        staleTime: 0,
    });

    useEffect(() => {
        if (configQuery.error) {
            console.error("Ошибка при динамическом получении Config в Map: ", configQuery.error);
        }
    }, [configQuery.error]);

    // Формат: [[ЮжнаяШирота, ЗападнаяДолгота], [СевернаяШирота, ВосточнаяДолгота]]
    // Юго-запад: Юг Дагестана / Балтийская коса в Калининграде
    // Северо-восток: Мыс Флигели / Чукотка с запасом за 180°
    const mapBounds = useMemo(() => {
        return configQuery.data?.MAP_BOUNDS ?? ([[41.18, 19.63], [81.85, 190.0]] as [[number, number], [number, number]]);
    }, [configQuery.data]);

    const mapCenter = useMemo(() => {
        return configQuery.data?.MAP_CENTER ?? ([54.735141, 55.958726] as [number, number]);
    }, [configQuery.data]);

    /**
     * Динамический ключ для реактивного обновления карты при изменении config.json на проде.
     * React Compiler пропустит и оптимизирует этот хук, так как зависимость — чистый configQuery.data.
     */
    const mapKey = useMemo(() => {
        if (!configQuery.data) return "initial-map-key";
        return `map-${configQuery.data.MAP_MIN_ZOOM}-${configQuery.data.MAP_DEFAULT_ZOOM}-${configQuery.data.MAP_BOUNDS_VISCOSITY}-${JSON.stringify(configQuery.data.MAP_BOUNDS)}`;
    }, [configQuery.data]);

    const minZoom = configQuery.data?.MAP_MIN_ZOOM ?? 7;
    const defaultZoom = configQuery.data?.MAP_DEFAULT_ZOOM ?? 12;
    const boundsViscosity = configQuery.data?.MAP_BOUNDS_VISCOSITY ?? 1.0;

    return (
        <MapContainer 
            key={mapKey} // Передаем сгенерированный ключ для сброса инстанса Leaflet
            style={{ height: "100vh", width: "100%" }} 
            center={mapCenter}
            zoom={defaultZoom}
            minZoom={minZoom} 

            maxBounds={mapBounds}
            maxBoundsViscosity={boundsViscosity}

            zoomControl={false}
            attributionControl={false}
            preferCanvas={true}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {isAdding && onMapClick && <MapClickHandler onMapClick={onMapClick} />}

            {currentTopicInfo && (
                <RecenterMap 
                    lat={currentTopicInfo.latitude_topic} 
                    lng={currentTopicInfo.longitude_topic} 
                />
            )}

            {mergedGeoJSON && (
                <GeoJSON 
                    key={JSON.stringify(mergedGeoJSON)} 
                    data={mergedGeoJSON}
                    style={{
                        color: 'red',
                        fillColor: '#ff6363',
                        fillOpacity: 0.25,
                        weight: 1.1
                    }}
                />
            )}

            {topics && topics.length > 0 && topics.map((topic) => (
                <Marker key={topic.id_topic} position={[topic.latitude_topic, topic.longitude_topic]} icon={DefaultIcon}>
                    <Popup>{topic.name_topic}</Popup>
                    <Tooltip>
                        {topic.name_topic}
                    </Tooltip>
                </Marker>
            ))}
        </MapContainer>
    );
}