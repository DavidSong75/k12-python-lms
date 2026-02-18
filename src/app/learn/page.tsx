import { getCurrentUser } from "@/lib/actions/auth";
import { getSessions, getUserProgress, getUserQuizResults } from "@/lib/actions/learning";
import { redirect } from "next/navigation";
import LearningApp from "@/components/LearningApp";

export default async function LearnPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/");
    if (user.role === "admin") redirect("/admin");

    const sessions = await getSessions();
    const progress = await getUserProgress();
    const quizResults = await getUserQuizResults();

    return (
        <LearningApp
            user={user}
            sessions={sessions}
            initialProgress={progress}
            initialQuizResults={quizResults}
        />
    );
}
