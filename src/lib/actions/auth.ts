"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    // Support both hashed and plain passwords (for migration period)
    let isValid = false;
    if (user.password.startsWith("$2")) {
        // bcrypt hashed password
        isValid = await bcrypt.compare(password, user.password);
    } else {
        // legacy plain text password
        isValid = user.password === password;
    }

    if (!isValid) {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("userRole", user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true, user: { id: user.id, name: user.name, role: user.role } };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    cookieStore.delete("userRole");
    return { success: true };
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
    });
    return user;
}
