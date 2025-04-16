import mongoose, { Schema, Document } from 'mongoose';
import { IColumn } from './Column';

export interface ITask extends Document {
  title: string;
  description?: string;
  column: IColumn['_id'];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Task title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    column: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Order tasks within a column
TaskSchema.index({ column: 1, order: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema); 