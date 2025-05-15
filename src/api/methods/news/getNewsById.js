import { makeRequest } from "@/api/makeRequest.js";

export const getNewsById = async (slug) => {
    try {
      return await makeRequest(`/guest/news-feeds/${slug}`);
    } catch (error) {
      console.error('Error fetching news by slug:', error);
      throw error;
    }
  };