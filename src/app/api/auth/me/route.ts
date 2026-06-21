import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return apiError("Not authenticated", 401);
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId).lean();

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
