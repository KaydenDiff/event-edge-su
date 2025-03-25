import {makeRequest} from "@/api/makeRequest.js";

export const logOut = async () => makeRequest('/logout')