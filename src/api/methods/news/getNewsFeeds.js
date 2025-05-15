import { makeRequest } from "@/api/makeRequest.js";

export const getNewsFeeds = async () => {
    try {
    const response = await makeRequest(`/guest/news-feeds`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error; // Пробрасываем ошибку для обработки в компоненте
  }
};