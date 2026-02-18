"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Zap, ArrowLeft, Trophy } from "lucide-react";

interface Quiz {
    id: string;
    question: string;
    options: string;
    answer: number;
    order: number;
}

interface QuizResult {
    quizId: string;
    correct: boolean;
    selected: number;
}

interface Props {
    quizzes: Quiz[];
    quizResults: QuizResult[];
    onSubmit: (quizId: string, selected: number) => Promise<{ success: boolean; correct?: boolean; correctAnswer?: number }>;
    onClose: () => void;
}

export default function QuizPanel({ quizzes, quizResults, onSubmit, onClose }: Props) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [lastResult, setLastResult] = useState<{ correct: boolean; correctAnswer: number } | null>(null);
    const [scores, setScores] = useState<Map<string, boolean>>(
        new Map(quizResults.map((r) => [r.quizId, r.correct]))
    );

    if (quizzes.length === 0) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
                <Zap size={48} color="var(--accent-orange)" />
                <p style={{ color: "var(--text-secondary)" }}>이 세션에 퀴즈가 없습니다.</p>
                <button onClick={onClose} className="btn-secondary">돌아가기</button>
            </div>
        );
    }

    const quiz = quizzes[currentIdx];
    const options: string[] = JSON.parse(quiz.options);
    const existingResult = quizResults.find((r) => r.quizId === quiz.id);
    const totalCorrect = Array.from(scores.values()).filter(Boolean).length;
    const allDone = currentIdx >= quizzes.length;

    if (allDone || (currentIdx === quizzes.length && submitted)) {
        return (
            <div className="animate-fade-in" style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <div className="glass-card" style={{ padding: 40, textAlign: "center", maxWidth: 420 }}>
                    <Trophy size={56} color="var(--accent-orange)" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>퀴즈 완료!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 16 }}>
                        {totalCorrect}/{quizzes.length} 문제를 맞혔습니다
                    </p>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 80, height: 80, borderRadius: "50%",
                        background: totalCorrect === quizzes.length ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        fontSize: 28, fontWeight: 700,
                        color: totalCorrect === quizzes.length ? "var(--accent-green)" : "var(--accent-orange)",
                        marginBottom: 24,
                    }}>
                        {Math.round((totalCorrect / quizzes.length) * 100)}%
                    </div>
                    <div>
                        <button onClick={onClose} className="btn-primary" style={{ padding: "12px 32px" }}>
                            학습으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (selectedOption === null) return;
        const result = await onSubmit(quiz.id, selectedOption);
        if (result.success) {
            setSubmitted(true);
            setLastResult({ correct: result.correct!, correctAnswer: result.correctAnswer! });
            setScores((prev) => new Map(prev).set(quiz.id, result.correct!));
        }
    };

    const handleNext = () => {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setSubmitted(false);
        setLastResult(null);
    };

    return (
        <div className="animate-fade-in" style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
            <div style={{ width: "100%", maxWidth: 600 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: "6px 10px" }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            문제 {currentIdx + 1} / {quizzes.length}
                        </div>
                        <div className="progress-bar" style={{ width: 200, marginTop: 4 }}>
                            <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / quizzes.length) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                    }}>
                        <Zap size={20} color="var(--accent-orange)" />
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{quiz.question}</h3>
                    </div>

                    {/* Options */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {options.map((option, idx) => {
                            let className = "quiz-option";
                            if (submitted && lastResult) {
                                if (idx === lastResult.correctAnswer) className += " correct";
                                else if (idx === selectedOption && !lastResult.correct) className += " wrong";
                            } else if (idx === selectedOption) {
                                className += " selected";
                            }

                            return (
                                <div
                                    key={idx}
                                    className={className}
                                    onClick={() => !submitted && setSelectedOption(idx)}
                                    style={{ cursor: submitted ? "default" : "pointer" }}
                                >
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: "rgba(139, 92, 246, 0.1)", fontSize: 13, fontWeight: 600,
                                        color: "var(--accent-purple)",
                                    }}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span style={{ flex: 1, fontSize: 14 }}>{option}</span>
                                    {submitted && lastResult && idx === lastResult.correctAnswer && (
                                        <CheckCircle2 size={18} color="var(--accent-green)" />
                                    )}
                                    {submitted && lastResult && idx === selectedOption && !lastResult.correct && idx !== lastResult.correctAnswer && (
                                        <XCircle size={18} color="var(--accent-red)" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {submitted && lastResult && (
                        <div style={{
                            marginTop: 16,
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: lastResult.correct ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                            border: `1px solid ${lastResult.correct ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                            color: lastResult.correct ? "var(--accent-green)" : "var(--accent-red)",
                            fontSize: 14,
                            fontWeight: 600,
                        }}>
                            {lastResult.correct ? "🎉 정답입니다!" : "😢 틀렸습니다. 정답을 확인하세요!"}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        {!submitted ? (
                            <button onClick={handleSubmit} className="btn-primary" disabled={selectedOption === null} style={{ opacity: selectedOption === null ? 0.5 : 1 }}>
                                제출하기
                            </button>
                        ) : (
                            <button onClick={handleNext} className="btn-primary">
                                {currentIdx < quizzes.length - 1 ? "다음 문제" : "결과 보기"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
