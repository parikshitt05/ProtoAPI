const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

// compound index for fast paginated list queries
recordSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model("Record", recordSchema);
