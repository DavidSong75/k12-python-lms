"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
    });
    cookieStore.set("userRole", user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
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

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true },
        });
        return user;
    } catch (error) {
        return null;
    }
}
