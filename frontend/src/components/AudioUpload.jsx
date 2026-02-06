import { useState, useRef } from 'react'
import { Upload, X, Music, Play, Pause, Loader } from 'lucide-react'

function AudioUpload({ file, onChange, maxSize = 20 }) {
  const [uploading, setUploading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)
  const audioRef = useRef(null)

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, etc.)')
      return
    }

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)

    try {
      const base64 = await fileToBase64(selectedFile)
      onChange({
        id: crypto.randomUUID(),
        name: selectedFile.name,
        type: 'audio',
        size: selectedFile.size,
        url: base64,
        file: selectedFile,
      })
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file')
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

  const removeFile = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    onChange(null)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
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
      handleFile(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (file) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center gap-4">
          {/* Play Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 flex-shrink-0 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={removeFile}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          src={file.url}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* Waveform Placeholder */}
        <div className="mt-3 h-12 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-purple-400 rounded-full"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: isPlaying ? 1 : 0.5,
                  animation: isPlaying ? `wave 0.5s ease-in-out ${i * 0.02}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes wave {
            from { transform: scaleY(1); }
            to { transform: scaleY(0.5); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? 'border-purple-400 bg-purple-50'
          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm text-gray-500">Processing audio...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Music className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-purple-600 font-medium hover:underline"
            >
              Upload MP3
            </button>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-400">
            MP3, WAV, OGG, M4A up to {maxSize}MB
          </p>
        </div>
      )}
    </div>
  )
}

export default AudioUpload
