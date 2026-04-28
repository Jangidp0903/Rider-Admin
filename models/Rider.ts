import mongoose, { Schema, Document } from "mongoose";

export interface IRider extends Document {
  feId: string;
  fullName: string;
  phone: string;
  token: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema: Schema = new Schema(
  {
    feId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["checked-in", "checked-out"],
      default: "checked-in",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Rider ||
  mongoose.model<IRider>("Rider", RiderSchema);
