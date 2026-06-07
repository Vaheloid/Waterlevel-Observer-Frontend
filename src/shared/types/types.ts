import type { ButtonProps } from '@chakra-ui/react';
import type { Feature, Polygon, MultiPolygon, GeoJsonProperties } from 'geojson';
import type { ReactElement, ReactNode } from 'react';
/**
 * Auth Types
 */
export interface FormValues {
    login_user: string;
    password_user: string;
}

export interface LoginResponse {
    user_id: number;
}

export interface LoginFormProps {
    onSubmit: (data: FormValues) => Promise<void>;
    isSubmitting: boolean;
    loginError: string | null;
}

export interface LoginLayoutProps {
    children: ReactNode
}

/**
 * Data Types
 */
export interface Topic {
    id_topic: number;
    name_topic: string;
    path_topic: string; 
    latitude_topic: number;
    longitude_topic: number;
    altitude_topic: number; 
    altitudeSensor_topic: number;
}

export interface TopicAddFormProps {
    onSuccess: (data: Topic) => void;
    initialCoords?: { lat: number; lng: number };
}

export interface TopicAddPanelProps {
    onClose: () => void
    children: React.ReactNode
    isSidebarOpen: boolean
}

export interface TopicChartPanelProps {
    topic: Topic | null
    chartData: ChartDataNode[];
    onClose: () => void
    isListOpen: boolean
    isSidebarOpen: boolean
}

/**
 * Тип ответа для данных графика
 * Эндпоинт: /api-mqtt/data/topics/{id}/data
 */
export type TopicDataResponse = TopicDataItem[];

/**
 * Тип для координат полигона (из эндпоинта /points)
 * Эндпоинт: /api-mqtt/data/topics/{id}/points
 * Ожидается формат: [[lat, lon], [lat, lon], ...]
 */
export type TopicPointsResponse = [number, number][];

/**
 * Если вам все еще нужен общий интерфейс (например, для состояния в React),
 * можно использовать объединяющий тип:
 */
export interface TopicFullState {
    chartData: TopicDataItem[];
    geoPoints: TopicPointsResponse;
}

export interface ChartDataNode {
    displayTime: string;
    value: number | null;
    ema: number | null;
    prediction: number | null;
}

export interface TopicsPanelProps {
    onClose: () => void
    onTopicSelect: (id: number | null) => void
    onTopicDelete: (id: number) => Promise<void>
    selectedTopicId: number | null
    topics: Topic[]
    loading: boolean
    isSidebarOpen: boolean
    isSelectionDisabled: boolean
}

export interface TopicDataItem {
    id_data: number;
    value_data: string;
    time_data: number;
}

export interface EMAItem {
    id_ema: number;
    value_ema: string; // приходит строкой
    time_ema: string;  // приходит ISO датой
}

export interface PredictionItem {
    id_prediction: number;
    value_prediction: string;
    time_prediction: string;
}

/**
 * Component Props
 */
export interface TopicsListProps {
    topics: Topic[];
    loading: boolean;
    selectedTopicId: number | null;
    onTopicSelect: (id: number | null) => void;
    onTopicDelete: (id: number) => Promise<void>;
    isSelectionDisabled: boolean;
}

export type MergedGeoJSON = Feature<Polygon | MultiPolygon, GeoJsonProperties> | null;

export interface MapProps {
    selectedTopicId: number | null;
    topics: Topic[];
    onMapClick?: (lat: number, lng: number) => void;
    isAdding?: boolean;
    mergedGeoJSON: MergedGeoJSON;
}

export interface TopicDeleteProps {
    onTopicDelete: (id: number) => Promise<void>;
    message: string;
}

export interface NavButtonProps extends ButtonProps {
    icon: ReactElement
    label?: string
    isExpanded: boolean
    isActive?: boolean
}

export interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    activePanel: string | null;
    onPanelToggle: (panel: "topics" | "add") => void;
    polygonMode: "hull" | "square"; 
    onPolygonModeToggle: () => void;
}

export type DataPoint = TopicDataItem;

export interface ProcessedDataPoint {
    value_data: number | null;
    time_data: number;
}

export type Point = [number, number];

export interface MapConfigResponse {
    MAP_BOUNDS: [[number, number], [number, number]];
    MAP_CENTER: [number, number];
    MAP_MIN_ZOOM: number;
    MAP_DEFAULT_ZOOM: number;
    MAP_BOUNDS_VISCOSITY: number;
    CONFIG_CHECK_INTERVAL: number;
}