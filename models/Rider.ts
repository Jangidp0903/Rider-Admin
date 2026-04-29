import mongoose, { Schema, Document } from "mongoose";

export interface IRider extends Document {
  feId: string;
  fullName: string;
  phone: string;
  token: number;
  checkedOutAt?: Date;
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
      type: Number,
      required: true,
    },
    checkedOutAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Rider ||
  mongoose.model<IRider>("Rider", RiderSchema);
