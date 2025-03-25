import {makeRequest} from "@/api/makeRequest.js";

export const uploadFiles = async (formData) => {
    const data = await makeRequest('/files', 'POST', formData)

    return data.json()
}