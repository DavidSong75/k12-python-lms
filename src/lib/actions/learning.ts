"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

async function getUserId() {
    const cookieStore = await cookies();
    return cookieStore.get("userId")?.value;
}

export async function getSessions() {
    return prisma.session.findMany({
        orderBy: { number: "asc" },
        include: {
            lessons: { orderBy: { order: "asc" } },
        },
    });
}

export async function getLesson(lessonId: string) {
    return prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { session: true },
    });
}

export async function getQuizzesBySessionId(sessionId: string) {
    return prisma.quiz.findMany({
        where: { sessionId },
        orderBy: { order: "asc" },
    });
}

export async function getQuizzesForSession(sessionId: string) {
    return prisma.quiz.findMany({
        where: { sessionId },
        orderBy: { order: "asc" },
    });
}

export async function markLessonComplete(lessonId: string) {
    const userId = await getUserId();
    if (!userId) return { success: false };

    await prisma.progress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, lessonId, completed: true, completedAt: new Date() },
    });
    return { success: true };
}

export async function submitQuizAnswer(quizId: string, selected: number) {
    const userId = await getUserId();
    if (!userId) return { success: false };

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return { success: false };

    const correct = quiz.answer === selected;

    await prisma.quizResult.upsert({
        where: { userId_quizId: { userId, quizId } },
        update: { selected, correct },
        create: { userId, quizId, selected, correct },
    });

    return { success: true, correct, correctAnswer: quiz.answer };
}

export async function getUserProgress() {
    const userId = await getUserId();
    if (!userId) return [];

    return prisma.progress.findMany({
        where: { userId },
        select: { lessonId: true, completed: true },
    });
}

export async function getUserQuizResults() {
    const userId = await getUserId();
    if (!userId) return [];

    return prisma.quizResult.findMany({
        where: { userId },
        select: { quizId: true, correct: true, selected: true },
    });
}
