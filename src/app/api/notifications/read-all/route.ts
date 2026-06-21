import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    await Notification.updateMany({ user: auth.userId, read: false }, { $set: { read: true } });

    return apiSuccess({ message: "All notifications marked as read" });
  } catch (err) {
    return handleApiError(err);
  }
}
