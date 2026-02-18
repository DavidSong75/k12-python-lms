import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { session1, session2 } from "./data/sessions1_2";
import { session3, session4 } from "./data/sessions3_4";
import { session5, session6 } from "./data/sessions5_6";
import { session7, session8 } from "./data/sessions7_8";
import { session9 } from "./data/sessions9";
import { session10, session11 } from "./data/sessions10_11";

const prisma = new PrismaClient();

const allSessions = [session1, session2, session3, session4, session5, session6, session7, session8, session9, session10, session11];

async function main() {
    // Clear existing data
    await prisma.quizResult.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.session.deleteMany();

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin1234", 10);
    const studentPassword = await bcrypt.hash("student1234", 10);

    // Create/update users
    await prisma.user.upsert({
        where: { email: "admin@school.kr" },
        update: { password: adminPassword }, // Update password just in case
        create: { name: "김선생", email: "admin@school.kr", password: adminPassword, role: "admin" },
    });

    const studentNames = [
        { name: "이민준", email: "minjun@school.kr" },
        { name: "김서윤", email: "seoyun@school.kr" },
        { name: "박도현", email: "dohyun@school.kr" },
    ];

    for (const s of studentNames) {
        await prisma.user.upsert({
            where: { email: s.email },
            update: { password: studentPassword },
            create: { name: s.name, email: s.email, password: studentPassword, role: "student" },
        });
    }

    // Seed sessions, lessons, quizzes
    for (const sessionData of allSessions) {
        const session = await prisma.session.create({
            data: {
                number: sessionData.number,
                title: sessionData.title,
                description: sessionData.description,
                duration: 100,
            },
        });

        for (const lessonData of sessionData.lessons) {
            await prisma.lesson.create({
                data: {
                    sessionId: session.id,
                    order: lessonData.order,
                    title: lessonData.title,
                    type: lessonData.type,
                    content: lessonData.content,
                },
            });
        }

        for (const quizData of sessionData.quizzes) {
            await prisma.quiz.create({
                data: {
                    sessionId: session.id,
                    question: quizData.question,
                    options: quizData.options,
                    answer: quizData.answer,
                    order: quizData.order,
                },
            });
        }

        console.log(`✅ Session ${sessionData.number}: ${sessionData.title} (${sessionData.lessons.length} lessons, ${sessionData.quizzes.length} quizzes)`);
    }

    const totalLessons = allSessions.reduce((acc, s) => acc + s.lessons.length, 0);
    const totalQuizzes = allSessions.reduce((acc, s) => acc + s.quizzes.length, 0);
    console.log(`\n🎉 Done! Total: ${totalLessons} lessons, ${totalQuizzes} quizzes across ${allSessions.length} sessions`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());
