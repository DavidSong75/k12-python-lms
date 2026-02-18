"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { updateLessonContent, updateSessionInfo } from "@/lib/actions/admin";
import {
    LogOut, Users, BookOpen, BarChart3, Edit3, Save, X,
    ChevronDown, ChevronUp, Code2, GraduationCap, CheckCircle2, XCircle, Trophy
} from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    progress: { lessonId: string; completed: boolean; completedAt: Date | null }[];
    quizResults: { quizId: string; correct: boolean; createdAt: Date }[];
}

interface SessionData {
    id: string;
    number: number;
    title: string;
    description: string;
    lessons: {
        id: string;
        order: number;
        title: string;
        type: string;
        content: string;
        _count: { progress: number };
    }[];
}

interface Props {
    user: { id: string; name: string; role: string };
    students: Student[];
    totalLessons: number;
    totalQuizzes: number;
    curriculum: SessionData[];
}

export default function AdminDashboard({ user, students, totalLessons, totalQuizzes, curriculum }: Props) {
    const router = useRouter();
    const [tab, setTab] = useState<"students" | "content">("students");
    const [expandedSession, setExpandedSession] = useState<number | null>(null);
    const [editingLesson, setEditingLesson] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    const startEdit = (lesson: { id: string; title: string; content: string }) => {
        setEditingLesson(lesson.id);
        setEditTitle(lesson.title);
        setEditContent(lesson.content);
    };

    const saveEdit = async () => {
        if (!editingLesson) return;
        setSaving(true);
        await updateLessonContent(editingLesson, { title: editTitle, content: editContent });
        setSaving(false);
        setEditingLesson(null);
        router.refresh();
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            {/* Sidebar */}
            <div style={{
                width: 260, minWidth: 260,
                borderRight: "1px solid var(--border-glass)",
                display: "flex", flexDirection: "column",
                background: "rgba(15, 15, 26, 0.95)",
            }}>
                {/* Header */}
                <div style={{ padding: "16px", borderBottom: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <GraduationCap size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-orange)" }}>관리자</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{user.name}님</div>
                        </div>
                        <button onClick={handleLogout} style={{
                            marginLeft: "auto", background: "none", border: "none",
                            color: "var(--text-secondary)", cursor: "pointer", padding: 4
                        }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Nav */}
                <div style={{ padding: "12px 8px" }}>
                    <div
                        className={`sidebar-item ${tab === "students" ? "active" : ""}`}
                        onClick={() => setTab("students")}
                    >
                        <Users size={16} />
                        학생 관리
                    </div>
                    <div
                        className={`sidebar-item ${tab === "content" ? "active" : ""}`}
                        onClick={() => setTab("content")}
                    >
                        <BookOpen size={16} />
                        콘텐츠 편집
                    </div>
                </div>

                {/* Stats */}
                <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div className="glass-card-sm" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-purple)" }}>{students.length}</div>
                            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>학생 수</div>
                        </div>
                        <div className="glass-card-sm" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-blue)" }}>{totalLessons}</div>
                            <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>레슨 수</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
                {tab === "students" && (
                    <div className="animate-fade-in">
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <BarChart3 size={24} color="var(--accent-purple)" />
                            <h1 style={{ fontSize: 22, fontWeight: 700 }}>학생 진도 현황</h1>
                        </div>

                        {/* Summary Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Users size={20} color="var(--accent-purple)" />
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>{students.length}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>전체 학생</div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <CheckCircle2 size={20} color="var(--accent-green)" />
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                                            {Math.round(students.reduce((acc, s) => acc + s.progress.filter(p => p.completed).length, 0) / Math.max(students.length, 1))}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>평균 완료 레슨</div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Trophy size={20} color="var(--accent-orange)" />
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                                            {students.length > 0
                                                ? Math.round(
                                                    (students.reduce((acc, s) => acc + s.quizResults.filter((q) => q.correct).length, 0) /
                                                        Math.max(students.reduce((acc, s) => acc + s.quizResults.length, 0), 1)) * 100
                                                )
                                                : 0}%
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>평균 퀴즈 정답률</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Table */}
                        <div className="glass-card" style={{ overflow: "hidden" }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>완료 레슨</th>
                                        <th>진도율</th>
                                        <th>퀴즈 정답</th>
                                        <th>퀴즈 정답률</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => {
                                        const completedCount = student.progress.filter((p) => p.completed).length;
                                        const progressPct = Math.round((completedCount / totalLessons) * 100);
                                        const quizCorrect = student.quizResults.filter((q) => q.correct).length;
                                        const quizTotal = student.quizResults.length;
                                        const quizPct = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;

                                        return (
                                            <tr key={student.id}>
                                                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>{completedCount} / {totalLessons}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div className="progress-bar" style={{ width: 80 }}>
                                                            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                                                        </div>
                                                        <span style={{ fontSize: 12 }}>{progressPct}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {quizCorrect} / {quizTotal}
                                                    {quizTotal > 0 && (
                                                        <span style={{ marginLeft: 6 }}>
                                                            {quizCorrect === quizTotal ? (
                                                                <CheckCircle2 size={14} color="var(--accent-green)" style={{ verticalAlign: "middle" }} />
                                                            ) : (
                                                                <span style={{ color: "var(--accent-orange)", fontSize: 12 }}>⚠</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                        background: quizPct >= 80 ? "rgba(16,185,129,0.12)" : quizPct >= 50 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                                                        color: quizPct >= 80 ? "var(--accent-green)" : quizPct >= 50 ? "var(--accent-orange)" : "var(--accent-red)",
                                                    }}>
                                                        {quizPct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === "content" && (
                    <div className="animate-fade-in">
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <Edit3 size={24} color="var(--accent-blue)" />
                            <h1 style={{ fontSize: 22, fontWeight: 700 }}>커리큘럼 편집</h1>
                        </div>

                        {/* Editing Modal */}
                        {editingLesson && (
                            <div style={{
                                position: "fixed", inset: 0, zIndex: 100,
                                background: "rgba(0,0,0,0.7)",
                                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
                            }}>
                                <div className="glass-card" style={{ width: "100%", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 24 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                        <Edit3 size={20} color="var(--accent-blue)" />
                                        <h2 style={{ fontSize: 18, fontWeight: 600 }}>레슨 편집</h2>
                                        <div style={{ flex: 1 }} />
                                        <button onClick={() => setEditingLesson(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>제목</label>
                                        <input className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, marginBottom: 16 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>콘텐츠 (Markdown)</label>
                                        <textarea
                                            className="input-field"
                                            style={{ height: "100%", minHeight: 300, resize: "vertical", fontFamily: "'Fira Code', monospace", fontSize: 13, lineHeight: 1.6 }}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                        <button onClick={() => setEditingLesson(null)} className="btn-secondary">취소</button>
                                        <button onClick={saveEdit} className="btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Save size={14} />
                                            {saving ? "저장 중..." : "저장"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Session List */}
                        {curriculum.map((session) => (
                            <div key={session.id} className="glass-card" style={{ marginBottom: 12, overflow: "hidden" }}>
                                <button
                                    onClick={() => setExpandedSession(expandedSession === session.number ? null : session.number)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                                        padding: "16px 20px", border: "none",
                                        background: "transparent", color: "var(--text-primary)",
                                        cursor: "pointer", fontSize: 15, fontWeight: 600, textAlign: "left",
                                    }}
                                >
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: 32, height: 32, borderRadius: 8,
                                        background: "rgba(139, 92, 246, 0.1)",
                                        fontSize: 14, fontWeight: 700, color: "var(--accent-purple)",
                                    }}>
                                        {session.number}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div>{session.title}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>
                                            {session.description} · {session.lessons.length}개 레슨
                                        </div>
                                    </div>
                                    {expandedSession === session.number ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expandedSession === session.number && (
                                    <div style={{ padding: "0 20px 16px" }}>
                                        {session.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 12,
                                                    padding: "10px 14px", marginBottom: 4,
                                                    borderRadius: 10, background: "rgba(255,255,255,0.02)",
                                                }}
                                            >
                                                <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 20 }}>{lesson.order}.</span>
                                                <span style={{ flex: 1, fontSize: 13 }}>{lesson.title}</span>
                                                <span className={`badge ${lesson.type === "lesson" ? "badge-lesson" : "badge-practice"}`}>
                                                    {lesson.type === "lesson" ? "이론" : "실습"}
                                                </span>
                                                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                                    완료: {lesson._count.progress}명
                                                </span>
                                                <button
                                                    onClick={() => startEdit(lesson)}
                                                    className="btn-secondary"
                                                    style={{ padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}
                                                >
                                                    <Edit3 size={12} />
                                                    편집
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
