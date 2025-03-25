import {downloadFile} from "@/api/methods/files/downloadFile.js";

export const handleDownloadFile = async (file) => {
    const data = await downloadFile(file.file_id)

    const a = document.createElement('a')
    a.href = URL.createObjectURL(data)
    a.download = file.name
    a.click()
}