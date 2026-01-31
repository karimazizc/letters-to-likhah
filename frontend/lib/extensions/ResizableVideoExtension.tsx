'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableMediaNode from '@/components/ResizableMediaNode'

export interface ResizableVideoOptions {
  inline: boolean
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableVideo: {
      setVideo: (options: {
        src: string
        width?: number
        height?: number
        poster?: string
      }) => ReturnType
    }
  }
}

const ResizableVideoNode = (props: any) => (
  <ResizableMediaNode {...props} mediaType="video" />
)

export const ResizableVideoExtension = Node.create<ResizableVideoOptions>({
  name: 'resizableVideo',

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      poster: {
        default: null,
      },
      align: {
        default: 'center',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: true,
        playsinline: true,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableVideoNode)
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

export default ResizableVideoExtension
