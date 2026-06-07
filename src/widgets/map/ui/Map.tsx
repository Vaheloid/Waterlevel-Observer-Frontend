import { Marker, Popup, GeoJSON, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { MapProps } from "@/shared/types/types";
import { RecenterMap } from "@/shared";
import { lazy } from "react";
import L from 'leaflet';
//import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
//import markerIcon from 'leaflet/dist/images/marker-icon.png';
//import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import myCustomIconUrl from '@/shared/assets/icons/waterlevel_logo22_black.png';

const MapContainer = lazy(() =>
  import("react-leaflet").then((module) => ({ default: module.MapContainer }))
);
const TileLayer = lazy(() =>
  import("react-leaflet").then((module) => ({ default: module.TileLayer }))
);

// Создаем экземпляр дефолтной иконки вручную
const DefaultIcon = L.icon({
    iconUrl: myCustomIconUrl,
    //shadowUrl: markerShadow,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
    //shadowSize: [41, 41]
});

// Устанавливаем ее как стандартную для всех маркеров
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

    // Формат: [[ЮжнаяШирота, ЗападнаяДолгота], [СевернаяШирота, ВосточнаяДолгота]]
    const mapBounds: [[number, number], [number, number]] = [
        [41.18, 19.63],   // Юго-запад: Юг Дагестана / Балтийская коса в Калининграде
        [81.85, 190.0]    // Северо-восток: Мыс Флигели / Чукотка с запасом за 180° меридианом
    ];

    return (
        <MapContainer 
            style={{ height: "100vh", width: "100%" }} 
            center={[54.735141, 55.958726]}
            zoom={12}
            minZoom={5} 

            maxBounds={mapBounds}
            maxBoundsViscosity={0.5}

            zoomControl={false} 
            attributionControl={false}
            preferCanvas={true}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Активируем обработчик кликов только в режиме добавления */}
            {isAdding && onMapClick && <MapClickHandler onMapClick={onMapClick} />}

            {/* Центрирование */}
            {currentTopicInfo && (
                <RecenterMap 
                    lat={currentTopicInfo.latitude_topic} 
                    lng={currentTopicInfo.longitude_topic} 
                />
            )}

            {/* Полигон из кастомного хука */}
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

            {/* Маркер */}
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