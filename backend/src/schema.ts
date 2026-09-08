import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    shortCode: { type: String },
    installedHomebrew: { type: Object },
    currentAccessToken: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    // Langlebiger Token für die FoundryVTT-Anbindung (VicarTT-Modul). Rotierbar.
    fvttToken: { type: String },
  }
);
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
    isRevoked: { type: Boolean, default: false },
    // Bei Rotation: Token, der diesen ersetzt hat (für das Grace-Window gegen Tab-Races).
    replacedByToken: { type: String },
    revokedAt: { type: Date },
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

const skillTreeSchema = new mongoose.Schema(
  {
    // Eindeutiger Freischalt-Code, mit dem Spieler den Tree einlösen.
    bonusCode: { type: String, required: true, unique: true },
    // Ersteller des Trees.
    userId: { type: String, required: true },
    // Voller ISkillTree-Blob (schemalos wie Character.data).
    data: { type: Object },
  }
);

export type SkillTree = mongoose.InferSchemaType<typeof skillTreeSchema>;
export const SkillTree = mongoose.model<SkillTree>("SkillTree", skillTreeSchema);

const folderSchema = new mongoose.Schema(
  {
    // Besitzer des Ordners.
    userId: { type: String, required: true },
    name: { type: String, default: "" },
    // Übergeordneter Ordner ("" = Wurzel) für die Verschachtelung.
    parentId: { type: String, default: "" },
    // Geschwister-Reihenfolge (freie Sortierung, fraktional vergeben).
    position: { type: Number, default: 0 },
    // Geordnete IDs der enthaltenen Charaktere. Der Ordner besitzt die
    // Zuordnung, der Charakter-Blob wird davon nicht berührt.
    characters: { type: [String], default: [] },
  }
);

export type Folder = mongoose.InferSchemaType<typeof folderSchema>;
export const Folder = mongoose.model<Folder>("Folder", folderSchema);