// import { calculateEMA } from '@/shared';
import type { ChartDataNode, TopicDataItem, EMAItem, PredictionItem } from '../types/types';

export function chartUtils(
    rawData: TopicDataItem[] = [],
    emaData: EMAItem[] = [],
    predictionData: PredictionItem[] = []
): ChartDataNode[] {
    if (!rawData || rawData.length === 0) {
        return [];
    }

    const timeline = new Map<number, { v?: number; e?: number; p?: number }>();

    // Обработка данных из API
    rawData.forEach(item => {
        const ts = new Date(item.time_data).getTime();
        timeline.set(ts, { ...timeline.get(ts), v: parseFloat(item.value_data) });
    });

    emaData.forEach(item => {
        const ts = new Date(item.time_ema).getTime();
        timeline.set(ts, { ...timeline.get(ts), e: parseFloat(item.value_ema) });
    });

    predictionData.forEach(item => {
        const ts = new Date(item.time_prediction).getTime();
        timeline.set(ts, { ...timeline.get(ts), p: parseFloat(item.value_prediction) });
    });

    const sortedTimestamps = Array.from(timeline.keys()).sort((a, b) => a - b);

    // ================= НАЧАЛО ЛОГИКИ СОЕДИНЕНИЯ ЛИНИЙ =================
    // 1. Ищем самый последний таймстамп, в котором есть значение EMA
    let lastEmaTs: number | null = null;
    for (let i = sortedTimestamps.length - 1; i >= 0; i--) {
        const ts = sortedTimestamps[i];
        if (timeline.get(ts)?.e !== undefined && timeline.get(ts)?.e !== null) {
            lastEmaTs = ts;
            break;
        }
    }

    // 2. Если нашли, то дублируем значение EMA в поле prediction для этой же точки.
    // Теперь линия прогноза начнется ровно из "хвоста" скользящей средней.
    if (lastEmaTs !== null) {
        const node = timeline.get(lastEmaTs)!;
        if (node.p === undefined || node.p === null) {
            node.p = node.e; 
        }
    }
    // ================= КОНЕЦ ЛОГИКИ СОЕДИНЕНИЯ ЛИНИЙ =================

    return sortedTimestamps.map(ts => {
        const date = new Date(ts);
        const data = timeline.get(ts)!;
        const formatted = date.toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'UTC',
        });

        return {
            displayTime: formatted,
            value: data.v ?? null,
            ema: data.e ?? null,
            prediction: data.p ?? null,
        };
    });
}