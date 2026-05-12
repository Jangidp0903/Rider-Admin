import mongoose, { Schema, Document } from "mongoose";

export interface ISubAdmin extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  hubName: string;
  password?: string;
  role: string;
  status: "active" | "inactive";
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubAdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    hubName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "subadmin" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.SubAdmin ||
  mongoose.model<ISubAdmin>("SubAdmin", SubAdminSchema);
