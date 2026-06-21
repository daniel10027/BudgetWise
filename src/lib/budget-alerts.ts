import mongoose from "mongoose";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Notification from "@/models/Notification";

/**
 * Checks the user's spending against their monthly total budget and
 * per-category limits after a new expense transaction is recorded.
 * Creates notifications when thresholds (80% warning, 100% exceeded) are crossed.
 */
export async function checkBudgetThresholds(
  userId: string,
  categoryId: string,
  date: Date
): Promise<void> {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // --- Total monthly budget check ---
  const budget = await Budget.findOne({ user: userObjectId, month, year }).lean();
  if (budget && budget.totalLimit > 0) {
    const agg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: "expense",
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSpent: number = agg[0]?.total ?? 0;
    const ratio = totalSpent / budget.totalLimit;

    if (ratio >= 1) {
      await maybeNotify(
        userId,
        "budget_exceeded",
        "Budget mensuel dépassé",
        `Vous avez dépensé ${totalSpent.toFixed(2)} sur un budget de ${budget.totalLimit.toFixed(2)} ce mois-ci.`
      );
    } else if (ratio >= 0.8) {
      await maybeNotify(
        userId,
        "budget_warning",
        "Attention à votre budget",
        `Vous avez utilisé ${(ratio * 100).toFixed(0)}% de votre budget mensuel total.`
      );
    }
  }

  // --- Per-category limit check ---
  const category = await Category.findOne({ _id: categoryId, user: userObjectId }).lean();
  if (category && category.monthlyLimit > 0) {
    const agg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          category: new mongoose.Types.ObjectId(categoryId),
          type: "expense",
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const categorySpent: number = agg[0]?.total ?? 0;
    const ratio = categorySpent / category.monthlyLimit;

    if (ratio >= 1) {
      await maybeNotify(
        userId,
        "budget_exceeded",
        `Limite dépassée : ${category.name}`,
        `Vous avez dépensé ${categorySpent.toFixed(2)} dans "${category.name}", au-delà de la limite de ${category.monthlyLimit.toFixed(2)}.`
      );
    } else if (ratio >= 0.8) {
      await maybeNotify(
        userId,
        "budget_warning",
        `Approche de limite : ${category.name}`,
        `Vous avez utilisé ${(ratio * 100).toFixed(0)}% de votre limite pour "${category.name}".`
      );
    }
  }
}

/**
 * Avoids spamming the user: only creates a notification if an identical
 * unread one was not already created in the last 6 hours.
 */
async function maybeNotify(userId: string, type: string, title: string, message: string) {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const recentDuplicate = await Notification.findOne({
    user: userId,
    title,
    createdAt: { $gte: sixHoursAgo },
  });
  if (recentDuplicate) return;

  await Notification.create({ user: userId, type, title, message });
}
