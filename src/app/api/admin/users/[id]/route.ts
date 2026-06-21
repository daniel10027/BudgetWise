import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/require-auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    if (id === admin.userId && parsed.data.role !== "admin") {
      return apiError("You cannot remove your own admin privileges", 400);
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(id, { $set: { role: parsed.data.role } }, { new: true });
    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = requireAdmin(req);
    const { id } = await params;

    if (id === admin.userId) {
      return apiError("You cannot delete your own account here", 400);
    }

    await connectToDatabase();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({ message: "User deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
