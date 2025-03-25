import {makeRequest} from "@/api/makeRequest.js";

export const downloadFile = async (fileId) => {
    const data = await makeRequest(
        `/files/${fileId}`,
        'GET'
    )

    return data.blob()
}