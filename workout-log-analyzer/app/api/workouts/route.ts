import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/models/Workout';

export async function GET() {
  try {
    await dbConnect();
    
    const workouts = await Workout.find({})
      .sort({ date: -1 })
      .limit(100) // Limit to last 100 workouts
      .lean();

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.exercises || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      return NextResponse.json(
        { error: 'At least one exercise is required' },
        { status: 400 }
      );
    }
    
    if (!body.duration || body.duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    // Create new workout
    const workout = new Workout({
      date: body.date ? new Date(body.date) : new Date(),
      exercises: body.exercises,
      duration: body.duration,
      notes: body.notes || '',
      type: body.type || 'strength'
    });

    const savedWorkout = await workout.save();
    
    return NextResponse.json(savedWorkout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    const deletedWorkout = await Workout.findByIdAndDelete(id);
    
    if (!deletedWorkout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}
