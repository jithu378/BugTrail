import mongoose from 'mongoose';
import { SEVERITIES, STATUSES } from '../utils/validation.js';

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Bug title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters.'],
      maxlength: [140, 'Title cannot exceed 140 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters.'],
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },
    project: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters.'],
      maxlength: [80, 'Project name cannot exceed 80 characters.'],
    },
    severity: {
      type: String,
      enum: { values: SEVERITIES, message: 'Invalid severity.' },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Invalid status.' },
      default: 'Open',
    },
    reproductionSteps: { type: String, trim: true, default: '', maxlength: 5000 },
    expectedResult: { type: String, trim: true, default: '', maxlength: 2000 },
    actualResult: { type: String, trim: true, default: '', maxlength: 2000 },
    debuggingNotes: { type: String, trim: true, default: '', maxlength: 5000 },
    solution: { type: String, trim: true, default: '', maxlength: 5000 },
    resolvedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

bugSchema.index({ createdBy: 1, createdAt: -1 });
bugSchema.index({ createdBy: 1, status: 1 });
bugSchema.index({ createdBy: 1, severity: 1 });
bugSchema.index({ createdBy: 1, project: 1 });

export const Bug = mongoose.model('Bug', bugSchema);
