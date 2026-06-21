import mongoose, { Schema, models, model } from "mongoose";

export type NotificationType = "budget_warning" | "budget_exceeded" | "info" | "welcome";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["budget_warning", "budget_exceeded", "info", "welcome"],
      default: "info",
    },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 300 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default models.Notification || model<INotification>("Notification", NotificationSchema);
