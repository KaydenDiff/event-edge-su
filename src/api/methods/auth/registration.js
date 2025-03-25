import {makeRequest} from "@/api/makeRequest.js";

export const registration = async (email, password, first_name, last_name) => {
    const response = await makeRequest(
        '/registration',
        'POST',
        JSON.stringify({
            first_name,
            last_name,
            password,
            email
        })
    )

    return response.json()
}
