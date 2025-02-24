import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  qualifications: string[];
  gender: 'male' | 'female' | 'other';
  profileImage?: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-]{8,}$/, 'Please enter a valid phone number']
  },
  qualifications: [{
    type: String,
    required: true
  }],
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Gender must be either male, female, or other'
    }
  },
  profileImage: {
    type: Buffer,
    select: false
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ email: 1 });
studentSchema.index({ name: 'text' });

export default mongoose.model<IStudent>('Student', studentSchema); 