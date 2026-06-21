import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/require-auth";
import { transactionSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { checkBudgetThresholds } from "@/lib/budget-alerts";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = transactionSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    if (parsed.data.category) {
      const category = await Category.findOne({ _id: parsed.data.category, user: auth.userId });
      if (!category) {
        return apiError("Category not found", 404);
      }
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) {
      updateData.date = new Date(parsed.data.date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: auth.userId },
      { $set: updateData },
      { new: true }
    ).populate("category", "name type color icon");

    if (!transaction) {
      return apiError("Transaction not found", 404);
    }

    if (transaction.type === "expense") {
      await checkBudgetThresholds(auth.userId, transaction.category._id.toString(), transaction.date);
    }

    return apiSuccess({
      id: transaction._id.toString(),
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      tags: transaction.tags,
      recurring: transaction.recurring,
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

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: auth.userId });
    if (!transaction) {
      return apiError("Transaction not found", 404);
    }

    return apiSuccess({ message: "Transaction deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
