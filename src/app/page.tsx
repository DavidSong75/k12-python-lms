import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import LoginPage from "@/components/LoginPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/learn");
    }
  }
  return <LoginPage />;
}
