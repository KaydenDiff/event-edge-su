import {makeRequest} from "@/api/makeRequest.js";

export const deleteRight = async (fileId, email) => {
    const data = await makeRequest(
        `/files/${fileId}/accesses`,
        'DELETE',
        JSON.stringify({ email })
    )

    return data.json()
}
