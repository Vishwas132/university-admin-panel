import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  qualifications: string[];
  gender: 'male' | 'female' | 'other';
  password: string;
  profileImage?: Buffer;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): Promise<string>;
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profileImage: {
    type: Buffer,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
studentSchema.methods.generateResetToken = async function(): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await this.save();
  
  return resetToken;
};

// Index for faster queries
studentSchema.index({ email: 1 });
studentSchema.index({ name: 'text' });

export default mongoose.model<IStudent>('Student', studentSchema);
