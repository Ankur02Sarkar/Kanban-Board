import mongoose, { Schema, Document } from 'mongoose';
import { IBoard } from './Board';

export interface IColumn extends Document {
  title: string;
  board: IBoard['_id'];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a column title'],
      trim: true,
      maxlength: [30, 'Column title cannot be more than 30 characters'],
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
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

// Order columns within a board
ColumnSchema.index({ board: 1, order: 1 });

export default mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema); 