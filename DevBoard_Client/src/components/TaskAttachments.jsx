import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadAttachment, deleteAttachment } from '../api/tasks'

const TaskAttachments = ({ task, projectId }) => {
  const queryClient  = useQueryClient()
  const fileInputRef = useRef(null)
  const [uploading,  setUploading]  = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error,      setError]      = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError('File must be under 5MB')
    setUploading(true)
    setError('')
    try {
      await uploadAttachment(projectId, task._id, file)
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (attachmentId, filename) => {
    if (!window.confirm('Delete ' + filename + '?')) return
    setDeletingId(attachmentId)
    try {
      await deleteAttachment(task._id, attachmentId)
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    } catch (err) {
      setError('Failed to delete attachment')
    } finally {
      setDeletingId(null)
    }
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '[img]'
    if (ext === 'pdf') return '[pdf]'
    if (['doc', 'docx'].includes(ext)) return '[doc]'
    return '[file]'
  }

  const attachments = task.attachments || []

  return (
    <div className="mt-3">
      {attachments.length > 0 && (
        <div className="space-y-1 mb-2">
          {attachments.map((att) => (
            <div key={att._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition flex-1 min-w-0">
                <span>{getFileIcon(att.filename)}</span>
                <span className="truncate">{att.filename}</span>
              </a>
              <button onClick={() => handleDelete(att._id, att.filename)} disabled={deletingId === att._id} className="text-gray-600 hover:text-red-400 transition ml-2 shrink-0 text-sm">
                {deletingId === att._id ? '...' : 'x'}
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="text-xs text-gray-500 hover:text-indigo-400 transition">
        {uploading ? 'Uploading...' : '+ Add attachment'}
      </button>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,application/pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
    </div>
  )
}

export default TaskAttachments