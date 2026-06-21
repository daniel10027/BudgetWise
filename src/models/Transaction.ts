import mongoose, { Schema, models, model } from "mongoose";

export type TransactionType = "expense" | "income";

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  tags: string[];
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    date: { type: Date, required: true, default: Date.now, index: true },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, date: -1 });

export default models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
