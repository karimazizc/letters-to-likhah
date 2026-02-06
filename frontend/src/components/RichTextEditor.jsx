import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import ResizableImageExtension from '../lib/ResizableImageExtension'
import ResizableVideoExtension from '../lib/ResizableVideoExtension'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Minus,
  Upload,
  X,
  LinkIcon as UrlIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

function RichTextEditor({ content, onChange, placeholder = 'Start writing...', minHeight = '200px' }) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gray-900 underline',
        },
      }),
      ResizableImageExtension,
      ResizableVideoExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    setImageUrl('')
    setShowImageModal(true)
  }, [editor])

  const insertImageFromUrl = useCallback(() => {
    if (!editor || !imageUrl.trim()) return
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
    setShowImageModal(false)
    setImageUrl('')
  }, [editor, imageUrl])

  const addVideo = useCallback(() => {
    if (!editor) return
    setVideoUrl('')
    setShowVideoModal(true)
  }, [editor])

  const insertVideoFromUrl = useCallback(() => {
    if (!editor || !videoUrl.trim()) return
    editor.chain().focus().setVideo({ src: videoUrl.trim() }).run()
    setShowVideoModal(false)
    setVideoUrl('')
  }, [editor, videoUrl])

  const handleImageFile = useCallback((file) => {
    if (!editor || !file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB')
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      editor.chain().focus().setImage({ src: e.target.result }).run()
      setShowImageModal(false)
      setUploading(false)
    }
    reader.onerror = () => {
      alert('Failed to read image file')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }, [editor])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageFile(file)
    }
  }, [handleImageFile])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageFile(file)
    }
  }, [handleImageFile])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Text Formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Link & Image */}
        <MenuButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addVideo} title="Add Video">
          <Video className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Horizontal Rule */}
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Add Image</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Drag & Drop Upload */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploading ? 'Processing...' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  or click to browse (max 10MB)
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <UrlIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          insertImageFromUrl()
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={insertImageFromUrl}
                    disabled={!imageUrl.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video URL Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Video</h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video URL
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <UrlIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          insertVideoFromUrl()
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={insertVideoFromUrl}
                    disabled={!videoUrl.trim()}
                    className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Direct link to MP4, WebM, or OGG file</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles for editor */}
      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .ProseMirror p {
          margin-bottom: 1em;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          margin-left: 0;
          margin-bottom: 1em;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5em 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .ProseMirror video {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        /* Resizable media container */
        .resizable-media-container {
          position: relative;
          display: inline-block;
          max-width: 100%;
          margin: 1rem 0;
          line-height: 0;
        }
        .resizable-media-container[data-align='left'] {
          display: block;
          text-align: left;
        }
        .resizable-media-container[data-align='center'] {
          display: block;
          text-align: center;
        }
        .resizable-media-container[data-align='center'] img,
        .resizable-media-container[data-align='center'] video {
          margin-left: auto;
          margin-right: auto;
        }
        .resizable-media-container[data-align='right'] {
          display: block;
          text-align: right;
        }
        .resizable-media-container img,
        .resizable-media-container video {
          display: inline-block;
          max-width: 100%;
          border-radius: 0.5rem;
          cursor: default;
        }
        .resizable-media-container.ProseMirror-selectednode img,
        .resizable-media-container.ProseMirror-selectednode video {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Resize handles */
        .resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 10;
          cursor: nwse-resize;
        }
        .resize-handle.top-left {
          top: -6px;
          left: -6px;
          cursor: nwse-resize;
        }
        .resize-handle.top-right {
          top: -6px;
          right: -6px;
          cursor: nesw-resize;
        }
        .resize-handle.bottom-left {
          bottom: -6px;
          left: -6px;
          cursor: nesw-resize;
        }
        .resize-handle.bottom-right {
          bottom: -6px;
          right: -6px;
          cursor: nwse-resize;
        }

        /* Media toolbar */
        .media-toolbar {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 2px;
          padding: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 20;
        }
        .media-toolbar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.15s;
        }
        .media-toolbar button:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .media-toolbar button.active {
          background: #e5e7eb;
          color: #111827;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor
