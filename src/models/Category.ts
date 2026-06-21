import mongoose, { Schema, models, model } from "mongoose";

export type CategoryType = "expense" | "income";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  monthlyLimit: number; // 0 = no limit, used for expense categories
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: { type: String, enum: ["expense", "income"], required: true },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "tag" },
    monthlyLimit: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export default models.Category || model<ICategory>("Category", CategorySchema);
