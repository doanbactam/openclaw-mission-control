import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X, Check, User, Tag, MessageSquare, Clock, FileText, Copy, Calendar, Archive, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

interface TaskDetailPanelProps {
  taskId: Id<"tasks"> | null;
  onClose: () => void;
  onPreviewDocument?: (docId: Id<"documents">) => void;
}

const statusColors: Record<string, string> = {
  inbox: "var(--muted-foreground)",
  assigned: "var(--accent-orange)",
  in_progress: "var(--accent-blue)",
  review: "var(--foreground)",
  done: "var(--accent-green)",
  archived: "var(--muted-foreground)",
};

const statusLabels: Record<string, string> = {
  inbox: "INBOX",
  assigned: "ASSIGNED",
  in_progress: "IN PROGRESS",
  review: "REVIEW",
  done: "DONE",
  archived: "ARCHIVED",
};

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ taskId, onClose, onPreviewDocument }) => {
  const tasks = useQuery(api.queries.listTasks, { tenantId: DEFAULT_TENANT_ID });
  const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });
  const resources = useQuery(
    api.documents.listByTask,
    taskId ? { taskId, tenantId: DEFAULT_TENANT_ID } : "skip"
  );
  const activities = useQuery(
    api.queries.listActivities,
    taskId ? { taskId, tenantId: DEFAULT_TENANT_ID } : "skip"
  );
  const messages = useQuery(
    api.queries.listMessages,
    taskId ? { taskId, tenantId: DEFAULT_TENANT_ID } : "skip"
  );

  const updateStatus = useMutation(api.tasks.updateStatus);
  const updateAssignees = useMutation(api.tasks.updateAssignees);
  const updateTask = useMutation(api.tasks.updateTask);
  const archiveTask = useMutation(api.tasks.archiveTask);
  const sendMessage = useMutation(api.messages.send);
  const createDocument = useMutation(api.documents.create);
  const linkRun = useMutation(api.tasks.linkRun);

  const task = tasks?.find((t) => t._id === taskId);
  const currentUserAgent = agents?.find(a => a.name === "Manish");

  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<Array<Id<"documents">>>([]);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("note");
  const [newDocPath, setNewDocPath] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  useEffect(() => {
    if (task) {
      setDescription(task.description);
    }
  }, [task]);

  if (!taskId) return null;
  if (!task) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentUserAgent) {
      updateStatus({
        taskId: task._id,
        status: e.target.value as any,
        agentId: currentUserAgent._id,
        tenantId: DEFAULT_TENANT_ID,
      });
    }
  };

  const handleAssigneeToggle = (agentId: Id<"agents">) => {
    if (!currentUserAgent) return;
    const currentAssignees = task.assigneeIds || [];
    const isAssigned = currentAssignees.includes(agentId);

    let newAssignees;
    if (isAssigned) {
      newAssignees = currentAssignees.filter(id => id !== agentId);
    } else {
      newAssignees = [...currentAssignees, agentId];
    }
    updateAssignees({
      taskId: task._id,
      assigneeIds: newAssignees,
      agentId: currentUserAgent._id,
      tenantId: DEFAULT_TENANT_ID,
    });
  };

  const saveDescription = () => {
    if (currentUserAgent) {
      updateTask({
        taskId: task._id,
        description,
        agentId: currentUserAgent._id,
        tenantId: DEFAULT_TENANT_ID,
      });
      setIsEditingDesc(false);
    }
  };

  const docsById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof resources>[number]>();
    if (resources) {
      resources.forEach((doc) => {
        map.set(doc._id, doc);
      });
    }
    return map;
  }, [resources]);

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort((a, b) => a._creationTime - b._creationTime);
  }, [messages]);

  const toggleAttachment = (docId: Id<"documents">) => {
    setSelectedAttachmentIds((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      }
      return [...prev, docId];
    });
  };

  const sendComment = async () => {
    if (!currentUserAgent) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;
    await sendMessage({
      taskId: task._id,
      agentId: currentUserAgent._id,
      content: trimmed,
      attachments: selectedAttachmentIds,
      tenantId: DEFAULT_TENANT_ID,
    });
    setCommentText("");
    setSelectedAttachmentIds([]);
  };

  const buildAgentPreamble = () => {
    if (!task || !agents) return "";
    const assignee = task.assigneeIds.length > 0
      ? agents.find(a => a._id === task.assigneeIds[0])
      : null;
    if (!assignee) return "";

    const parts: string[] = [];
    if (assignee.systemPrompt) parts.push(`System Prompt:\n${assignee.systemPrompt}`);
    if (assignee.character) parts.push(`Character:\n${assignee.character}`);
    if (assignee.lore) parts.push(`Lore:\n${assignee.lore}`);

    return parts.length > 0 ? parts.join("\n\n") + "\n\n---\n\n" : "";
  };

  const handleResume = async () => {
    if (!currentUserAgent || !task) return;

    const trimmed = commentText.trim();
    if (trimmed) {
      await sendMessage({
        taskId: task._id,
        agentId: currentUserAgent._id,
        content: trimmed,
        attachments: selectedAttachmentIds,
        tenantId: DEFAULT_TENANT_ID,
      });
      setCommentText("");
      setSelectedAttachmentIds([]);
    }

    await updateStatus({
      taskId: task._id,
      status: "in_progress",
      agentId: currentUserAgent._id,
      tenantId: DEFAULT_TENANT_ID,
    });

    let prompt = buildAgentPreamble();

    prompt += task.description && task.description !== task.title
      ? `${task.title}\n\n${task.description}`
      : task.title;

    const allMessages = sortedMessages.slice();
    if (trimmed) {
      allMessages.push({
        _id: "" as any,
        _creationTime: Date.now(),
        agentName: currentUserAgent.name,
        content: trimmed,
      } as any);
    }

    if (allMessages.length > 0) {
      const thread = allMessages.map(m => `[${m.agentName}]: ${m.content}`).join("\n\n");
      prompt += `\n\n---\nConversation:\n${thread}\n---\nContinue working on this task based on the conversation above.`;
    }

    try {
      const res = await fetch("/hooks/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENCLAW_HOOK_TOKEN || ""}`,
        },
        body: JSON.stringify({
          message: prompt,
          sessionKey: `mission:${task._id}`,
          name: "MissionControl",
          wakeMode: "now",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.runId) {
          await linkRun({
            taskId: task._id,
            openclawRunId: data.runId,
            tenantId: DEFAULT_TENANT_ID,
          });
        }
      }
    } catch (err) {
      console.error("[TaskDetailPanel] Failed to trigger openclaw agent:", err);
    }
  };

  const resetNewDocForm = () => {
    setNewDocTitle("");
    setNewDocType("note");
    setNewDocPath("");
    setNewDocContent("");
  };

  const submitNewDoc = async () => {
    if (!currentUserAgent) return;
    const trimmedTitle = newDocTitle.trim();
    if (!trimmedTitle) return;
    const docId = await createDocument({
      title: trimmedTitle,
      type: newDocType.trim() || "note",
      content: newDocContent.trim(),
      path: newDocPath.trim() || undefined,
      taskId: task._id,
      agentId: currentUserAgent._id,
      tenantId: DEFAULT_TENANT_ID,
    });
    setSelectedAttachmentIds((prev) => [...prev, docId]);
    resetNewDocForm();
    setIsAddingDoc(false);
  };

  const renderAvatar = (avatar?: string) => {
    if (!avatar) return <User size={10} />;
    const isUrl = avatar.startsWith("http") || avatar.startsWith("data:");
    if (isUrl) {
      return <img src={avatar} className="w-full h-full object-cover" alt="avatar" />;
    }
    return <span className="text-[10px] flex items-center justify-center h-full w-full leading-none">{avatar}</span>;
  };

  const formatCreationDate = (ms: number) => {
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const lastUpdatedActivity = activities?.[0];
  const lastUpdated = lastUpdatedActivity ? lastUpdatedActivity._creationTime : null;

  /* --- Shared input styles (dark mode compliant) --- */
  const inputCls = "w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] placeholder:text-muted-foreground/40";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div
      className="fixed inset-y-0 right-0 w-[400px] bg-background/80 backdrop-blur-2xl border-l border-border/50 supports-[backdrop-filter]:bg-background/60 flex flex-col shadow-2xl"
      style={{
        zIndex: 50,
        transition: "transform var(--transition-smooth)",
      }}
    >
      {/* Header — HIG: minimal, deferred */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: statusColors[task.status] || "gray" }}
          />
          <span
            className="text-[10px] font-semibold text-muted-foreground uppercase tabular-nums"
            style={{ letterSpacing: "0.08em" }}
          >
            {task._id.slice(-6)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
          style={{ transition: "var(--transition-fast)" }}
          aria-label="Close task detail"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content — Conductor-style context panel */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

        {/* Title + Tags */}
        <div>
          <h2 className="text-base font-semibold text-foreground leading-snug mb-2" style={{ letterSpacing: "-0.01em" }}>
            {task.title}
          </h2>
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-secondary rounded font-medium text-muted-foreground flex items-center gap-1"
                >
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            {task.status !== 'done' && task.status !== 'archived' && (
              <button
                onClick={() =>
                  currentUserAgent &&
                  updateStatus({
                    taskId: task._id,
                    status: "done",
                    agentId: currentUserAgent._id,
                    tenantId: DEFAULT_TENANT_ID,
                  })
                }
                disabled={!currentUserAgent}
                className="flex-1 py-1.5 bg-[var(--accent-green)] text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ transition: "var(--transition-fast)" }}
                title={!currentUserAgent ? "User agent not found" : "Mark as Done"}
              >
                <Check size={14} />
                Done
              </button>
            )}
            {task.status !== 'archived' && (
              <button
                onClick={() =>
                  currentUserAgent &&
                  archiveTask({
                    taskId: task._id,
                    agentId: currentUserAgent._id,
                    tenantId: DEFAULT_TENANT_ID,
                  })
                }
                disabled={!currentUserAgent}
                className={`${task.status === 'done' ? 'flex-1' : ''} py-1.5 px-3 bg-secondary text-muted-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent`}
                style={{ transition: "var(--transition-fast)" }}
                title={!currentUserAgent ? "User agent not found" : "Archive Task"}
              >
                <Archive size={14} />
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: "0.06em" }}>
            Status
          </label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={!currentUserAgent}
            className="w-full p-2 text-sm border border-border rounded-lg bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] disabled:opacity-50"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5 group">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: "0.06em" }}>
              Description
            </label>
            {!isEditingDesc && currentUserAgent && (
              <button
                onClick={() => setIsEditingDesc(true)}
                className="text-[10px] text-[var(--accent-blue)] opacity-0 group-hover:opacity-100"
                style={{ transition: "var(--transition-fast)" }}
              >
                Edit
              </button>
            )}
          </div>

          {isEditingDesc ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${textareaCls} min-h-[90px]`}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingDesc(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary rounded-lg"
                  style={{ transition: "var(--transition-fast)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveDescription}
                  className="px-3 py-1.5 text-xs bg-foreground text-primary-foreground rounded-lg hover:opacity-90"
                  style={{ transition: "var(--transition-fast)" }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>

        {/* Assignees */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: "0.06em" }}>
            Assignees
          </label>
          <div className="flex flex-wrap gap-1.5">
            {task.assigneeIds?.map(id => {
              const agent = agents?.find(a => a._id === id);
              return (
                <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-secondary border border-border rounded-full">
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {renderAvatar(agent?.avatar)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{agent?.name || "Unknown"}</span>
                  <button
                    onClick={() => handleAssigneeToggle(id)}
                    disabled={!currentUserAgent}
                    className="hover:text-[var(--accent-red)] disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground"
                    style={{ transition: "var(--transition-fast)" }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
            <div className="relative group/add">
              <button
                disabled={!currentUserAgent}
                className="flex items-center gap-1 px-2 py-1 bg-secondary border border-transparent rounded-full text-[11px] text-muted-foreground hover:bg-accent hover:border-border disabled:opacity-50"
                style={{ transition: "var(--transition-fast)" }}
              >
                <span>+ Add</span>
              </button>

              <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg hidden group-hover/add:block p-1" style={{ zIndex: 10, boxShadow: "var(--shadow-lg)" }}>
                {agents?.filter(a => !task.assigneeIds?.includes(a._id)).map(agent => (
                  <button
                    key={agent._id}
                    onClick={() => handleAssigneeToggle(agent._id)}
                    className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-secondary rounded-md flex items-center gap-2 text-foreground"
                    style={{ transition: "var(--transition-fast)" }}
                  >
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {renderAvatar(agent.avatar)}
                    </div>
                    {agent.name}
                  </button>
                ))}
                {agents?.filter(a => !task.assigneeIds?.includes(a._id)).length === 0 && (
                  <div className="px-2.5 py-1.5 text-xs text-muted-foreground text-center">No available agents</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resources / Deliverables */}
        {resources && resources.length > 0 && (
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: "0.06em" }}>
              Resources
            </label>
            <div className="space-y-1">
              {resources.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => onPreviewDocument?.(doc._id)}
                  className="flex items-center justify-between p-2 bg-secondary border border-border rounded-lg text-sm hover:bg-accent cursor-pointer"
                  style={{ transition: "var(--transition-fast)" }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-foreground font-medium text-xs">{doc.title}</span>
                      {doc.path && <span className="text-[10px] text-muted-foreground truncate font-mono">{doc.path}</span>}
                    </div>
                  </div>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase shrink-0 font-medium">{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: "0.06em" }}>
              Comments
            </label>
            <button
              onClick={() => setIsAddingDoc((prev) => !prev)}
              disabled={!currentUserAgent}
              className="text-[10px] text-[var(--accent-blue)] disabled:opacity-50"
            >
              {isAddingDoc ? "Close" : "+ Resource"}
            </button>
          </div>

          {sortedMessages.length === 0 && (
            <div className="text-xs text-muted-foreground bg-secondary border border-border rounded-lg p-3">
              No comments yet. Start the conversation.
            </div>
          )}

          {sortedMessages.length > 0 && (
            <div className="space-y-2">
              {sortedMessages.map((msg) => (
                <div key={msg._id} className="flex gap-2.5 p-3 bg-secondary border border-border rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {renderAvatar(msg.agentAvatar)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{msg.agentName}</span>
                      <span className="tabular-nums">{formatCreationDate(msg._creationTime)}</span>
                    </div>
                    <div className="text-sm text-foreground markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.attachments.map((attachmentId) => {
                          const doc = docsById.get(attachmentId as string);
                          return (
                            <div
                              key={attachmentId}
                              className="text-[10px] px-2 py-0.5 bg-muted rounded border border-border text-muted-foreground flex items-center gap-1"
                            >
                              <FileText size={10} />
                              <span className="font-medium">{doc?.title || "Attachment"}</span>
                              {doc?.path && (
                                <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">
                                  {doc.path}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attach existing resources */}
          {resources && resources.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resources.map((doc) => {
                const isSelected = selectedAttachmentIds.includes(doc._id);
                return (
                  <button
                    key={doc._id}
                    onClick={() => toggleAttachment(doc._id)}
                    disabled={!currentUserAgent}
                    className={`text-[10px] px-2 py-0.5 rounded border ${isSelected
                      ? "bg-[var(--accent-blue)] text-foreground border-[var(--accent-blue)]"
                      : "bg-secondary text-muted-foreground border-border hover:bg-accent"
                      } disabled:opacity-50`}
                    style={{ transition: "var(--transition-fast)" }}
                  >
                    {doc.title}
                  </button>
                );
              })}
            </div>
          )}

          {selectedAttachmentIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedAttachmentIds.map((id) => {
                const doc = docsById.get(id as string);
                return (
                  <div
                    key={id}
                    className="text-[10px] px-2 py-0.5 bg-secondary rounded text-muted-foreground flex items-center gap-1"
                  >
                    <FileText size={10} />
                    <span className="font-medium">{doc?.title || "Attachment"}</span>
                    <button
                      onClick={() => toggleAttachment(id)}
                      className="hover:text-foreground"
                      title="Remove attachment"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {isAddingDoc && (
            <div className="space-y-2 p-3 bg-secondary border border-border rounded-lg">
              <div className="flex flex-col gap-2">
                <input
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document title"
                  className={`${inputCls} text-xs`}
                />
                <div className="flex gap-2">
                  <input
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    placeholder="Type (note, spec, link)"
                    className={`${inputCls} text-xs flex-1`}
                  />
                  <input
                    value={newDocPath}
                    onChange={(e) => setNewDocPath(e.target.value)}
                    placeholder="Path (optional)"
                    className={`${inputCls} text-xs flex-1`}
                  />
                </div>
                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Content (optional)"
                  className={`${textareaCls} min-h-[70px] text-xs`}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      resetNewDocForm();
                      setIsAddingDoc(false);
                    }}
                    className="px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-accent rounded-lg"
                    style={{ transition: "var(--transition-fast)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitNewDoc}
                    disabled={!currentUserAgent || !newDocTitle.trim()}
                    className="px-3 py-1.5 text-[10px] bg-foreground text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                    style={{ transition: "var(--transition-fast)" }}
                  >
                    Add Resource
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={currentUserAgent ? "Write a comment..." : "Sign in as an agent to comment"}
              disabled={!currentUserAgent}
              className={`${textareaCls} min-h-[80px] disabled:opacity-50`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={sendComment}
                disabled={!currentUserAgent || commentText.trim().length === 0}
                className="px-4 py-2 text-xs bg-[var(--accent-blue)] text-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                style={{ transition: "var(--transition-fast)" }}
              >
                Send
              </button>
              {task.status === "review" && (
                <button
                  onClick={handleResume}
                  disabled={!currentUserAgent}
                  className="px-4 py-2 text-xs bg-[var(--accent-green)] text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  style={{ transition: "var(--transition-fast)" }}
                >
                  <Play size={14} />
                  Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{formatCreationDate(task._creationTime)}</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{formatCreationDate(lastUpdated)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={12} />
              <span>{messages?.length || 0} comments</span>
            </div>
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-foreground"
              style={{ transition: "var(--transition-fast)" }}
              onClick={() => {
                navigator.clipboard.writeText(task._id);
              }}
              title="Copy Task ID"
            >
              <span className="tabular-nums font-mono">ID: {task._id.slice(-6)}</span>
              <Copy size={12} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailPanel;
