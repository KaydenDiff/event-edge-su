import {makeRequest} from "@/api/makeRequest.js";

export const deleteFile = async (fileId) => {
    const data = await makeRequest(
        `/files/${fileId}`,
        'DELETE',
    )

    return data.json()
}