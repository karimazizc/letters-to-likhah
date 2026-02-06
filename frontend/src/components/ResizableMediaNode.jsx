import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'

export default function ResizableMediaNode({
  node,
  updateAttributes,
  deleteNode,
  selected,
  mediaType,
}) {
  const containerRef = useRef(null)
  const mediaRef = useRef(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const { src, alt, title, width, height, align, poster } = node.attrs

  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeDirection(direction)
    setStartPos({ x: e.clientX, y: e.clientY })

    const mediaEl = mediaRef.current
    if (mediaEl) {
      setStartSize({
        width: mediaEl.offsetWidth,
        height: mediaEl.offsetHeight,
      })
    }
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !resizeDirection) return

      const deltaX = e.clientX - startPos.x
      const aspectRatio = startSize.width / startSize.height

      let newWidth = startSize.width

      switch (resizeDirection) {
        case 'bottom-right':
        case 'top-right':
          newWidth = Math.max(100, startSize.width + deltaX)
          break
        case 'bottom-left':
        case 'top-left':
          newWidth = Math.max(100, startSize.width - deltaX)
          break
      }

      const newHeight = newWidth / aspectRatio

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    },
    [isResizing, resizeDirection, startPos, startSize, updateAttributes]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizeDirection(null)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const handleAlignChange = (newAlign) => {
    updateAttributes({ align: newAlign })
  }

  return (
    <NodeViewWrapper
      className={`resizable-media-container ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-align={align}
      ref={containerRef}
    >
      {/* Media Toolbar — visible on select/hover */}
      {selected && (
        <div className="media-toolbar">
          <button
            type="button"
            onClick={() => handleAlignChange('left')}
            className={align === 'left' ? 'active' : ''}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('center')}
            className={align === 'center' ? 'active' : ''}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('right')}
            className={align === 'right' ? 'active' : ''}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={deleteNode} title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Media Element */}
      {mediaType === 'image' ? (
        <img
          ref={mediaRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          style={{
            width: width ? `${width}px` : 'auto',
            height: height ? `${height}px` : 'auto',
          }}
          draggable={false}
        />
      ) : (
        <video
          ref={mediaRef}
          src={src}
          poster={poster}
          controls
          playsInline
          style={{
            width: width ? `${width}px` : 'auto',
            height: height ? `${height}px` : 'auto',
          }}
          draggable={false}
        />
      )}

      {/* Resize Handles */}
      {selected && (
        <>
          <div
            className="resize-handle top-left"
            onMouseDown={(e) => handleMouseDown(e, 'top-left')}
          />
          <div
            className="resize-handle top-right"
            onMouseDown={(e) => handleMouseDown(e, 'top-right')}
          />
          <div
            className="resize-handle bottom-left"
            onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
          />
          <div
            className="resize-handle bottom-right"
            onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}
