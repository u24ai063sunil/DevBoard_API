import api from './axios'

export const uploadAttachment = async (projectId, taskId, file) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post(
    `/projects/${projectId}/tasks/${taskId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data
}

export const deleteAttachment = async (taskId, attachmentId) => {
  const res = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  return res.data
}