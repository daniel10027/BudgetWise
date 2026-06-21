import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    const notifications = await Notification.find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: auth.userId, read: false });

    return apiSuccess({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
