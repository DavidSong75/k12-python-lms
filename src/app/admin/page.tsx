import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getAllStudents, getTotalLessons, getTotalQuizzes, getFullCurriculum } from "@/lib/actions/admin";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/");
    if (user.role !== "admin") redirect("/learn");

    const students = await getAllStudents();
    const totalLessons = await getTotalLessons();
    const totalQuizzes = await getTotalQuizzes();
    const curriculum = await getFullCurriculum();

    return (
        <AdminDashboard
            user={user}
            students={students}
            totalLessons={totalLessons}
            totalQuizzes={totalQuizzes}
            curriculum={curriculum}
        />
    );
}
