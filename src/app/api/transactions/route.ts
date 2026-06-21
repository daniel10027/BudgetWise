import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/require-auth";
import { transactionSchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { checkBudgetThresholds } from "@/lib/budget-alerts";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("category");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: Record<string, unknown> = { user: auth.userId };
    if (type === "expense" || type === "income") filter.type = type;
    if (categoryId) filter.category = categoryId;
    if (search) filter.description = { $regex: search, $options: "i" };

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("category", "name type color icon")
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return apiSuccess({
      transactions: transactions.map((t) => {
        const cat = t.category as unknown as {
          _id: mongoose.Types.ObjectId;
          name?: string;
          type?: string;
          color?: string;
          icon?: string;
        } | null;
        return {
          id: t._id.toString(),
          category: cat
            ? {
                id: cat._id.toString(),
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
              }
            : null,
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: t.date,
          tags: t.tags,
          recurring: t.recurring,
          createdAt: t.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    const category = await Category.findOne({
      _id: parsed.data.category,
      user: auth.userId,
    });
    if (!category) {
      return apiError("Category not found", 404);
    }

    const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

    const transaction = await Transaction.create({
      user: auth.userId,
      category: parsed.data.category,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description || "",
      date,
      tags: parsed.data.tags || [],
      recurring: parsed.data.recurring || false,
    });

    if (parsed.data.type === "expense") {
      await checkBudgetThresholds(auth.userId, parsed.data.category, date);
    }

    return apiSuccess(
      {
        id: transaction._id.toString(),
        category: { id: category._id.toString(), name: category.name, type: category.type, color: category.color, icon: category.icon },
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        tags: transaction.tags,
        recurring: transaction.recurring,
        createdAt: transaction.createdAt,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
