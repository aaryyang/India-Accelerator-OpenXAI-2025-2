import mongoose from 'mongoose';

export interface IWorkout extends mongoose.Document {
  date: Date;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
    duration?: number;
    type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  }>;
  duration: number;
  notes?: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
    default: 'strength'
  }
});

const WorkoutSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  exercises: {
    type: [ExerciseSchema],
    required: true,
    validate: {
      validator: function(exercises: any[]) {
        return exercises && exercises.length > 0;
      },
      message: 'At least one exercise is required'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
    default: 'strength'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
WorkoutSchema.index({ date: -1 });
WorkoutSchema.index({ createdAt: -1 });

export default mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);
