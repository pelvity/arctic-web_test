"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Search, Loader2, FileText, Link2, Terminal, Plus, FileQuestion, MoveRight, MoveLeft } from "lucide-react";
import { api } from "@/lib/api";
import { type Snippet, type PaginatedResponse } from "@/types/snippet";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// SWR fetcher configured for our Axios instance
const fetcher = (url: string) => api.get(url).then((res) => res.data);

const typeIcons = {
  link: <Link2 className="h-4 w-4 text-blue-400" />,
  note: <FileText className="h-4 w-4 text-indigo-400" />,
  command: <Terminal className="h-4 w-4 text-emerald-400" />,
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  // Build query string dynamically. We use debouncing implicitly by how user types, 
  // but SWR handles race conditions cleanly. For instant search a proper debouncer helps, 
  // but for a small vault direct string binding is often fine.
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { q: search } : {}),
    ...(tag ? { tag } : {}),
  }).toString();

  const { data, error, isLoading } = useSWR<PaginatedResponse<Snippet>>(
    `/snippets?${queryParams}`,
    fetcher
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search snippets..."
            className="pl-9 h-11 bg-zinc-900/50 border-white/10 text-base rounded-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
          />
        </div>

        <Link href="/snippets/new">
          <Button className="rounded-full shadow-lg shadow-blue-500/20 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> New Snippet
          </Button>
        </Link>
      </div>

      {/* Tag filter shortcut (if active) */}
      {tag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Filtering by tag:</span>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors" onClick={() => { setTag(""); setPage(1); }}>
            {tag} ✕
          </Badge>
        </div>
      )}

      {/* States: Loading, Error, Empty, List */}
      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center text-zinc-500 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p>Loading snippets from vault...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
          <p className="font-medium">Failed to load snippets.</p>
          <p className="text-sm opacity-80 mt-1">Check if the backend is running.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center text-zinc-400 bg-white/[0.02] border border-white/10 rounded-2xl border-dashed">
          <FileQuestion className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium text-white mb-1">No Snippets Found</p>
          <p className="text-sm">Try empty search terms, or create a new snippet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((snippet) => (
              <Link key={snippet._id} href={`/snippets/${snippet._id}`} className="block group">
                <Card className="h-full flex flex-col hover:border-blue-500/50 transition-colors duration-300 bg-gradient-to-b from-zinc-900 to-[#0e0e11]">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {snippet.title}
                    </CardTitle>
                    <div className="bg-white/5 p-2 rounded-full ring-1 ring-white/10 group-hover:bg-blue-500/10 group-hover:ring-blue-500/30 transition-all">
                      {typeIcons[snippet.type]}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="line-clamp-3 text-zinc-400 text-sm leading-relaxed">
                      {snippet.content}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex flex-col items-start gap-4">
                    <div className="flex flex-wrap gap-2">
                      {snippet.tags.slice(0, 3).map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-black/40 hover:bg-blue-500/20 transition-colors z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            setTag(t);
                            setPage(1);
                          }}
                        >
                          {t}
                        </Badge>
                      ))}
                      {snippet.tags.length > 3 && (
                        <span className="text-xs text-zinc-500 self-center">+{snippet.tags.length - 3}</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-600 w-full flex justify-between items-center border-t border-white/5 pt-3">
                      <span>Updated {formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full px-6"
              >
                <MoveLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-zinc-400">
                Page <span className="text-white font-medium">{page}</span> of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-full px-6"
              >
                Next <MoveRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
