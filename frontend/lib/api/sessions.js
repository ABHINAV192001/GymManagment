import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { CHAT_API_BASE_URL } from './config';

export const createSession = async (sessionData) => {
    return apiPost('/api/sessions', sessionData, { baseUrl: CHAT_API_BASE_URL });
};

export const getSession = async (id) => {
    return apiGet(`/api/sessions/${id}`, {}, { baseUrl: CHAT_API_BASE_URL });
};

export const voteSession = async (sessionId, vote, username) => {
    return apiRequest(`http://localhost:8082/api/sessions/${sessionId}/vote?vote=${vote}&username=${username}`, {
        method: 'POST'
    });
};

export const getSessions = async (query = {}) => {
    return apiGet('/api/sessions', query, { baseUrl: CHAT_API_BASE_URL });
};

export const updateSession = async (id, sessionData) => {
    return apiPut(`/api/sessions/${id}`, sessionData, { baseUrl: CHAT_API_BASE_URL });
};

export const deleteSession = async (id) => {
    return apiDelete(`/api/sessions/${id}`, { baseUrl: CHAT_API_BASE_URL });
};
