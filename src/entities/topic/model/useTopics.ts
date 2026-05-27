import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopics } from '@/shared';
import type { Topic } from '@/shared/types/types';

interface ConfigResponse {
    TOPICS_REFETCH_INTERVAL: number | false;
    CONFIG_CHECK_INTERVAL: number;
}

export const useTopics = (enabled: boolean = false) => {
    /**
     * 1. Загрузка конфигурации.
     * Чтобы использовать интервал из самого себя, передаем функцию,
     * которая принимает текущее состояние query из кэша.
     */
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

    /**
     * 2. Вычисляем интервал для топиков «на лету» прямо во время рендера.
     * Если данных еще нет, берем дефолтные 10000.
     */
    const topicsInterval = configQuery.data?.TOPICS_REFETCH_INTERVAL ?? 10000;

    /**
     * 3. Основной запрос топиков.
     * React Query мгновенно среагирует, как только изменится topicsInterval.
     */
    const query = useQuery<Topic[]>({
        queryKey: ['topics'],
        queryFn: fetchTopics,
        enabled: enabled,
        refetchInterval: topicsInterval,
        refetchOnMount: true,
        refetchOnWindowFocus: true
    });

    // Логирование
    useEffect(() => {
        if (query.data) {
            console.log("Данные списка топиков обновлены:", query.data);
        }
    }, [query.data]);

    useEffect(() => {
        if (configQuery.error) {
            console.error("Ошибка при получении Config в useTopics: ", configQuery.error);
        }
    }, [configQuery.error]);

    return { 
        topics: query.data ?? [], 
        loading: query.isLoading || query.isFetching, 
        loadData: query.refetch
    };
};