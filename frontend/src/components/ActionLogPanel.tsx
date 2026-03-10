"use client";

import { useState } from "react";
import { useActionStore } from "@/store/action-store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { History, X, Undo, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

export function ActionLogPanel() {
    const t = useTranslations("Index"); // Minimal translations for panel
    const { logs, removeLog, clearLogs } = useActionStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleUndo = async (logId: string) => {
        const log = logs.find(l => l.id === logId);
        if (!log) return;

        try {
            if (log.type === 'DELETE') {
                // To undo delete, recreate it
                const { _id, __v, createdAt, updatedAt, ...rest } = log.previousData;
                await api.post("/snippets", rest);
                toast.success("Restore successful!");
            } else if (log.type === 'UPDATE') {
                // To undo update, patch the previous data back
                try {
                    const { _id, __v, createdAt, updatedAt, ...rest } = log.previousData;
                    await api.patch(`/snippets/${log.snippetId}`, rest);
                    toast.success("Update reverted!");
                } catch (e: any) {
                    if (e.response?.status === 404) {
                        toast.error("Snippet no longer exists");
                        removeLog(logId);
                        return;
                    }
                    throw e;
                }
            } else if (log.type === 'CREATE') {
                // To undo create, delete it
                try {
                    await api.delete(`/snippets/${log.snippetId}`);
                    toast.warning("Snippet removed.");
                } catch (e: any) {
                    if (e.response?.status === 404) {
                        toast.warning("Snippet already removed.");
                    } else {
                        throw e;
                    }
                }
            }

            // Remove log after successful undo
            removeLog(logId);

            // If we are on the detail page of the snippet we just affected, redirect home
            if (window.location.pathname.includes(log.snippetId)) {
                window.location.href = '/';
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error("Undo failed:", error);
            toast.error("Failed to undo action");
        }
    };

    const handleClearLogs = () => {
        const previousLogs = [...logs];
        clearLogs();
        toast('Action history cleared', {
            action: {
                label: 'Undo',
                onClick: () => {
                    useActionStore.getState().setLogs(previousLogs);
                    toast.success('History restored');
                }
            }
        });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 lg:bottom-10 right-6 lg:right-10 bg-zinc-900 border border-white/10 text-white p-3 lg:p-4 rounded-full shadow-2xl hover:bg-zinc-800 transition-all z-40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="Action History"
            >
                <div className="relative">
                    <History className="h-5 w-5 lg:h-6 lg:w-6" />
                    {logs.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-zinc-900">
                            {logs.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-zinc-950 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <History className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Action History</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                            <History className="h-12 w-12 opacity-20" />
                            <p className="text-sm">No recent actions</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-3 group hover:border-white/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.type === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                                                log.type === 'UPDATE' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {log.type}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeLog(log.id)}
                                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="text-sm text-zinc-300 line-clamp-2">
                                        {log.type === 'DELETE' && log.previousData ? (
                                            <>Deleted snippet: <span className="text-white font-medium">{log.previousData.title}</span></>
                                        ) : log.type === 'UPDATE' && log.newData ? (
                                            <>Updated snippet: <span className="text-white font-medium">{log.newData.title}</span></>
                                        ) : log.type === 'CREATE' && log.newData ? (
                                            <>Created snippet: <span className="text-white font-medium">{log.newData.title}</span></>
                                        ) : 'Action recorded'}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 h-8 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700"
                                        onClick={() => handleUndo(log.id)}
                                    >
                                        <Undo className="h-3.5 w-3.5 mr-2" /> Undo
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {logs.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={handleClearLogs}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Clear History
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
