import { useQuery } from '@tanstack/react-query';
import { 
    fetchTopicData, 
    fetchTopicEma, 
    fetchTopicPrediction, 
    fetchTopicPoints, 
    processCoordinatesToHull, 
    processCoordinatesToSquares,
    chartUtils 
} from '@/shared'; 
import type { ChartDataNode, TopicDataResponse, EMAItem, PredictionItem } from '@/shared/types/types';
import { useEffect, useMemo, useRef } from 'react';

interface ConfigResponse {
    TOPIC_FULLDATA_REFETCH_INTERVAL: number | false;
    CONFIG_CHECK_INTERVAL: number;
}

export const useTopicData = (selectedTopicId: number | null, mode: "hull" | "square" = "hull") => {
    
    // Запрос конфига с динамическим интервалом через функцию
    const configQuery = useQuery<ConfigResponse>({
        queryKey: ['globalConfig'],
        queryFn: async () => {
            const response = await fetch(`/config.json?t=${Date.now()}`);
            if (!response.ok) throw new Error("Config not found");
            return response.json();
        },
        refetchInterval: (query) => query.state.data?.CONFIG_CHECK_INTERVAL ?? 30000,
        staleTime: 0,
    });

    // Получаем интервал для запросов данных топика (вычисляемое состояние)
    const topicsDataAndPointsRefetchInterval = configQuery.data?.TOPIC_FULLDATA_REFETCH_INTERVAL ?? 10000;

    // Основные запросы данных
    const query = useQuery<TopicDataResponse>({
        queryKey: ['topicData', selectedTopicId],
        queryFn: async () => fetchTopicData(selectedTopicId!),
        enabled: !!selectedTopicId,
        refetchInterval: topicsDataAndPointsRefetchInterval,
    });

    const emaQuery = useQuery<EMAItem[]>({
        queryKey: ['topicEma', selectedTopicId],
        queryFn: async () => fetchTopicEma(selectedTopicId!),
        enabled: !!selectedTopicId,
        refetchInterval: topicsDataAndPointsRefetchInterval,
    });

    const predictionQuery = useQuery<PredictionItem[]>({
        queryKey: ['topicPrediction', selectedTopicId],
        queryFn: async () => fetchTopicPrediction(selectedTopicId!),
        enabled: !!selectedTopicId,
        refetchInterval: topicsDataAndPointsRefetchInterval,
    });

    const pointsQuery = useQuery<[number, number][]>({
        queryKey: ['topicPoints', selectedTopicId],
        queryFn: async () => fetchTopicPoints(selectedTopicId!),
        enabled: !!selectedTopicId,
        refetchInterval: topicsDataAndPointsRefetchInterval,
    });

    // Логирование и проверка данных
    const lastLoggedDataRef = useRef<string | null>(null);

    useEffect(() => {
        const currentDataFingerprint = JSON.stringify({
            id: selectedTopicId,
            data: query.data,
            points: pointsQuery.data,
            ema: emaQuery.data,
            prediction: predictionQuery.data
        });

        if (!query.isSuccess || !pointsQuery.isSuccess || lastLoggedDataRef.current === currentDataFingerprint) {
            return;
        }

        const isTopicDataEmpty = !query.data || (Array.isArray(query.data) && query.data.length === 0);
        let isChartDataEmpty = false;

        if (!isTopicDataEmpty && query.data) {
            console.log("Данные топика получены: ", query.data);
            try {
                const processed = chartUtils(query.data, emaQuery.data, predictionQuery.data);
                isChartDataEmpty = !processed || processed.length === 0;
                if (!isChartDataEmpty) {
                    console.log("График сформирован: ", processed);
                }
            } catch (e) {
                console.error("Ошибка при расчете графика для лога:", e);
                isChartDataEmpty = true;
            }
        }

        if (isTopicDataEmpty || isChartDataEmpty) {
            console.warn(`Данные (data) отсутствуют для топика с ID: ${selectedTopicId}`);
        }

        if (!pointsQuery.data || pointsQuery.data.length === 0) {
            console.warn(`Данные (points) отсутствуют для топика с ID: ${selectedTopicId}`);
        } else {
            try {
                let displayPoints = pointsQuery.data;
                if (typeof displayPoints === 'string') {
                    displayPoints = JSON.parse(`[${displayPoints}]`);
                }
                console.log('Координаты успешно распарсены: ', displayPoints);
            } catch (e) {
                console.error("Ошибка парсинга координат:", e);
            }
        }

        lastLoggedDataRef.current = currentDataFingerprint;
    }, [query.data, query.isSuccess, pointsQuery.data, pointsQuery.isSuccess, emaQuery.data, predictionQuery.data, selectedTopicId]);

    // Трансформация данных для UI
    const result = useMemo(() => {
        const data = query.data;
        const emaData = emaQuery.data;
        const predData = predictionQuery.data;
        const pointsData = pointsQuery.data;

        if (!data && !emaData && !predData) {
            return { mergedGeoJSON: null, chartData: [] as ChartDataNode[] };
        }

        let processedChartData: ChartDataNode[] = [];
        let processedGeoJSON = null;

        try {
            processedChartData = chartUtils(data || [], emaData || [], predData || []);
        } catch (err) {
            console.error("Ошибка при обработке данных графика:", err);
        }

        try {
            if (pointsData) {
                const rawCoords = pointsData;
                let parsedCoords: [number, number][] = [];

                if (Array.isArray(rawCoords)) {
                    parsedCoords = rawCoords;
                } else if (typeof rawCoords === 'string') {
                    const validJsonString = `[${rawCoords}]`;
                    parsedCoords = JSON.parse(validJsonString);
                }

                if (parsedCoords.length > 0) {
                    processedGeoJSON = mode === "square" 
                        ? processCoordinatesToSquares(parsedCoords) 
                        : processCoordinatesToHull(parsedCoords);
                }
            }
        } catch (err) {
            console.error('Ошибка при парсинге геометрии:', err);
        }

        return {
            mergedGeoJSON: processedGeoJSON,
            chartData: processedChartData
        };
    }, [query.data, emaQuery.data, predictionQuery.data, pointsQuery.data, mode]);

    // Обработка ошибок в консоль
    useEffect(() => {
        if (configQuery.error) console.error("Ошибка при получении Config: ", configQuery.error);
        if (query.error) console.error("Ошибка при получении TopicData: ", query.error);
        if (emaQuery.error) console.error("Ошибка при получении EMA: ", emaQuery.error);
        if (predictionQuery.error) console.error("Ошибка при получении Prediction: ", predictionQuery.error);
        if (pointsQuery.error) console.error("Ошибка при получении Points: ", pointsQuery.error);
    }, [configQuery.error, query.error, emaQuery.error, predictionQuery.error, pointsQuery.error]);

    return { 
        mergedGeoJSON: result.mergedGeoJSON, 
        loadingTopicData: configQuery.isLoading || query.isLoading || emaQuery.isLoading || predictionQuery.isLoading || pointsQuery.isLoading, 
        chartData: result.chartData,
        error: configQuery.error || query.error || emaQuery.error || predictionQuery.error || pointsQuery.error 
    };
};