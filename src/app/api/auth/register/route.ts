import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
import Notification from "@/models/Notification";
import { hashPassword, signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    const { name, email, password, currency } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const isFirstUser = (await User.countDocuments({})) === 0;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      currency: currency || "XOF",
      role: isFirstUser ? "admin" : "user",
    });

    // Seed default categories for the new user
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user: user._id }))
    );

    await Notification.create({
      user: user._id,
      type: "welcome",
      title: "Bienvenue sur BudgetWise !",
      message: "Votre compte a été créé avec succès. Commencez par ajouter vos premières transactions.",
    });

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    const response = apiSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
          createdAt: user.createdAt,
        },
      },
      201
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
