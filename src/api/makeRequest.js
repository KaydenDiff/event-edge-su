import { API_URL } from "@/config";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const makeRequest = async (path, method = 'GET', body = undefined) => {
  const user = JSON.parse(localStorage.getItem('user'));
const token = user?.token;
  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = body ? JSON.stringify(body) : undefined;
  }

  try {
    const response = await fetch(API_URL + path, {
      method,
      headers,
      body
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};