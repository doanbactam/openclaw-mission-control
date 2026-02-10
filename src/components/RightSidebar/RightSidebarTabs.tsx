import React from "react";

export type TabId = "live-feed" | "documents";

type RightSidebarTabsProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "live-feed", label: "Feed" },
  { id: "documents", label: "Docs" },
];

const RightSidebarTabs: React.FC<RightSidebarTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-3 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase transition-colors ${activeTab === tab.id
              ? "text-foreground border-b border-foreground"
              : "text-muted-foreground hover:text-foreground/70"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RightSidebarTabs;
