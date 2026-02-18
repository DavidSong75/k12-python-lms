import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { session1, session2 } from "./data/sessions1_2";
import { session3, session4 } from "./data/sessions3_4";
import { session5, session6 } from "./data/sessions5_6";
import { session7, session8 } from "./data/sessions7_8";
import { session9 } from "./data/sessions9";
import { session10, session11 } from "./data/sessions10_11";

const allSessions = [session1, session2, session3, session4, session5, session6, session7, session8, session9, session10, session11];

function genId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is not set");

    const sql = neon(dbUrl);

    // Clear existing data
    await sql`DELETE FROM "QuizResult"`;
    await sql`DELETE FROM "Progress"`;
    await sql`DELETE FROM "Quiz"`;
    await sql`DELETE FROM "Lesson"`;
    await sql`DELETE FROM "Session"`;
    await sql`DELETE FROM "User"`;
    console.log("🗑️  Cleared existing data");

    // Hash passwords
    const adminPw = await bcrypt.hash("admin1234", 10);
    const studentPw = await bcrypt.hash("student1234", 10);

    // Create users
    await sql`INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
    VALUES (${genId()}, '김선생', 'admin@school.kr', ${adminPw}, 'admin', NOW(), NOW())`;

    const students = [
        { name: "이민준", email: "minjun@school.kr" },
        { name: "김서윤", email: "seoyun@school.kr" },
        { name: "박도현", email: "dohyun@school.kr" },
    ];
    for (const s of students) {
        await sql`INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
      VALUES (${genId()}, ${s.name}, ${s.email}, ${studentPw}, 'student', NOW(), NOW())`;
    }
    console.log("👤 Users created (4)");

    // Seed sessions, lessons, quizzes
    for (const sessionData of allSessions) {
        const sessionId = genId();
        await sql`INSERT INTO "Session" ("id", "number", "title", "description", "duration")
      VALUES (${sessionId}, ${sessionData.number}, ${sessionData.title}, ${sessionData.description}, 100)`;

        for (const lessonData of sessionData.lessons) {
            await sql`INSERT INTO "Lesson" ("id", "sessionId", "order", "title", "type", "content")
        VALUES (${genId()}, ${sessionId}, ${lessonData.order}, ${lessonData.title}, ${lessonData.type}, ${lessonData.content})`;
        }

        for (const quizData of sessionData.quizzes) {
            await sql`INSERT INTO "Quiz" ("id", "sessionId", "question", "options", "answer", "order")
        VALUES (${genId()}, ${sessionId}, ${quizData.question}, ${quizData.options}, ${quizData.answer}, ${quizData.order})`;
        }

        console.log(`✅ Session ${sessionData.number}: ${sessionData.title} (${sessionData.lessons.length} lessons, ${sessionData.quizzes.length} quizzes)`);
    }

    const totalLessons = allSessions.reduce((acc, s) => acc + s.lessons.length, 0);
    const totalQuizzes = allSessions.reduce((acc, s) => acc + s.quizzes.length, 0);
    console.log(`\n🎉 Seeded ${totalLessons} lessons, ${totalQuizzes} quizzes across ${allSessions.length} sessions`);
    console.log(`🔐 Passwords hashed with bcrypt`);
}

main().catch((e) => { console.error(e); process.exit(1); });
