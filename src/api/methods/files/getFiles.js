import {makeRequest} from "@/api/makeRequest.js";

export const getFiles = async () => {
    const data = await makeRequest(`/files/disk`)

    return data.json()
}