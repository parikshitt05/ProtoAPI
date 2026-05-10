const mongoose = require("mongoose");

// schemaDefinition stores field configs like:
// { name: "string", age: "number", avatar: "image_url", active: "boolean" }
const resourceSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: { type: String, required: true }, // e.g. "users"
    schemaDefinition: { type: Object, default: {} }, // field name → type
    totalRecords: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resource", resourceSchema);
