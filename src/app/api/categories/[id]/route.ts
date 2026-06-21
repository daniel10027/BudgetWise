import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/require-auth";
import { categorySchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    const category = await Category.findOneAndUpdate(
      { _id: id, user: auth.userId },
      { $set: parsed.data },
      { new: true }
    );

    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess({
      id: category._id.toString(),
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      monthlyLimit: category.monthlyLimit,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    const { id } = await params;

    await connectToDatabase();

    const inUse = await Transaction.countDocuments({ category: id, user: auth.userId });
    if (inUse > 0) {
      return apiError(
        `Cannot delete: ${inUse} transaction(s) use this category. Reassign or delete them first.`,
        409
      );
    }

    const category = await Category.findOneAndDelete({ _id: id, user: auth.userId });
    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess({ message: "Category deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
