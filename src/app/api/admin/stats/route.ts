import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { requireAdmin } from "@/lib/require-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    await connectToDatabase();

    const [totalUsers, totalTransactions, totals, newUsersThisMonth] = await Promise.all([
      User.countDocuments({}),
      Transaction.countDocuments({}),
      Transaction.aggregate([
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

    const totalIncome = totals.find((t) => t._id === "income")?.total ?? 0;
    const totalExpense = totals.find((t) => t._id === "expense")?.total ?? 0;

    const signupTrend = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    return apiSuccess({
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpense,
      newUsersThisMonth,
      signupTrend: signupTrend.map((s) => ({
        month: s._id.month,
        year: s._id.year,
        count: s.count,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
