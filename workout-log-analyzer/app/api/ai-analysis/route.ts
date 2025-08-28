import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('AI Analysis API called');
    const { workouts, userProfile } = await request.json();

    console.log('Received workouts:', workouts?.length);

    if (!workouts || !Array.isArray(workouts)) {
      console.log('Invalid workout data');
      return NextResponse.json(
        { error: 'Valid workout data is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API is available
    console.log('Checking Gemini API availability');
    const isServiceAvailable = await geminiService.isServiceAvailable();
    console.log('Service available:', isServiceAvailable);
    
    if (!isServiceAvailable) {
      console.log('Gemini API not configured');
      return NextResponse.json(
        { 
          error: 'Gemini API not configured. Using intelligent fallback analysis.',
          suggestion: 'Configure GEMINI_API_KEY environment variable for enhanced AI insights'
        },
        { status: 503 }
      );
    }

    // Prepare workout summary for analysis
    const workoutSummary = {
      totalWorkouts: workouts.length,
      recentWorkouts: workouts.slice(-7), // Last 7 workouts
      exerciseTypes: workouts.reduce((acc: any, workout: any) => {
        workout.exercises.forEach((ex: any) => {
          acc[ex.name] = (acc[ex.name] || 0) + 1;
        });
        return acc;
      }, {}),
      averageDuration: workouts.reduce((sum: number, w: any) => sum + w.duration, 0) / workouts.length,
      totalExercises: workouts.reduce((sum: number, w: any) => sum + w.exercises.length, 0),
      averageExercisesPerWorkout: workouts.length > 0 ? 
        workouts.reduce((sum: number, w: any) => sum + w.exercises.length, 0) / workouts.length : 0,
      workoutFrequency: workouts.length,
      userProfile: userProfile || {
        name: 'User',
        fitnessLevel: 'intermediate',
        goals: ['general fitness', 'strength building']
      }
    };

    // Get AI analysis
    console.log('Calling Gemini service with summary:', JSON.stringify(workoutSummary, null, 2));
    const aiAnalysis = await geminiService.analyzeWorkoutData(workoutSummary);
    console.log('AI Analysis received:', aiAnalysis?.substring(0, 100) + '...');

    return NextResponse.json({
      analysis: aiAnalysis,
      summary: workoutSummary,
      timestamp: new Date().toISOString(),
      source: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Check if it's an Ollama connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Ollama. Please ensure Ollama is running.',
          suggestion: 'Start Ollama service and try again.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    );
  }
}
