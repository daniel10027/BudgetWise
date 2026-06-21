import mongoose, { Schema, models, model } from "mongoose";

export interface IBudget {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  totalLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    totalLimit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export default models.Budget || model<IBudget>("Budget", BudgetSchema);
