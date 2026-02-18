"use client";

import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Loader2, Terminal } from "lucide-react";

export default function CodeEditor() {
    const [code, setCode] = useState<string>(
        '# 파이썬 코드를 작성해보세요 🐍\nprint("안녕하세요, 파이썬!")\n'
    );
    const [output, setOutput] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);
    const [isError, setIsError] = useState(false);
    const pyodideRef = useRef<any>(null);
    const [pyodideLoading, setPyodideLoading] = useState(false);

    const loadPyodide = useCallback(async () => {
        if (pyodideRef.current) return pyodideRef.current;
        setPyodideLoading(true);
        try {
            // Load Pyodide from CDN via script tag
            if (!(window as any).loadPyodide) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error("Pyodide 스크립트 로드 실패"));
                    document.head.appendChild(script);
                });
            }
            const pyodide = await (window as any).loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
            });
            pyodideRef.current = pyodide;
            return pyodide;
        } catch (err) {
            console.error("Pyodide load error:", err);
            return null;
        } finally {
            setPyodideLoading(false);
        }
    }, []);

    const runCode = async () => {
        setIsRunning(true);
        setIsError(false);
        setOutput("");

        try {
            const pyodide = await loadPyodide();
            if (!pyodide) {
                setOutput("❌ Python 런타임을 로드하지 못했습니다.");
                setIsError(true);
                setIsRunning(false);
                return;
            }

            // Capture stdout
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

            try {
                pyodide.runPython(code);
                const stdout = pyodide.runPython("sys.stdout.getvalue()");
                const stderr = pyodide.runPython("sys.stderr.getvalue()");
                if (stderr) {
                    setOutput(stdout + stderr);
                    setIsError(true);
                } else {
                    setOutput(stdout || "(출력 없음)");
                }
            } catch (err: any) {
                setOutput(`❌ 에러: ${err.message}`);
                setIsError(true);
            }
        } catch (err: any) {
            setOutput(`❌ 실행 오류: ${err.message}`);
            setIsError(true);
        } finally {
            setIsRunning(false);
        }
    };

    const reset = () => {
        setCode('# 파이썬 코드를 작성해보세요 🐍\nprint("안녕하세요, 파이썬!")\n');
        setOutput("");
        setIsError(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(15, 15, 26, 0.5)" }}>
            {/* Editor Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-glass)",
                gap: 8,
            }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 8,
                    background: "rgba(139, 92, 246, 0.1)",
                    fontSize: 12, color: "var(--accent-purple)", fontWeight: 600,
                }}>
                    <Terminal size={12} />
                    main.py
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={reset} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <RotateCcw size={12} />
                    초기화
                </button>
                <button
                    onClick={runCode}
                    disabled={isRunning || pyodideLoading}
                    className="btn-success"
                    style={{
                        padding: "6px 16px",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: isRunning ? 0.7 : 1,
                    }}
                >
                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    {pyodideLoading ? "로딩 중..." : isRunning ? "실행 중..." : "실행"}
                </button>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, minHeight: 0 }}>
                <Editor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        lineNumbers: "on",
                        roundedSelection: true,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: "on",
                    }}
                />
            </div>

            {/* Output */}
            <div style={{ borderTop: "1px solid var(--border-glass)" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    fontSize: 12, fontWeight: 600,
                    color: "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-glass)",
                }}>
                    <Terminal size={12} />
                    실행 결과
                </div>
                <div className={`terminal-output ${isError ? "terminal-error" : ""}`}>
                    {output || "/* 코드를 실행하면 결과가 여기에 표시됩니다 */"}
                </div>
            </div>
        </div>
    );
}
