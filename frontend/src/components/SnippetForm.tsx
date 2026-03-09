"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { type Snippet, type SnippetType } from "@/types/snippet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";

interface SnippetFormProps {
    initialData?: Snippet;
    isEdit?: boolean;
}

export function SnippetForm({ initialData, isEdit }: SnippetFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        setError("");

        try {
            const payload = { title, content, type, tags };
            if (isEdit && initialData) {
                await api.patch(`/snippets/${initialData._id}`, payload);
                router.push(`/snippets/${initialData._id}`);
            } else {
                const res = await api.post("/snippets", payload);
                router.push(`/snippets/${res.data._id}`);
            }
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to save snippet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Link href={isEdit ? `/snippets/${initialData?._id}` : "/"} className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Link>

            <Card className="border-white/10 shadow-2xl shadow-blue-900/10">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{isEdit ? "Edit Snippet" : "Create New Snippet"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                                {Array.isArray(error) ? error.join(', ') : error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Title <span className="text-red-500">*</span></label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Docker Compose Postgres Setup"
                                className="bg-black/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Type</label>
                            <div className="flex gap-4">
                                {(["note", "command", "link"] as SnippetType[]).map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t}
                                            checked={type === t}
                                            onChange={(e) => setType(e.target.value as SnippetType)}
                                            className="accent-blue-500"
                                        />
                                        <span className="capitalize">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Content <span className="text-red-500">*</span></label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your snippet, markdown, link, or command here..."
                                className="h-40 font-mono text-sm bg-black/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center">
                                <TagIcon className="h-4 w-4 mr-2 text-zinc-500" /> Tags
                            </label>
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="Type tag and press Enter or comma..."
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
                    <CardFooter className="flex justify-end gap-3 pt-6 border-t border-white/5 bg-zinc-950/30 rounded-b-xl">
                        <Link href={isEdit ? `/snippets/${initialData?._id}` : "/"}>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="w-32 bg-blue-600 hover:bg-blue-700">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
