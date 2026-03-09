export type SnippetType = 'link' | 'note' | 'command';

export interface Snippet {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    type: SnippetType;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
