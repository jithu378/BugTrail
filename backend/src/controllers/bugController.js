import mongoose from 'mongoose';
import { Bug } from '../models/Bug.js';
import { SEVERITIES, STATUSES, validateBug } from '../utils/validation.js';

const LIST_FIELDS = 'title description project severity status createdAt updatedAt resolvedAt';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseLimit(value) {
  const limit = Number.parseInt(value, 10);
  if (!Number.isFinite(limit) || limit < 1) return 12;
  return Math.min(limit, 50);
}

export async function listBugs(req, res) {
  const { search = '', severity = '', status = '', project = '', sort = 'newest' } = req.query;
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);

  const filter = { createdBy: req.user._id };

  const searchTerm = String(search).trim().slice(0, 120);
  if (searchTerm) {
    filter.title = { $regex: escapeRegex(searchTerm), $options: 'i' };
  }

  if (SEVERITIES.includes(severity)) filter.severity = severity;
  if (STATUSES.includes(status)) filter.status = status;

  const projectName = String(project).trim().slice(0, 80);
  if (projectName) {
    filter.project = {
      $regex: `^${escapeRegex(projectName)}$`,
      $options: 'i',
    };
  }

  const [bugs, total] = await Promise.all([
    Bug.find(filter)
      .select(LIST_FIELDS)
      .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Bug.countDocuments(filter),
  ]);

  res.json({
    bugs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export async function getStats(req, res) {
  const owner = { createdBy: req.user._id };

  const [total, open, inProgress, resolved, severityRows, projectRows, recent] = await Promise.all([
    Bug.countDocuments(owner),
    Bug.countDocuments({ ...owner, status: 'Open' }),
    Bug.countDocuments({ ...owner, status: 'In Progress' }),
    Bug.countDocuments({ ...owner, status: 'Resolved' }),
    Bug.aggregate([{ $match: owner }, { $group: { _id: '$severity', count: { $sum: 1 } } }]),
    Bug.aggregate([
      { $match: owner },
      { $group: { _id: '$project', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 6 },
    ]),
    Bug.find(owner).select(LIST_FIELDS).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const bySeverity = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]));
  for (const row of severityRows) {
    if (row._id in bySeverity) bySeverity[row._id] = row.count;
  }

  res.json({
    counts: { total, open, inProgress, resolved },
    bySeverity,
    projects: projectRows.map((row) => ({ name: row._id, count: row.count })),
    recent,
  });
}

export async function getProjects(req, res) {
  const projects = await Bug.distinct('project', { createdBy: req.user._id });
  projects.sort((a, b) => a.localeCompare(b));
  res.json({ projects });
}

export async function createBug(req, res) {
  const { errors, values } = validateBug(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Please fix the highlighted fields.', errors });
  }

  const bug = await Bug.create({
    ...values,
    createdBy: req.user._id,
    resolvedAt: values.status === 'Resolved' ? new Date() : null,
  });

  return res.status(201).json({ bug });
}

export async function getBug(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  const bug = await Bug.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  }).lean();

  if (!bug) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  return res.json({ bug });
}

export async function updateBug(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  const bug = await Bug.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!bug) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  const { errors, values } = validateBug(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Please fix the highlighted fields.', errors });
  }

  Object.assign(bug, values);
  bug.resolvedAt = bug.status === 'Resolved' ? (bug.resolvedAt ?? new Date()) : null;

  await bug.save();

  return res.json({ bug });
}

export async function deleteBug(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  const deleted = await Bug.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!deleted) {
    return res.status(404).json({ message: 'Bug not found.' });
  }

  return res.json({ message: 'Bug deleted.' });
}
