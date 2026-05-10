const router = require("express").Router();
const mongoose = require("mongoose");
const { mockRateLimiter } = require("../middleware/rateLimiter");
const Project = require("../models/Project");
const Resource = require("../models/Resource");
const Record = require("../models/Record");
const { generateRecord } = require("../utils/mockGenerator");

router.use(mockRateLimiter);

// ------------------------------------------------------------------
// Helper: resolve resource from URL params
// ------------------------------------------------------------------
const resolveResource = async (slug, resourceName) => {
  const project = await Project.findOne({ slug }).lean();
  if (!project) return null;
  const resource = await Resource.findOne({
    project: project._id,
    name: resourceName,
  }).lean();
  return resource;
};

// ------------------------------------------------------------------
// Helper: format a record for API output
// Always exposes MongoDB _id as "id" at the top level.
// Any "id" or "uuid" field inside data is kept as-is under its own key.
// ------------------------------------------------------------------
const formatRecord = (record) => ({
  id: record._id.toString(), // always the real MongoDB _id
  ...record.data,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// ------------------------------------------------------------------
// Helper: find a record by MongoDB _id safely (avoids CastError)
// ------------------------------------------------------------------
const findRecordById = async (resourceId, id) => {
  // Only query if id looks like a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Record.findOne({ _id: id, resource: resourceId });
};

// ------------------------------------------------------------------
// GET /:slug/:resource  — list all records (pagination + field filter)
// ------------------------------------------------------------------
router.get("/:slug/:resource", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filter from query params — skip pagination keys
    const reserved = new Set(["page", "limit"]);
    const filter = { resource: resource._id };
    for (const [key, val] of Object.entries(req.query)) {
      if (!reserved.has(key)) filter[`data.${key}`] = val;
    }

    const [records, total] = await Promise.all([
      Record.find(filter).sort("-createdAt").skip(skip).limit(limit).lean(),
      Record.countDocuments(filter),
    ]);

    res.json({
      data: records.map(formatRecord),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------------
// GET /:slug/:resource/:id  — single record
// ------------------------------------------------------------------
router.get("/:slug/:resource/:id", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    const record = await findRecordById(resource._id, req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(formatRecord(record));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------------
// POST /:slug/:resource  — create record
// ------------------------------------------------------------------
router.post("/:slug/:resource", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    // Use provided body if non-empty, otherwise auto-generate from schema
    const data =
      req.body && Object.keys(req.body).length > 0
        ? req.body
        : generateRecord(resource.schemaDefinition);

    const record = await Record.create({ resource: resource._id, data });

    // Increment counter (non-blocking)
    Resource.findByIdAndUpdate(resource._id, {
      $inc: { totalRecords: 1 },
    }).exec();

    res.status(201).json(formatRecord(record));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------------
// PUT /:slug/:resource/:id  — replace record data
// ------------------------------------------------------------------
router.put("/:slug/:resource/:id", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, resource: resource._id },
      { $set: { data: req.body } },
      { new: true, runValidators: true },
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(formatRecord(record));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------------
// PATCH /:slug/:resource/:id  — partial update (merge into existing data)
// ------------------------------------------------------------------
router.patch("/:slug/:resource/:id", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    // Build a $set that merges at the data field level
    const setPayload = {};
    for (const [key, val] of Object.entries(req.body)) {
      setPayload[`data.${key}`] = val;
    }

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, resource: resource._id },
      { $set: setPayload },
      { new: true },
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(formatRecord(record));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------------
// DELETE /:slug/:resource/:id  — delete record
// ------------------------------------------------------------------
router.delete("/:slug/:resource/:id", async (req, res) => {
  try {
    const resource = await resolveResource(
      req.params.slug,
      req.params.resource,
    );
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    const record = await Record.findOneAndDelete({
      _id: req.params.id,
      resource: resource._id,
    });

    if (!record) return res.status(404).json({ message: "Record not found" });

    // Decrement counter (non-blocking)
    Resource.findByIdAndUpdate(resource._id, {
      $inc: { totalRecords: -1 },
    }).exec();

    res.json({ message: "Record deleted", id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
