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

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    const userIds = users.map((u) => u._id);
    const txCounts = await Transaction.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(txCounts.map((t) => [t._id.toString(), t.count]));

    return apiSuccess(
      users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        currency: u.currency,
        monthlyIncome: u.monthlyIncome,
        transactionCount: countMap.get(u._id.toString()) ?? 0,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    return handleApiError(err);
  }
}
