const router = require("express").Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { projectSchema } = require("../validators/schemas");
const Project = require("../models/Project");
const Resource = require("../models/Resource");
const Record = require("../models/Record");

// GET /api/projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort("-createdAt")
      .lean();
    // Attach resource count to each project
    const withCounts = await Promise.all(
      projects.map(async (p) => ({
        ...p,
        resourceCount: await Resource.countDocuments({ project: p._id }),
      })),
    );
    res.json(withCounts);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/projects
router.post("/", auth, validate(projectSchema), async (req, res) => {
  try {
    if (req.user.plan === "free") {
      const count = await Project.countDocuments({ owner: req.user._id });
      if (count >= 3)
        return res
          .status(403)
          .json({ message: "Free plan limit: 3 projects. Upgrade to Pro." });
    }

    const project = await Project.create({
      owner: req.user._id,
      name: req.body.name,
      description: req.body.description || "",
    });

    res.status(201).json({ ...project.toObject(), resourceCount: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/projects/:slug
router.get("/:slug", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      owner: req.user._id,
    }).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const resources = await Resource.find({ project: project._id }).lean();
    res.json({ project, resources });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Cascade delete resources and records
    const resources = await Resource.find({ project: req.params.id }).select(
      "_id",
    );
    const resourceIds = resources.map((r) => r._id);
    await Record.deleteMany({ resource: { $in: resourceIds } });
    await Resource.deleteMany({ project: req.params.id });

    res.json({ message: "Project deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
