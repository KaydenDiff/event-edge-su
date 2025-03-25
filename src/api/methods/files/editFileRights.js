import {makeRequest} from "@/api/makeRequest.js";

export const editFileRights = async (fileId, email) => {
    const data = await makeRequest(
        `/files/${fileId}/accesses`,
        'POST',
        JSON.stringify({email})
    )

    return data.json()
}