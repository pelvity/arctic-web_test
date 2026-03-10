"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import useSWR from "swr";
import { Plus, Search, Code, Command, Trash2, Edit, ExternalLink, Moon, Sun, Globe, Link2, FileText, Terminal, FileQuestion, MoveLeft, MoveRight, Loader2, Copy, Tag as TagIcon } from "lucide-react";
import { api } from "@/lib/api";
import { type Snippet, type PaginatedResponse } from "@/types/snippet";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { HighlightText } from "@/components/HighlightText";
import { enUS, uk } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const dateLocales = {
  en: enUS,
  uk: uk,
  ua: uk, // Map ua to uk as they are often the same in date-fns or similar
};

// SWR fetcher configured for our Axios instance
const fetcher = (url: string) => api.get(url).then((res) => res.data);

const typeIcons = {
  link: <Link2 className="h-4 w-4 text-blue-400" />,
  note: <FileText className="h-4 w-4 text-indigo-400" />,
  command: <Terminal className="h-4 w-4 text-emerald-400" />,
};

export default function Home() {
  const t = useTranslations("Index");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedType, setSelectedType] = useState<Snippet["type"] | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const handleCopy = (e: React.MouseEvent, content: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(content);
    toast.success(t("copied"));
  };

  // Build query string dynamically. We use debouncing implicitly by how user types, 
  // but SWR handles race conditions cleanly. For instant search a proper debouncer helps, 
  // but for a small vault direct string binding is often fine.
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  });
  if (selectedType !== "all") {
    queryParams.append("type", selectedType);
  }
  if (selectedTag) {
    queryParams.append("tags", selectedTag);
  }

  const { data, error, isLoading } = useSWR<PaginatedResponse<Snippet>>(
    `/snippets?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const { data: tagsData } = useSWR<string[]>(
    '/snippets/tags',
    fetcher
  );

  // Use tags fetched from backend
  const availableTags = tagsData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-11 bg-zinc-900/50 border-white/10 text-base rounded-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
          />
        </div>

        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 w-full md:w-auto">
          {(["all", "note", "command", "link"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {type === "all" ? t("all") : t(`snippetTypes.${type}`)}
            </button>
          ))}
        </div>

        <Link href="/snippets/new">
          <button
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>{t("addNew")}</span>
          </button>
        </Link>
      </div>

      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          <span className="text-sm text-zinc-500 font-medium shrink-0 flex items-center gap-1.5"><TagIcon className="h-3.5 w-3.5" /> Tags:</span>
          <button
            onClick={() => { setSelectedTag(""); setPage(1); }}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTag === ""
              ? "bg-zinc-700 text-white"
              : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-white/5"
              }`}
          >
            All Tags
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTag === tag
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/10"
                }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* States: Loading, Error, Empty, List */}
      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center text-zinc-500 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p>{t("loadingSnippets")}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
          <p className="font-medium">{t("failedLoad")}</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center text-zinc-400 bg-white/[0.02] border border-white/10 rounded-2xl border-dashed">
          <FileQuestion className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium text-white mb-1">{t("emptyState")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[750px] content-start">
            {data?.data.map((snippet) => (
              <Link key={snippet._id} href={`/snippets/${snippet._id}`} className="block group">
                <Card className="h-full flex flex-col hover:border-blue-500/50 transition-colors duration-300 bg-gradient-to-b from-zinc-900 to-[#0e0e11]">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                      <HighlightText text={snippet.title} query={debouncedSearch} maxLength={50} />
                    </CardTitle>
                    <div className="bg-white/5 p-2 rounded-full ring-1 ring-white/10 group-hover:bg-blue-500/10 group-hover:ring-blue-500/30 transition-all">
                      {typeIcons[snippet.type]}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4 relative group/content">
                    <p className="line-clamp-3 text-zinc-400 text-sm leading-relaxed pr-8">
                      <HighlightText text={snippet.content} query={debouncedSearch} maxLength={120} />
                    </p>
                    <button
                      onClick={(e) => handleCopy(e, snippet.content)}
                      className="absolute right-0 top-0 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover/content:opacity-100 transition-all focus:opacity-100"
                      title={t("copy")}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
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
                            setSelectedTag(t);
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
                      <span>{t("updated")} {formatDistanceToNow(new Date(snippet.updatedAt), {
                        addSuffix: true,
                        locale: dateLocales[locale as keyof typeof dateLocales] || enUS
                      })}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full px-6"
              >
                <MoveLeft className="mr-2 h-4 w-4" /> {t("previous")}
              </Button>
              <span className="text-sm text-zinc-400">
                {t("page")} <span className="text-white font-medium">{page}</span> {t("of")} {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-full px-6"
              >
                {t("next")} <MoveRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
