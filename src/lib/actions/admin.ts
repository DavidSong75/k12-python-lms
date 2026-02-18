"use server";

import { prisma } from "@/lib/db";

// Get all students with progress and quiz data
export async function getAllStudents() {
    const students = await prisma.user.findMany({
        where: { role: "student" },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            progress: {
                select: { lessonId: true, completed: true, completedAt: true },
            },
            quizResults: {
                select: { quizId: true, correct: true, createdAt: true },
            },
        },
    });
    return students;
}

// Get total lesson count
export async function getTotalLessons() {
    return prisma.lesson.count();
}

// Get total quiz count
export async function getTotalQuizzes() {
    return prisma.quiz.count();
}

// Update lesson content
export async function updateLessonContent(
    lessonId: string,
    data: { title?: string; content?: string }
) {
    const updated = await prisma.lesson.update({
        where: { id: lessonId },
        data,
    });
    return { success: true, lesson: updated };
}

// Update session info
export async function updateSessionInfo(
    sessionId: string,
    data: { title?: string; description?: string }
) {
    const updated = await prisma.session.update({
        where: { id: sessionId },
        data,
    });
    return { success: true, session: updated };
}

// Get full curriculum for admin editing
export async function getFullCurriculum() {
    return prisma.session.findMany({
        orderBy: { number: "asc" },
        include: {
            lessons: {
                orderBy: { order: "asc" },
                include: {
                    _count: { select: { progress: { where: { completed: true } } } },
                },
            },
        },
    });
}
