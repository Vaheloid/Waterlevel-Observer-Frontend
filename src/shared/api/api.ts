import axios from "axios";
import type { Topic, FormValues, LoginResponse, TopicDeleteProps, TopicDataResponse, TopicPointsResponse, PredictionItem, EMAItem } from "@/shared/types/types";

const api = axios.create({
    baseURL: '/api-mqtt',
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

export const loginUser = async (data: FormValues): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
};

export const logoutUser = async (data: FormValues): Promise<LoginResponse> => {
    const response = await api.post('/auth/logout', data);
    return response.data;
};

export const fetchTopics = async (): Promise<Topic[]> => {
    const response = await api.get<Topic[]>('/data/topics');
    return response.data;
};

export const fetchTopicData = async (id: number, limit: number = 25): Promise<TopicDataResponse> => {
    const response = await api.get<TopicDataResponse>(`/data/topics/${id}/data`, {
        params: { limit }
    });
    return response.data;
};

export const fetchTopicPoints = async (id: number): Promise<TopicPointsResponse> => {
    const response = await api.get<TopicPointsResponse>(`/data/topics/${id}/points`);
    return response.data;
};


export const fetchTopicEma = async (id: number): Promise<EMAItem[]> => {
    const response = await api.get<EMAItem[]>(`/data/topics/${id}/ema`);
    return response.data;
};

export const fetchTopicPrediction = async (id: number): Promise<PredictionItem[]> => {
    const response = await api.get<PredictionItem[]>(`/data/topics/${id}/prediction`);
    return response.data;
};

export const addTopic = async (topic: Topic): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/data/topics/add', topic);
    return response.data;
};

export const deleteTopic = async (id: number): Promise<TopicDeleteProps> => {
    const response = await api.delete(`/data/topics/${id}`);
    return response.data;
};