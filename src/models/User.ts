import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "admin" | "user";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  currency: string;
  monthlyIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    currency: { type: String, default: "XOF" },
    monthlyIncome: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
