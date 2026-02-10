import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Markdown from "react-markdown";
import { DEFAULT_TENANT_ID } from "../../lib/tenant";

type ConversationTrayProps = {
  documentId: Id<"documents">;
  onClose: () => void;
  onOpenPreview: () => void;
};

const ConversationTray: React.FC<ConversationTrayProps> = ({
  documentId,
  onClose,
  onOpenPreview,
}) => {
  const documentContext = useQuery(api.documents.getWithContext, {
    documentId,
    tenantId: DEFAULT_TENANT_ID,
  });

  if (!documentContext) {
    return (
      <div className="tray is-open">
        <div className="p-4 animate-pulse">
          <div className="h-8 bg-secondary rounded-lg mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tray is-open">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
              style={{ transition: "var(--transition-fast)" }}
              aria-label="Close conversation tray"
            >
              ✕
            </button>
            <span
              className="text-[11px] font-semibold text-muted-foreground uppercase"
              style={{ letterSpacing: "0.08em" }}
            >
              Context
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPreview}
            className="text-[10px] font-semibold px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-foreground hover:opacity-90"
            style={{ transition: "var(--transition-fast)" }}
          >
            Open Preview
          </button>
        </div>

        {/* Document info */}
        <div className="px-4 py-3 border-b border-border bg-secondary/40">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {documentContext.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            {documentContext.agentName && (
              <>
                <span className="text-[var(--accent-blue)] font-medium">
                  {documentContext.agentName}
                </span>
                <span>·</span>
              </>
            )}
            <span className="capitalize">{documentContext.type}</span>
            {documentContext.taskTitle && (
              <>
                <span>·</span>
                <span className="truncate">Task: {documentContext.taskTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Full conversation thread */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            {/* Original prompt */}
            {documentContext.taskDescription && (
              <>
                <div
                  className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Prompt
                </div>
                <div className="p-3 bg-secondary border border-border rounded-lg mb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">👤</span>
                    <span className="text-xs font-semibold text-foreground">
                      User
                    </span>
                  </div>
                  <div className="text-xs text-foreground leading-relaxed markdown-content">
                    <Markdown>{documentContext.taskDescription}</Markdown>
                  </div>
                </div>
              </>
            )}

            {/* Message thread */}
            {documentContext.conversationMessages.length > 0 && (
              <>
                <div
                  className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Agent Thread
                </div>
                {documentContext.conversationMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-3 bg-secondary border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {msg.agentAvatar && (
                        <span className="text-base">{msg.agentAvatar}</span>
                      )}
                      <span className="text-xs font-semibold text-[var(--accent-blue)]">
                        {msg.agentName}
                      </span>
                    </div>
                    <div className="text-xs text-foreground leading-relaxed markdown-content">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* No content message */}
            {!documentContext.taskDescription &&
              documentContext.conversationMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm">
                    No conversation history available
                  </div>
                  <div className="text-muted-foreground/60 text-xs mt-1">
                    This document was created without task context
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTray;
