import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Markdown from "react-markdown";
import { DEFAULT_TENANT_ID } from "../../lib/tenant";

type DocumentPreviewTrayProps = {
  documentId: Id<"documents">;
  onClose: () => void;
};

const DocumentPreviewTray: React.FC<DocumentPreviewTrayProps> = ({
  documentId,
  onClose,
}) => {
  const documentContext = useQuery(api.documents.getWithContext, {
    documentId,
    tenantId: DEFAULT_TENANT_ID,
  });

  if (!documentContext) {
    return (
      <div className="tray tray-preview is-open">
        <div className="p-4 animate-pulse">
          <div className="h-8 bg-secondary rounded-lg mb-4" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const { type, content } = documentContext;

    // Image
    if (type === "image") {
      let imgSrc: string | null = null;

      if (
        content.startsWith("http://") ||
        content.startsWith("https://") ||
        content.startsWith("data:")
      ) {
        imgSrc = content;
      } else if (content.startsWith("/")) {
        imgSrc = `/api/local-file?path=${encodeURIComponent(content)}`;
      }

      if (imgSrc) {
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={imgSrc}
              alt={documentContext.title}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
              style={{ boxShadow: "var(--shadow-md)" }}
            />
          </div>
        );
      }
      return (
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-4xl mb-2 opacity-40">IMG</div>
          <div className="text-sm">Image content preview not available</div>
        </div>
      );
    }

    // Code
    if (type === "code") {
      return (
        <div className="p-4">
          <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono border border-border">
            <code>{content}</code>
          </pre>
        </div>
      );
    }

    // Markdown or Notes
    if (type === "markdown" || type === "note") {
      return (
        <div className="p-4 markdown-content text-foreground">
          <Markdown>{content}</Markdown>
        </div>
      );
    }

    // Default - plain text
    return (
      <div className="p-4">
        <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
          {content}
        </pre>
      </div>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      markdown: { bg: "oklch(0.92 0.04 250)", text: "oklch(0.45 0.15 250)" },
      code: { bg: "oklch(0.92 0.04 155)", text: "oklch(0.45 0.15 155)" },
      image: { bg: "oklch(0.92 0.04 300)", text: "oklch(0.45 0.12 300)" },
      note: { bg: "oklch(0.92 0.03 65)", text: "oklch(0.5 0.12 65)" },
    };
    return styles[type] || { bg: "oklch(0.93 0 0)", text: "oklch(0.5 0 0)" };
  };

  const typeBadge = getTypeBadge(documentContext.type);

  return (
    <div className="tray tray-preview is-open">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
              style={{ transition: "var(--transition-fast)" }}
              aria-label="Close preview tray"
            >
              ✕
            </button>
            <span
              className="text-[11px] font-semibold text-muted-foreground uppercase"
              style={{ letterSpacing: "0.08em" }}
            >
              Preview
            </span>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded"
            style={{ backgroundColor: typeBadge.bg, color: typeBadge.text }}
          >
            {documentContext.type.toUpperCase()}
          </span>
        </div>

        {/* Document title */}
        <div className="px-4 py-3 border-b border-border bg-secondary/40">
          <h3 className="text-sm font-semibold text-foreground">
            {documentContext.title}
          </h3>
          {documentContext.path && (
            <div className="text-[10px] text-muted-foreground mt-1 font-mono truncate">
              {documentContext.path}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background">{renderContent()}</div>

        {/* Footer with metadata */}
        <div className="px-4 py-2 border-t border-border bg-secondary/40 text-[10px] text-muted-foreground flex items-center gap-4">
          {documentContext.agentName && (
            <div className="flex items-center gap-1">
              <span>Created by</span>
              <span className="text-[var(--accent-blue)] font-medium">
                {documentContext.agentName}
              </span>
            </div>
          )}
          {documentContext.taskTitle && (
            <div className="flex items-center gap-1 truncate">
              <span>Task:</span>
              <span className="font-medium truncate">
                {documentContext.taskTitle}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewTray;
