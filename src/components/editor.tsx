"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
} from "lucide-react";

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const [uploading, setUploading] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 w-full",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (content === currentHTML) return;

    const trimmed = (content || "").trim();
    const isHTML = trimmed.startsWith("<") && trimmed.includes(">");
    const parsed = isHTML ? content : (marked.parse(content) as string);

    if (parsed !== currentHTML) {
      editor.commands.setContent(parsed);
    }
  }, [content, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      console.error("Error uploading image:", err);
      // Fallback: prompt for URL
      const url = window.prompt("Upload failed. Enter image URL instead:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md bg-background overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="bg-muted/50 border-b p-1 flex flex-wrap gap-1 items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-muted" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-muted" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("strike") ? "bg-muted" : ""}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("codeBlock") ? "bg-muted" : ""}`}
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 w-8 p-0 font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 w-8 p-0 font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-8 w-8 p-0 font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}`}
        >
          H3
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-muted" : ""}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("blockquote") ? "bg-muted" : ""}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        <div className="relative inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${uploading ? 'opacity-50' : ''}`}
          >
            <label className="cursor-pointer w-full h-full flex items-center justify-center">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <ImageIcon className="h-4 w-4" />
            </label>
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1 ml-auto" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 cursor-text bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
