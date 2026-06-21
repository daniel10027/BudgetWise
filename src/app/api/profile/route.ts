import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/require-auth";
import { updateProfileSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { $set: parsed.data },
      { new: true }
    );

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      currency: user.currency,
      monthlyIncome: user.monthlyIncome,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
