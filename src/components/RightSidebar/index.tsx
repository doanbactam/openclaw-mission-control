import React, { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import RightSidebarTabs, { TabId } from "./RightSidebarTabs";
import LiveFeedPanel from "./LiveFeedPanel";
import DocumentsPanel from "./DocumentsPanel";

type RightSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  selectedDocumentId: Id<"documents"> | null;
  onSelectDocument: (id: Id<"documents"> | null) => void;
  onPreviewDocument: (id: Id<"documents">) => void;
};

const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen = false,
  onClose,
  selectedDocumentId,
  onSelectDocument,
  onPreviewDocument,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("live-feed");

  return (
    <aside
      className={`[grid-area:right-sidebar] sidebar-drawer sidebar-drawer--right bg-card border-l border-border flex flex-col overflow-hidden ${isOpen ? "is-open" : ""}`}
      aria-label="Right sidebar"
    >
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          {activeTab === "live-feed" ? "Live Feed" : "Documents"}
        </span>
        <button
          type="button"
          className="md:hidden inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <RightSidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "live-feed" ? (
        <LiveFeedPanel />
      ) : (
        <DocumentsPanel
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={onSelectDocument}
          onPreviewDocument={onPreviewDocument}
        />
      )}
    </aside>
  );
};

export default RightSidebar;
