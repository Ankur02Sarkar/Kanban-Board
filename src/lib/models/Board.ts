import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IBoard extends Document {
  title: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a board title'],
      trim: true,
      maxlength: [50, 'Board title cannot be more than 50 characters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Each user can only have one board
BoardSchema.index({ user: 1 }, { unique: true });

export default mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema); 