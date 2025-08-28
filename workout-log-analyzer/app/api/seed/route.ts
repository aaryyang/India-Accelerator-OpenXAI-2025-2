import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/models/Workout';

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Workout.deleteMany({});

    // Sample workout data
    const sampleWorkouts = [
      {
        date: new Date('2024-08-25'),
        duration: 60,
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 8, weight: 80 },
          { name: 'Squat', sets: 3, reps: 10, weight: 100 },
          { name: 'Deadlift', sets: 3, reps: 6, weight: 120 }
        ],
        notes: 'Great strength session, felt strong on all lifts'
      },
      {
        date: new Date('2024-08-24'),
        duration: 45,
        exercises: [
          { name: 'Pull-ups', sets: 3, reps: 12, weight: 0 },
          { name: 'Push-ups', sets: 3, reps: 15, weight: 0 },
          { name: 'Plank', sets: 3, reps: 1, weight: 0 }
        ],
        notes: 'Bodyweight training day'
      },
      {
        date: new Date('2024-08-23'),
        duration: 30,
        exercises: [
          { name: 'Running', sets: 1, reps: 1, weight: 0 },
          { name: 'Burpees', sets: 3, reps: 10, weight: 0 }
        ],
        notes: '5km run followed by burpees'
      },
      {
        date: new Date('2024-08-22'),
        duration: 50,
        exercises: [
          { name: 'Overhead Press', sets: 3, reps: 8, weight: 50 },
          { name: 'Barbell Row', sets: 3, reps: 10, weight: 70 },
          { name: 'Dips', sets: 3, reps: 12, weight: 0 }
        ],
        notes: 'Upper body focus today'
      },
      {
        date: new Date('2024-08-21'),
        duration: 40,
        exercises: [
          { name: 'Lunges', sets: 3, reps: 12, weight: 20 },
          { name: 'Leg Press', sets: 3, reps: 15, weight: 150 },
          { name: 'Calf Raises', sets: 3, reps: 20, weight: 30 }
        ],
        notes: 'Leg day workout'
      }
    ];

    // Insert sample data
    const insertedWorkouts = await Workout.insertMany(sampleWorkouts);

    return NextResponse.json({
      message: 'Sample data created successfully',
      workouts: insertedWorkouts.length,
      data: insertedWorkouts
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data', details: (error as any).message },
      { status: 500 }
    );
  }
}
