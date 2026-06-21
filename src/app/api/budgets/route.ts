import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { requireAuth } from "@/lib/require-auth";
import { budgetSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter: Record<string, unknown> = { user: auth.userId };
    if (month) filter.month = parseInt(month, 10);
    if (year) filter.year = parseInt(year, 10);

    const budgets = await Budget.find(filter).sort({ year: -1, month: -1 }).lean();

    return apiSuccess(
      budgets.map((b) => ({
        id: b._id.toString(),
        month: b.month,
        year: b.year,
        totalLimit: b.totalLimit,
      }))
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    const budget = await Budget.findOneAndUpdate(
      { user: auth.userId, month: parsed.data.month, year: parsed.data.year },
      { $set: { totalLimit: parsed.data.totalLimit } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return apiSuccess(
      {
        id: budget._id.toString(),
        month: budget.month,
        year: budget.year,
        totalLimit: budget.totalLimit,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
