import React from 'react';

interface HighlightTextProps {
    text: string;
    query: string;
    maxLength?: number;
}

export function HighlightText({ text, query, maxLength = 120 }: HighlightTextProps) {
    if (!query) {
        if (text.length <= maxLength) return <>{text}</>;
        return <>{text.slice(0, maxLength)}...</>;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const match = regex.exec(text);

    if (!match) {
        if (text.length <= maxLength) return <>{text}</>;
        return <>{text.slice(0, maxLength)}...</>;
    }

    const matchIndex = match.index;
    const matchLength = match[0].length;

    // Calculate window around the match
    const halfWindow = Math.floor((maxLength - matchLength) / 2);
    let start = Math.max(0, matchIndex - halfWindow);
    let end = Math.min(text.length, matchIndex + matchLength + halfWindow);

    // Adjust if hitting boundaries
    if (start === 0) {
        end = Math.min(text.length, maxLength);
    } else if (end === text.length) {
        start = Math.max(0, text.length - maxLength);
    }

    const prefix = start > 0 ? '...' + text.slice(start, matchIndex) : text.slice(0, matchIndex);
    const highlighted = text.slice(matchIndex, matchIndex + matchLength);
    const suffix = end < text.length ? text.slice(matchIndex + matchLength, end) + '...' : text.slice(matchIndex + matchLength, text.length);

    return (
        <span>
            {prefix}
            <mark className="bg-blue-500/30 text-blue-200 px-1 rounded-sm mx-0.5 font-medium">{highlighted}</mark>
            {suffix}
        </span>
    );
}
