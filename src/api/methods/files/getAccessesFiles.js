import {makeRequest} from "@/api/makeRequest.js";

export const getAccessesFiles = async () => {
    const data = await makeRequest(`/files/shared`)

    return data.json()
}