import {makeRequest} from "@/api/makeRequest.js";

export const authorization = async (email, password) => {
    const response = await makeRequest(
        '/login',
        'POST',
        JSON.stringify({
            password,
            email
        })
    )

    return response.json()
}
