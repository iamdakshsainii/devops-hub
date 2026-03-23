"use client";

import * as React from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { keymap } from "@tiptap/pm/keymap";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  Bold, Italic, Strikethrough, Code,
  List, ListOrdered, Quote,
  Undo, Redo, ImageIcon, Table2, ChevronRight, FileCode, Eye,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
  action: (editor: any, imageInputRef: React.RefObject<HTMLInputElement | null>) => void;
}

interface SlashMenuState {
  visible: boolean;
  x: number;
  y: number;
  rangeStart: number; // doc position right after the "/"
  query: string;      // text typed after "/"
}

const CLOSED: SlashMenuState = { visible: false, x: 0, y: 0, rangeStart: 0, query: "" };

// ── Command list ───────────────────────────────────────────────────────────

const COMMANDS: SlashCommand[] = [
  { id: "h1", label: "Heading 1", description: "Large section heading", icon: "H1", keywords: ["h1", "heading", "title"], action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: "h2", label: "Heading 2", description: "Medium section heading", icon: "H2", keywords: ["h2", "heading", "subtitle"], action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: "h3", label: "Heading 3", description: "Small section heading", icon: "H3", keywords: ["h3", "heading"], action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: "bullet", label: "Bullet List", description: "Simple unordered list", icon: "•—", keywords: ["bullet", "list", "ul"], action: (e) => e.chain().focus().toggleBulletList().run() },
  { id: "ordered", label: "Numbered List", description: "Ordered numbered list", icon: "1.", keywords: ["numbered", "ordered", "ol"], action: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: "quote", label: "Quote", description: "Capture a quote or callout", icon: "❝", keywords: ["quote", "blockquote", "callout"], action: (e) => e.chain().focus().toggleBlockquote().run() },
  { id: "code", label: "Code Block", description: "Code snippet with syntax", icon: "</>", keywords: ["code", "codeblock", "snippet"], action: (e) => e.chain().focus().toggleCodeBlock().run() },
  { id: "divider", label: "Divider", description: "Horizontal separator line", icon: "—", keywords: ["divider", "hr", "line", "rule"], action: (e) => e.chain().focus().setHorizontalRule().run() },
  { id: "table", label: "Table", description: "Insert a 3×3 table", icon: "⊞", keywords: ["table", "grid"], action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: "image", label: "Image", description: "Upload or embed an image", icon: "🖼", keywords: ["image", "photo", "upload", "img"], action: (_e, ref) => ref.current?.click() },
  { id: "bold", label: "Bold", description: "Make text bold", icon: "B", keywords: ["bold", "strong"], action: (e) => e.chain().focus().toggleBold().run() },
  { id: "italic", label: "Italic", description: "Make text italic", icon: "I", keywords: ["italic", "em"], action: (e) => e.chain().focus().toggleItalic().run() },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function Editor({ content, onChange }: EditorProps) {
  const [uploading, setUploading] = React.useState(false);
  const [slashMenu, setSlashMenu] = React.useState<SlashMenuState>(CLOSED);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isRaw, setIsRaw] = React.useState(false);
  const [rawText, setRawText] = React.useState("");

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const turndown = React.useMemo(() => new TurndownService(), []);

  // Keep refs current so the Tiptap keymap closure always sees fresh values
  const slashMenuRef = React.useRef(slashMenu);
  const filteredRef = React.useRef<SlashCommand[]>(COMMANDS);
  const activeRef = React.useRef(0);

  // ── Filtered commands ────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const q = slashMenu.query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q))
    );
  }, [slashMenu.query]);

  // Sync refs
  React.useEffect(() => { slashMenuRef.current = slashMenu; }, [slashMenu]);
  React.useEffect(() => { filteredRef.current = filtered; }, [filtered]);
  React.useEffect(() => { activeRef.current = activeIndex; }, [activeIndex]);

  // Reset index when filtered list changes
  React.useEffect(() => { setActiveIndex(0); }, [filtered]);

  // Scroll active item into view
  React.useEffect(() => {
    menuRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Execute command ───────────────────────────────────────────────────────
  // Must be stable — called from both the Tiptap keymap and mouse clicks
  const executeCommand = React.useCallback(
    (cmd: SlashCommand, editorInstance: any, menuState: SlashMenuState) => {
      if (!editorInstance) return;
      // Delete "/" + everything typed after it
      const from = menuState.rangeStart - 1;
      const to = menuState.rangeStart + menuState.query.length;
      editorInstance.chain().focus().deleteRange({ from, to }).run();
      setSlashMenu(CLOSED);
      cmd.action(editorInstance, imageInputRef);
    },
    []
  );

  // ── Tiptap slash-menu keyboard extension ─────────────────────────────────
  // Defined once with useMemo so it doesn't re-create on every render.
  // All live state is accessed through refs.
  const SlashKeymap = React.useMemo(
    () =>
      Extension.create({
        name: "slashKeymap",
        addProseMirrorPlugins() {
          return [
            keymap({
              ArrowDown: () => {
                if (!slashMenuRef.current.visible) return false; // let editor handle it
                setActiveIndex((i) => Math.min(i + 1, filteredRef.current.length - 1));
                return true; // consumed
              },
              ArrowUp: () => {
                if (!slashMenuRef.current.visible) return false;
                setActiveIndex((i) => Math.max(i - 1, 0));
                return true;
              },
              Enter: (state) => {
                if (!slashMenuRef.current.visible) return false; // normal Enter in editor
                const cmd = filteredRef.current[activeRef.current];
                if (cmd) {
                  // We need the editor instance — grab it from the view
                  // @ts-ignore — accessing internal _tiptapEditor
                  const ed = (state as any)._tiptapEditor ?? this.editor;
                  executeCommand(cmd, ed ?? this.editor, slashMenuRef.current);
                }
                return true;
              },
              Escape: () => {
                if (!slashMenuRef.current.visible) return false;
                setSlashMenu(CLOSED);
                return true;
              },
            }),
          ];
        },
      }),
    // executeCommand is stable (empty dep array), so this never re-creates
    [executeCommand]
  );

  // ── Editor ────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      SlashKeymap,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "devhub-prose prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 w-full",
      },
      // Automatically parse Pasted Markdown into styled TipTap Node Content triggers down offsets multipliers setup!
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;

        const isMarkdown = text.includes('```') || text.includes('###') || text.includes('## ') || text.includes('|---|') || (text.includes('---') && text.includes('\n'));
        if (isMarkdown) {
          try {
            const html = marked.parse(text) as string;
            const element = document.createElement("div");
            element.innerHTML = html;

            const { DOMParser } = require("@tiptap/pm/model");
            const slice = DOMParser.fromSchema(view.state.schema).parseSlice(element);
            view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
            return true;
          } catch (e) {
            console.error("Markdown paste error:", e);
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      const { view, state } = editor;
      const { $from } = state.selection;
      const blockStart = $from.start();
      const curPos = $from.pos;
      const textBefore = state.doc.textBetween(blockStart, curPos);
      const slashIdx = textBefore.lastIndexOf("/");

      if (slashIdx !== -1) {
        const query = textBefore.slice(slashIdx + 1);

        // Close if user typed a space after "/" (Notion behaviour)
        if (!query.includes(" ")) {
          try {
            const slashDocPos = blockStart + slashIdx + 1;
            const coords = view.coordsAtPos(slashDocPos);
            const editorRect = (view.dom as HTMLElement).getBoundingClientRect();

            setSlashMenu({
              visible: true,
              x: coords.left - editorRect.left,
              y: coords.bottom - editorRect.top + 6,
              rangeStart: slashDocPos,
              query,
            });
            return;
          } catch (_) { }
        }
      }

      setSlashMenu(CLOSED);
    },
  });

  // ── Sync external content ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content === current) return;
    const trimmed = (content || "").trim();
    const isHTML = trimmed.startsWith("<") && (trimmed.startsWith("<p>") || trimmed.startsWith("<h1>") || trimmed.startsWith("<h2>") || trimmed.startsWith("<h3>") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<div") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<table"));

    if (!isHTML && content !== "") return;
    if (content !== current) editor.commands.setContent(content);


  }, [content, editor]);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      const url = window.prompt("Upload failed. Enter image URL instead:");
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-md bg-background overflow-hidden flex flex-col">
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-muted/50 border-b p-1 flex flex-wrap gap-1 items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!isRaw) {
              const html = editor.getHTML();
              setRawText(turndown.turndown(html));
            } else {
              const html = marked.parse(rawText) as string;
              editor.commands.setContent(html);
              onChange?.(html);
            }
            setIsRaw(!isRaw);
          }}
          className={`h-8 px-2 flex items-center gap-1.5 font-bold text-xs ${isRaw ? "bg-primary/10 text-primary" : ""}`}
        >
          {isRaw ? <Eye className="h-3.5 w-3.5" /> : <FileCode className="h-3.5 w-3.5" />}
          {isRaw ? "Visual" : "Markdown"}
        </Button>
        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-muted" : ""}`}><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-muted" : ""}`}><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={`h-8 w-8 p-0 ${editor.isActive("strike") ? "bg-muted" : ""}`}><Strikethrough className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`h-8 w-8 p-0 ${editor.isActive("codeBlock") ? "bg-muted" : ""}`}><Code className="h-4 w-4" /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        {([1, 2, 3, 4, 5] as const).map((level) => (
          <Button key={level} type="button" variant="ghost" size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`h-8 w-8 p-0 font-bold text-xs ${editor.isActive("heading", { level }) ? "bg-muted" : ""}`}
          >H{level}</Button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-muted" : ""}`}><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`h-8 w-8 p-0 ${editor.isActive("blockquote") ? "bg-muted" : ""}`}><Quote className="h-4 w-4" /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`h-8 w-8 p-0 ${editor.isActive("table") ? "bg-muted" : ""}`}
        ><Table2 className="h-4 w-4" /></Button>

        <div className="relative inline-flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" className={`h-8 w-8 p-0 ${uploading ? "opacity-50" : ""}`}>
            <label className="cursor-pointer w-full h-full flex items-center justify-center">
              <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <ImageIcon className="h-4 w-4" />
            </label>
          </Button>

          {editor.isActive("image") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md"
              onClick={() => {
                const currentSrc = editor.getAttributes("image").src;
                const url = window.prompt("Edit image URL:", currentSrc);
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
            >
              Edit Link
            </Button>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1 ml-auto" />

        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="h-8 w-8 p-0"><Undo className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="h-8 w-8 p-0"><Redo className="h-4 w-4" /></Button>
      </div>

      {/* ── Editor + slash menu ───────────────────────────────────────────── */}
      <div className="flex-1 cursor-text bg-background relative flex flex-col">
        {isRaw ? (
          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              onChange?.(e.target.value);
            }}
            className="w-full flex-1 min-h-[300px] p-4 bg-background font-mono text-sm resize-none focus:outline-none"
            placeholder="Type your markdown here..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}

        {/* ── Slash menu dropdown ──────────────────────────────────────── */}
        {slashMenu.visible && filtered.length > 0 && (
          <div
            ref={menuRef}
            style={{ left: slashMenu.x, top: slashMenu.y }}
            className="absolute z-50 w-72 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {slashMenu.query ? `"${slashMenu.query}"` : "Type to filter"}
              </span>
              <span className="text-[9px] text-muted-foreground/50 font-mono">↑↓ · ↵ · esc</span>
            </div>

            {/* Commands */}
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  data-active={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep editor focused
                    executeCommand(cmd, editor, slashMenu);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${idx === activeIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50 text-foreground"
                    }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 border transition-colors ${idx === activeIndex
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                    }`}>
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-none mb-0.5 ${idx === activeIndex ? "text-primary" : "text-foreground"}`}>
                      {cmd.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{cmd.description}</p>
                  </div>
                  {idx === activeIndex && <ChevronRight className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/20 px-3 py-1.5">
              <p className="text-[9px] text-muted-foreground/50 font-mono">
                / to open · space to dismiss · esc to close
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
