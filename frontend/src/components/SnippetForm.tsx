"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { mutate } from "swr";
import { api } from "@/lib/api";
import { type Snippet, type SnippetType } from "@/types/snippet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Tag as TagIcon, Edit, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useActionStore } from "@/store/action-store";
import { useTranslations } from "next-intl";

interface SnippetFormProps {
    initialData?: Snippet;
    isEdit?: boolean;
}

export function SnippetForm({ initialData }: SnippetFormProps) {
    const t = useTranslations("SnippetForm");
    const tToast = useTranslations("Toast");
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const logAction = useActionStore((state) => state.logAction);
    const [error, setError] = useState("");

    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [type, setType] = useState<SnippetType>(initialData?.type || "note");

    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
            }
            setTagInput("");
        }
    };

    const removeTag = (t: string) => {
        setTags(tags.filter(tag => tag !== t));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const payload = { title, content, type, tags };
            if (initialData) {
                const res = await api.patch(`/snippets/${initialData._id}`, payload);
                logAction({
                    snippetId: initialData._id,
                    type: 'UPDATE',
                    previousData: initialData,
                    newData: res.data
                });
                toast.success(tToast("successUpdated"));
                mutate(`/snippets/${initialData._id}`, res.data);
                mutate('/snippets/tags');
                router.push(`/snippets/${initialData._id}`);
            } else {
                const res = await api.post("/snippets", payload);
                logAction({
                    snippetId: res.data._id,
                    type: 'CREATE',
                    newData: res.data
                });
                toast.success(tToast("successCreated"));
                mutate('/snippets/tags');
                router.push(`/snippets/${res.data._id}`);
            }
            router.refresh();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || tToast("errorGeneral");
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Link href={initialData ? `/snippets/${initialData?._id}` : "/"} className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> {t("cancel")}
            </Link>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform origin-left transition-transform duration-500 pointer-events-none" />
                <CardHeader className="pb-8 pt-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/10 shadow-inner">
                                {initialData ? <Edit className="h-6 w-6 text-blue-400" /> : <Plus className="h-6 w-6 text-blue-400" />}
                            </div>
                            {initialData ? t("editSnippet") : t("createNewSnippet")}
                        </CardTitle>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                                {Array.isArray(error) ? error.join(', ') : error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">{t("titleLabel")} <span className="text-red-500">*</span></label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("titlePlaceholder")}
                                className="bg-black/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">{t("typeLabel")}</label>
                            <div className="flex gap-4">
                                {(["note", "command", "link"] as SnippetType[]).map((t_opt) => (
                                    <label key={t_opt} className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t_opt}
                                            checked={type === t_opt}
                                            onChange={(e) => setType(e.target.value as SnippetType)}
                                            className="accent-blue-500"
                                        />
                                        <span className="capitalize">
                                            {t_opt === 'note' ? t("typeNote") : t_opt === 'command' ? t("typeCommand") : t("typeLink")}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">{t("contentLabel")} <span className="text-red-500">*</span></label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t("contentPlaceholder")}
                                className="h-40 font-mono text-sm bg-black/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center">
                                <TagIcon className="h-4 w-4 mr-2 text-zinc-500" /> {t("tagsLabel")}
                            </label>
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                placeholder={t("tagsPlaceholder")}
                                className="bg-black/40"
                            />
                            <div className="flex flex-wrap gap-2 pt-2">
                                {tags.map((t) => (
                                    <Badge
                                        key={t}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-red-500/20 hover:text-red-400 group transition-colors"
                                        onClick={() => removeTag(t)}
                                    >
                                        {t} <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-white/5 bg-white/[0.02] p-6 mt-4">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl px-6" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 rounded-xl px-8 transition-all hover:scale-105 active:scale-95"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {t("save")}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
