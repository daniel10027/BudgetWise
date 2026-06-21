import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);

    const userObjectId = new mongoose.Types.ObjectId(auth.userId);
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    // Totals for the selected month
    const monthTotals = await Transaction.aggregate([
      { $match: { user: userObjectId, date: { $gte: startOfMonth, $lt: startOfNextMonth } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const totalIncome = monthTotals.find((t) => t._id === "income")?.total ?? 0;
    const totalExpense = monthTotals.find((t) => t._id === "expense")?.total ?? 0;

    // Spending by category (expenses only) for the selected month
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: "expense",
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: { $toString: "$_id" },
          name: "$categoryInfo.name",
          color: "$categoryInfo.color",
          icon: "$categoryInfo.icon",
          monthlyLimit: "$categoryInfo.monthlyLimit",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Last 6 months trend (income vs expense)
    const sixMonthsAgo = new Date(year, month - 6, 1);
    const trendRaw = await Transaction.aggregate([
      { $match: { user: userObjectId, date: { $gte: sixMonthsAgo, $lt: startOfNextMonth } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const trendMap = new Map<string, { month: number; year: number; income: number; expense: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap.set(key, { month: d.getMonth() + 1, year: d.getFullYear(), income: 0, expense: 0 });
    }
    for (const row of trendRaw) {
      const key = `${row._id.year}-${row._id.month}`;
      const entry = trendMap.get(key);
      if (entry) {
        if (row._id.type === "income") entry.income = row.total;
        else entry.expense = row.total;
      }
    }

    // Budget for selected month
    const budget = await Budget.findOne({ user: userObjectId, month, year }).lean();

    // Recent transactions
    const recent = await Transaction.find({ user: auth.userId })
      .populate("category", "name color icon")
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .lean();

    return apiSuccess({
      month,
      year,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      budgetLimit: budget?.totalLimit ?? 0,
      byCategory,
      trend: Array.from(trendMap.values()),
      recentTransactions: recent.map((t) => {
        const cat = t.category as unknown as { _id: mongoose.Types.ObjectId; name?: string; color?: string; icon?: string } | null;
        return {
          id: t._id.toString(),
          category: cat ? { id: cat._id.toString(), name: cat.name, color: cat.color, icon: cat.icon } : null,
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: t.date,
        };
      }),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
