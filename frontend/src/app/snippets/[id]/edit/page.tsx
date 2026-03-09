"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { type Snippet } from "@/types/snippet";
import { SnippetForm } from "@/components/SnippetForm";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function EditSnippetPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { data: snippet, error, isLoading } = useSWR<Snippet>(
        `/snippets/${id}`,
        fetcher
    );

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
        <div className="py-8">
            <SnippetForm initialData={snippet} isEdit={true} />
        </div>
    );
}
