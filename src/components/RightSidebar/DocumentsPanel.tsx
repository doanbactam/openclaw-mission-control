import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { DEFAULT_TENANT_ID } from "../../lib/tenant";

const typeFilters = [
  { id: "all", label: "All" },
  { id: "markdown", label: "MD" },
  { id: "code", label: "Code" },
  { id: "image", label: "Img" },
  { id: "note", label: "Note" },
];

type DocumentsPanelProps = {
  selectedDocumentId: Id<"documents"> | null;
  onSelectDocument: (id: Id<"documents"> | null) => void;
  onPreviewDocument: (id: Id<"documents">) => void;
};

const DocumentsPanel: React.FC<DocumentsPanelProps> = ({
  selectedDocumentId,
  onSelectDocument,
  onPreviewDocument,
}) => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | undefined>(undefined);

  const documents = useQuery(api.documents.listAll, {
    tenantId: DEFAULT_TENANT_ID,
    type: selectedType === "all" ? undefined : selectedType,
    agentId: selectedAgentId,
  });
  const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });

  const handleDocumentClick = (docId: Id<"documents">) => {
    if (selectedDocumentId === docId) {
      onSelectDocument(null);
    } else {
      onSelectDocument(docId);
    }
  };

  if (documents === undefined || agents === undefined) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
        <div className="flex-1 p-3 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "markdown": return "MD";
      case "code": return "</>";
      case "image": return "IMG";
      case "note": return "N";
      default: return "D";
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {typeFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedType(f.id)}
              className={`text-[9px] font-medium px-2 py-1 rounded transition-colors ${selectedType === f.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSelectedAgentId(undefined)}
            className={`text-[9px] font-medium px-2 py-1 rounded transition-colors ${selectedAgentId === undefined
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            All
          </button>
          {agents.slice(0, 6).map((a) => (
            <button
              key={a._id}
              type="button"
              onClick={() => setSelectedAgentId(a._id)}
              className={`text-[9px] font-medium px-2 py-1 rounded transition-colors ${selectedAgentId === a._id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="flex flex-col gap-1">
        {documents.length === 0 ? (
          <div className="text-center text-muted-foreground text-[11px] py-8">
            No documents
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => handleDocumentClick(doc._id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded cursor-pointer transition-colors ${selectedDocumentId === doc._id
                  ? "bg-accent"
                  : "hover:bg-muted/50"
                }`}
            >
              <span className="text-[9px] font-bold text-muted-foreground w-6 text-center shrink-0 font-mono">
                {getTypeLabel(doc.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-foreground truncate">
                  {doc.title}
                </div>
                {doc.agentName && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    {doc.agentName}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewDocument(doc._id);
                }}
                className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPanel;
