const mongoose = require("mongoose");
const { nanoid } = require("nanoid"); // npm install nanoid@3

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    // auto-generated URL-safe slug, e.g. "abc123xyz"
    slug: { type: String, unique: true, default: () => nanoid(10) },
    description: { type: String, default: "" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
