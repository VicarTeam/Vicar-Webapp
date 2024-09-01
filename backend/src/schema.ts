import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    shortCode: { type: String },
  }
);

const characterSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    viewers: { type: [String], default: [] },
    data: { type: Object },
  },
);

export type User = mongoose.InferSchemaType<typeof userSchema>;
export const User = mongoose.model<User>("User", userSchema);

export type Character = mongoose.InferSchemaType<typeof characterSchema>;
export const Character = mongoose.model<Character>("Character", characterSchema);