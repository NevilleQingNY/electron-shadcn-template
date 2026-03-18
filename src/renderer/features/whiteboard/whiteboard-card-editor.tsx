import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Strikethrough } from 'lucide-react'
import { Toggle } from 'renderer/components/ui/toggle'

interface CardEditorProps {
  content: string
  isEditable: boolean
  onCommit: (content: string) => void
}

const extensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Placeholder.configure({ placeholder: 'Start typing...' }),
]

function safeParseTiptapContent(content: string): object | undefined {
  if (!content) return undefined
  try {
    return JSON.parse(content)
  } catch {
    return undefined
  }
}

export function WhiteboardCardEditor({
  content,
  isEditable,
  onCommit,
}: CardEditorProps) {
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit

  const editor = useEditor({
    extensions,
    content: safeParseTiptapContent(content),
    immediatelyRender: false,
    editable: isEditable,
    onBlur({ editor: blurredEditor }) {
      const json = JSON.stringify(blurredEditor.getJSON())
      onCommitRef.current(json)
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(isEditable)
    if (isEditable) {
      editor.commands.focus('end')
    }
  }, [editor, isEditable])

  if (!editor) return null

  return (
    <div onPointerDown={isEditable ? e => e.stopPropagation() : undefined}>
      {isEditable && (
        <BubbleMenu
          className="flex items-center gap-0.5 rounded-lg border bg-popover p-0.5 shadow-sm"
          editor={editor}
          onMouseDown={e => e.preventDefault()}
        >
          <Toggle
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            pressed={editor.isActive('bold')}
            size="sm"
          >
            <Bold className="size-3.5" />
          </Toggle>
          <Toggle
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            pressed={editor.isActive('italic')}
            size="sm"
          >
            <Italic className="size-3.5" />
          </Toggle>
          <Toggle
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            pressed={editor.isActive('strike')}
            size="sm"
          >
            <Strikethrough className="size-3.5" />
          </Toggle>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
