import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/require-auth";
import { categorySchema } from "@/lib/validation";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const filter: Record<string, unknown> = { user: auth.userId };
    if (type === "expense" || type === "income") {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    return apiSuccess(
      categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        monthlyLimit: c.monthlyLimit,
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
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten());
    }

    await connectToDatabase();

    const existing = await Category.findOne({
      user: auth.userId,
      name: parsed.data.name,
      type: parsed.data.type,
    });
    if (existing) {
      return apiError("A category with this name and type already exists", 409);
    }

    const category = await Category.create({
      ...parsed.data,
      user: auth.userId,
    });

    return apiSuccess(
      {
        id: category._id.toString(),
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        monthlyLimit: category.monthlyLimit,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
