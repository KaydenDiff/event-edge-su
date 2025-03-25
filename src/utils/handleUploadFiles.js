import {uploadFiles} from "@/api/methods/files/uploadFiles.js";

export const handleUploadFiles = async (files) => {
    const formData = new FormData()

    for (let i = 0; i < files.length; i++)
        formData.append(`files[${i}]`, files[i])


    return uploadFiles(formData)
}