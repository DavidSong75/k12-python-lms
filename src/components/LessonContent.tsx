"use client";

import { useMemo } from "react";

interface Props {
    content: string;
}

export default function LessonContent({ content }: Props) {
    const html = useMemo(() => markdownToHtml(content), [content]);

    return (
        <div
            className="lesson-content animate-fade-in"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function markdownToHtml(md: string): string {
    let html = md;

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
        return `<pre><code class="language-${lang || ""}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim());
        if (cells.every((c) => /^[-:]+$/.test(c))) {
            return "<!-- table separator -->";
        }
        return cells.map((c) => `<td>${c}</td>`).join("");
    });

    // Wrap table rows
    const lines = html.split("\n");
    let inTable = false;
    let tableHtml = "";
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("<td>")) {
            if (!inTable) {
                inTable = true;
                tableHtml = "<table><thead><tr>" +
                    line.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>") +
                    "</tr></thead><tbody>";
            } else {
                tableHtml += "<tr>" + line + "</tr>";
            }
        } else if (line.includes("<!-- table separator -->")) {
            // skip
        } else {
            if (inTable) {
                tableHtml += "</tbody></table>";
                result.push(tableHtml);
                tableHtml = "";
                inTable = false;
            }
            result.push(line);
        }
    }
    if (inTable) {
        tableHtml += "</tbody></table>";
        result.push(tableHtml);
    }
    html = result.join("\n");

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Paragraphs (lines that are not already wrapped)
    html = html.replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, "<p>$1</p>");

    // Clean up
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/\n{2,}/g, "\n");

    return html;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
