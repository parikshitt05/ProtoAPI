const router = require("express").Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { resourceSchema } = require("../validators/schemas");
const Project = require("../models/Project");
const Resource = require("../models/Resource");
const Record = require("../models/Record");
const { generateMany } = require("../utils/mockGenerator");

// POST /api/resources
router.post("/", auth, validate(resourceSchema), async (req, res) => {
  try {
    const { projectId, name, schemaDefinition, seedCount } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Prevent duplicate resource names within the same project
    const exists = await Resource.findOne({ project: projectId, name });
    if (exists)
      return res
        .status(409)
        .json({ message: `Resource "${name}" already exists in this project` });

    const resource = await Resource.create({
      project: projectId,
      name,
      schemaDefinition,
    });

    if (seedCount > 0) {
      const fakeData = generateMany(schemaDefinition, seedCount);
      await Record.insertMany(
        fakeData.map((data) => ({ resource: resource._id, data })),
      );
      await Resource.findByIdAndUpdate(resource._id, {
        totalRecords: seedCount,
      });
      resource.totalRecords = seedCount;
    }

    res.status(201).json(resource);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "Resource name must be unique per project" });
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/resources/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    await Record.deleteMany({ resource: req.params.id });
    res.json({ message: "Resource deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
