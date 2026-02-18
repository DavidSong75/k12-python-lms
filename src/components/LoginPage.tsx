"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { BookOpen, Shield, Loader2, Sparkles, Code2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"student" | "admin">("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await login(email, password);
        if (result.success) {
            router.push(result.user!.role === "admin" ? "/admin" : "/learn");
            router.refresh();
        } else {
            setError(result.error || "로그인에 실패했습니다.");
            setLoading(false);
        }
    };

    const fillDemo = () => {
        if (mode === "student") {
            setEmail("minjun@school.kr");
            setPassword("student1234");
        } else {
            setEmail("admin@school.kr");
            setPassword("admin1234");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                padding: "20px",
            }}
        >
            <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: 440, padding: 40 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 60,
                            height: 60,
                            borderRadius: 16,
                            background: "var(--gradient-main)",
                            marginBottom: 16,
                        }}
                    >
                        <Code2 size={30} color="white" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
                        <span className="gradient-text">PyLearn K12</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                        파이썬 학습 플랫폼에 오신 것을 환영합니다
                    </p>
                </div>

                {/* Mode Toggle */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 24,
                        padding: 4,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 12,
                    }}
                >
                    <button
                        onClick={() => { setMode("student"); setError(""); }}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            background: mode === "student" ? "var(--gradient-main)" : "transparent",
                            color: mode === "student" ? "white" : "var(--text-secondary)",
                            transition: "all 0.3s",
                        }}
                    >
                        <BookOpen size={16} />
                        학생
                    </button>
                    <button
                        onClick={() => { setMode("admin"); setError(""); }}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            background: mode === "admin" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                            color: mode === "admin" ? "white" : "var(--text-secondary)",
                            transition: "all 0.3s",
                        }}
                    >
                        <Shield size={16} />
                        관리자
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                padding: "10px 14px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: 10,
                                color: "var(--accent-red)",
                                fontSize: 13,
                                marginBottom: 16,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: 15,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            background: mode === "admin"
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "var(--gradient-main)",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* Demo button */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button
                        onClick={fillDemo}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent-purple)",
                            fontSize: 13,
                            cursor: "pointer",
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                        }}
                    >
                        데모 계정으로 바로 시작하기
                    </button>
                </div>

                {/* Info */}
                <div
                    style={{
                        marginTop: 20,
                        padding: "10px 14px",
                        background: "rgba(139, 92, 246, 0.06)",
                        borderRadius: 10,
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                    }}
                >
                    {mode === "student" ? (
                        <>📚 학생 계정: minjun@school.kr / student1234</>
                    ) : (
                        <>🔑 관리자 계정: admin@school.kr / admin1234</>
                    )}
                </div>
            </div>
        </div>
    );
}
