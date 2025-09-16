import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    shortCode: { type: String },
    installedHomebrew: { type: Object },
    currentAccessToken: { type: String, default: "" },
  }
);
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
    isRevoked: { type: Boolean, default: false },
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

export type RefreshToken = mongoose.InferSchemaType<typeof refreshTokenSchema>;
export const RefreshToken = mongoose.model<RefreshToken>("RefreshToken", refreshTokenSchema);

export type Character = mongoose.InferSchemaType<typeof characterSchema>;
export const Character = mongoose.model<Character>("Character", characterSchema);

const homebrewDisciplineSchema = new mongoose.Schema(
  {
    disciplineId: { type: Number, required: true },
    userId: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    name: { type: String, required: true },
    summary: { type: String, default: "" },
    levels: { type: Object, default: {} },
  }
);
const homebrewClanSchema = new mongoose.Schema(
  {
    clanId: { type: Number, required: true },
    userId: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    name: { type: String, required: true },
    slogan: { type: String, default: "" },
    description: { type: String, default: "" },
    curse: { type: String, default: "" },
    symbol: { type: String, default: "" },
    disciplines: { type: [Object], default: [] },
  }
);

export type HomebrewDiscipline = mongoose.InferSchemaType<typeof homebrewDisciplineSchema>;
export const HomebrewDiscipline = mongoose.model<HomebrewDiscipline>("HomebrewDiscipline", homebrewDisciplineSchema);

export type HomebrewClan = mongoose.InferSchemaType<typeof homebrewClanSchema>;
export const HomebrewClan = mongoose.model<HomebrewClan>("HomebrewClan", homebrewClanSchema);