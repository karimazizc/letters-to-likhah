import { useState, useRef } from 'react'
import { Upload, X, Image, Film, Music, FileText, Loader } from 'lucide-react'

const FILE_TYPES = {
  image: {
    accept: 'image/*',
    icon: Image,
    label: 'Images',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  video: {
    accept: 'video/*',
    icon: Film,
    label: 'Videos',
    extensions: ['mp4', 'webm', 'mov', 'avi'],
  },
  audio: {
    accept: 'audio/*',
    icon: Music,
    label: 'Audio',
    extensions: ['mp3', 'wav', 'ogg', 'm4a'],
  },
  all: {
    accept: 'image/*,video/*',
    icon: FileText,
    label: 'Media',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'],
  },
}

function FileUpload({
  type = 'all',
  multiple = true,
  files = [],
  onChange,
  maxSize = 50, // MB
  maxFiles = 10,
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const fileType = FILE_TYPES[type] || FILE_TYPES.all
  const IconComponent = fileType.icon

  const handleFiles = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles)
    
    // Validate file count
    if (files.length + fileList.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file sizes
    const oversizedFiles = fileList.filter(f => f.size > maxSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the ${maxSize}MB limit`)
      return
    }

    setUploading(true)

    try {
      // Convert files to base64 for preview and storage
      // In production, you'd upload to a server/cloud storage here
      const newFiles = await Promise.all(
        fileList.map(async (file) => {
          const base64 = await fileToBase64(file)
          const fileType = getFileType(file)
          return {
            id: crypto.randomUUID(),
            name: file.name,
            type: fileType,
            size: file.size,
            url: base64,
            file: file, // Keep original file for potential server upload
          }
        })
      )

      onChange([...files, ...newFiles])
    } catch (error) {
      console.error('Error processing files:', error)
      alert('Error processing files')
    } finally {
      setUploading(false)
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'other'
  }

  const removeFile = (id) => {
    onChange(files.filter(f => f.id !== id))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={fileType.accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500">Processing files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-gray-900 font-medium hover:underline"
              >
                Click to upload
              </button>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-400">
              {fileType.extensions.join(', ').toUpperCase()} up to {maxSize}MB
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>
        )}
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group bg-gray-100 rounded-lg overflow-hidden"
            >
              {/* Preview */}
              {file.type === 'image' && (
                <div className="aspect-square">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {file.type === 'video' && (
                <div className="aspect-square relative">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Film className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {file.type === 'audio' && (
                <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  <Music className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-xs text-gray-600 px-2 text-center truncate w-full">
                    {file.name}
                  </p>
                </div>
              )}

              {/* File Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{file.name}</p>
                <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
