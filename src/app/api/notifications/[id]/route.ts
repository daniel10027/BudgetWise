import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    const { id } = await params;

    await connectToDatabase();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: auth.userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return apiError("Notification not found", 404);
    }

    return apiSuccess({ id: notification._id.toString(), read: notification.read });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    const { id } = await params;

    await connectToDatabase();

    const notification = await Notification.findOneAndDelete({ _id: id, user: auth.userId });
    if (!notification) {
      return apiError("Notification not found", 404);
    }

    return apiSuccess({ message: "Notification deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
