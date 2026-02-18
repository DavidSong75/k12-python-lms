"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { markLessonComplete, submitQuizAnswer, getQuizzesForSession } from "@/lib/actions/learning";
import {
    LogOut, ChevronLeft, ChevronRight, BookOpen, Code2, Trophy,
    CheckCircle2, Circle, Play, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import QuizPanel from "@/components/QuizPanel";
import LessonContent from "@/components/LessonContent";

interface Session {
    id: string;
    number: number;
    title: string;
    description: string;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    order: number;
    title: string;
    type: string;
    content: string;
    sessionId: string;
}

interface Props {
    user: { id: string; name: string; role: string };
    sessions: Session[];
    initialProgress: { lessonId: string; completed: boolean }[];
    initialQuizResults: { quizId: string; correct: boolean; selected: number }[];
}

export default function LearningApp({ user, sessions, initialProgress, initialQuizResults }: Props) {
    const router = useRouter();
    const [expandedSession, setExpandedSession] = useState<number>(sessions[0]?.number ?? 1);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
        sessions[0]?.lessons?.[0] ?? null
    );
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(
        new Set(initialProgress.filter((p) => p.completed).map((p) => p.lessonId))
    );
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [quizResults, setQuizResults] = useState(initialQuizResults);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const currentSession = sessions.find(
        (s) => s.lessons.some((l) => l.id === selectedLesson?.id)
    );

    const totalLessons = sessions.reduce((acc, s) => acc + s.lessons.length, 0);
    const progressPercent = Math.round((completedLessons.size / totalLessons) * 100);

    const handleLessonComplete = useCallback(async () => {
        if (!selectedLesson) return;
        await markLessonComplete(selectedLesson.id);
        setCompletedLessons((prev) => new Set([...prev, selectedLesson.id]));
    }, [selectedLesson]);

    const navigateLesson = (direction: "prev" | "next") => {
        if (!selectedLesson || !currentSession) return;
        const allLessons = sessions.flatMap((s) => s.lessons);
        const idx = allLessons.findIndex((l) => l.id === selectedLesson.id);
        if (direction === "prev" && idx > 0) {
            setSelectedLesson(allLessons[idx - 1]);
            setShowQuiz(false);
        } else if (direction === "next" && idx < allLessons.length - 1) {
            setSelectedLesson(allLessons[idx + 1]);
            setShowQuiz(false);
        }
    };

    const handleShowQuiz = async (sessionId: string) => {
        const q = await getQuizzesForSession(sessionId);
        setQuizzes(q);
        setShowQuiz(true);
    };

    const handleQuizSubmit = async (quizId: string, selected: number) => {
        const result = await submitQuizAnswer(quizId, selected);
        if (result.success) {
            setQuizResults((prev) => {
                const exists = prev.find((r) => r.quizId === quizId);
                if (exists) {
                    return prev.map((r) => r.quizId === quizId ? { quizId, correct: result.correct!, selected } : r);
                }
                return [...prev, { quizId, correct: result.correct!, selected }];
            });
        }
        return result;
    };

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    // Find current lesson index within all lessons
    const allLessons = sessions.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === selectedLesson?.id);

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            {/* Sidebar */}
            <div
                style={{
                    width: sidebarOpen ? 300 : 0,
                    minWidth: sidebarOpen ? 300 : 0,
                    borderRight: sidebarOpen ? "1px solid var(--border-glass)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(15, 15, 26, 0.95)",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                }}
            >
                {/* Sidebar Header */}
                <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "var(--gradient-main)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Code2 size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700 }} className="gradient-text">PyLearn K12</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{user.name}님 환영합니다</div>
                        </div>
                        <button onClick={handleLogout} style={{
                            marginLeft: "auto", background: "none", border: "none",
                            color: "var(--text-secondary)", cursor: "pointer", padding: 4
                        }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                    {/* Progress */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                        <Trophy size={14} color="var(--accent-orange)" />
                        진도율 {progressPercent}%
                    </div>
                    <div className="progress-bar" style={{ marginTop: 6 }}>
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                {/* Session List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                    {sessions.map((session) => {
                        const isExpanded = expandedSession === session.number;
                        const sessionCompleted = session.lessons.every((l) => completedLessons.has(l.id));
                        const sessionLessonsDone = session.lessons.filter((l) => completedLessons.has(l.id)).length;

                        return (
                            <div key={session.id} style={{ marginBottom: 4 }}>
                                <button
                                    onClick={() => setExpandedSession(isExpanded ? -1 : session.number)}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "none",
                                        background: isExpanded ? "rgba(139, 92, 246, 0.08)" : "transparent",
                                        color: "var(--text-primary)",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textAlign: "left",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: 24, height: 24, borderRadius: 8,
                                        background: sessionCompleted ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.1)",
                                        fontSize: 11, fontWeight: 700,
                                        color: sessionCompleted ? "var(--accent-green)" : "var(--accent-purple)",
                                    }}>
                                        {session.number}
                                    </span>
                                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {session.title}
                                    </span>
                                    <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                                        {sessionLessonsDone}/{session.lessons.length}
                                    </span>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {isExpanded && (
                                    <div style={{ paddingLeft: 8, paddingTop: 4 }}>
                                        {session.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`sidebar-item ${selectedLesson?.id === lesson.id ? "active" : ""}`}
                                                onClick={() => { setSelectedLesson(lesson); setShowQuiz(false); }}
                                            >
                                                {completedLessons.has(lesson.id) ? (
                                                    <CheckCircle2 size={14} color="var(--accent-green)" />
                                                ) : (
                                                    <Circle size={14} />
                                                )}
                                                <span style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {lesson.title}
                                                </span>
                                                <span className={`badge ${lesson.type === "lesson" ? "badge-lesson" : lesson.type === "quiz" ? "badge-quiz" : "badge-practice"}`}>
                                                    {lesson.type === "lesson" ? "이론" : lesson.type === "quiz" ? "퀴즈" : "실습"}
                                                </span>
                                            </div>
                                        ))}
                                        <div
                                            className="sidebar-item"
                                            onClick={() => handleShowQuiz(session.id)}
                                            style={{ color: "var(--accent-orange)" }}
                                        >
                                            <Zap size={14} />
                                            <span style={{ flex: 1, fontSize: 12 }}>퀴즈 풀기</span>
                                            <span className="badge badge-quiz">3문제</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Top Bar */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border-glass)",
                    gap: 12,
                    background: "rgba(15, 15, 26, 0.8)",
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn-secondary"
                        style={{ padding: "6px 10px" }}
                    >
                        <BookOpen size={16} />
                    </button>
                    <div style={{ flex: 1, fontSize: 14 }}>
                        {currentSession && (
                            <span style={{ color: "var(--text-secondary)" }}>
                                {currentSession.number}차시: {currentSession.title}
                                {selectedLesson && !showQuiz && (
                                    <span style={{ color: "var(--accent-purple)" }}> › {selectedLesson.title}</span>
                                )}
                                {showQuiz && (
                                    <span style={{ color: "var(--accent-orange)" }}> › 퀴즈</span>
                                )}
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {currentIndex + 1} / {allLessons.length}
                        </span>
                        <button onClick={() => navigateLesson("prev")} className="btn-secondary" style={{ padding: "6px 10px" }} disabled={currentIndex <= 0}>
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => navigateLesson("next")} className="btn-secondary" style={{ padding: "6px 10px" }} disabled={currentIndex >= allLessons.length - 1}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {showQuiz ? (
                    <QuizPanel
                        quizzes={quizzes}
                        quizResults={quizResults}
                        onSubmit={handleQuizSubmit}
                        onClose={() => setShowQuiz(false)}
                    />
                ) : selectedLesson ? (
                    <div className="split-container" style={{ flex: 1 }}>
                        {/* Left - Lesson Content */}
                        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "24px 28px", borderRight: "1px solid var(--border-glass)" }}>
                            <LessonContent content={selectedLesson.content} />
                            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                                {!completedLessons.has(selectedLesson.id) && (
                                    <button onClick={handleLessonComplete} className="btn-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CheckCircle2 size={16} />
                                        학습 완료
                                    </button>
                                )}
                                {completedLessons.has(selectedLesson.id) && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-green)", fontSize: 14 }}>
                                        <CheckCircle2 size={16} />
                                        완료됨
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Right - Code Editor */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <CodeEditor />
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        왼쪽 메뉴에서 학습할 레슨을 선택하세요
                    </div>
                )}
            </div>
        </div>
    );
}
