"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { type Snippet } from "@/types/snippet";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, Edit, Trash2, Link2, FileText, Terminal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useState } from "react";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const typeIcons = {
    link: <Link2 className="h-5 w-5 text-blue-400" />,
    note: <FileText className="h-5 w-5 text-indigo-400" />,
    command: <Terminal className="h-5 w-5 text-emerald-400" />,
};

export default function SnippetDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: snippet, error, isLoading } = useSWR<Snippet>(
        `/snippets/${id}`,
        fetcher
    );

    const handleDelete = async () => {
        if (confirm("Are you sure you want to permanently delete this snippet?")) {
            setIsDeleting(true);
            try {
                await api.delete(`/snippets/${id}`);
                router.push("/");
                router.refresh();
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete the snippet.");
                setIsDeleting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !snippet) {
        return (
            <div className="flex flex-col h-64 items-center justify-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto mt-8 p-6 text-center">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <p className="font-medium text-lg">Snippet not found or failed to load</p>
                <Link href="/" className="mt-4">
                    <Button variant="outline">Back to Vault</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vault
            </Link>

            <Card className="border-white/10 shadow-2xl overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 p-2.5 rounded-xl ring-1 ring-white/10">
                                    {typeIcons[snippet.type]}
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-white/90">
                                    {snippet.title}
                                </CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {snippet.tags.map((t) => (
                                    <Badge key={t} variant="secondary" className="bg-black/40 text-blue-200">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/snippets/${id}/edit`}>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                        {snippet.type === "command" ? (
                            <pre className="bg-black/50 p-6 rounded-xl overflow-x-auto border border-white/5 text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                                {snippet.content}
                            </pre>
                        ) : snippet.type === "link" ? (
                            <a
                                href={snippet.content.startsWith('http') ? snippet.content : `https://${snippet.content}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline break-all text-lg flex items-center gap-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10"
                            >
                                <Link2 className="h-5 w-5" />
                                {snippet.content}
                            </a>
                        ) : (
                            <div className="bg-black/20 p-6 rounded-xl border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {snippet.content}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="bg-black/40 border-t border-white/5 py-4 px-8 text-xs text-zinc-500 flex justify-between">
                    <span>Created: {new Date(snippet.createdAt).toLocaleString()}</span>
                    <span>Last modified: {formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}</span>
                </CardFooter>
            </Card>
        </div>
    );
}
