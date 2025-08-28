import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '../../../lib/ollama';

export async function POST(request: NextRequest) {
  try {
    const { userProfile, goals, currentWorkouts } = await request.json();

    if (!userProfile || !goals) {
      return NextResponse.json(
        { error: 'User profile and goals are required' },
        { status: 400 }
      );
    }

    // Check if Ollama model is available
    const isModelAvailable = await ollamaService.isModelAvailable();
    if (!isModelAvailable) {
      return NextResponse.json(
        { 
          error: 'Llama3 model not available. Please ensure Ollama is running and the model is installed.',
          suggestion: 'Run: ollama pull llama3:latest'
        },
        { status: 503 }
      );
    }

    // Enhance user profile with current workout analysis
    const enhancedProfile = {
      ...userProfile,
      currentWorkoutAnalysis: currentWorkouts ? {
        totalWorkouts: currentWorkouts.length,
        averageWeeklyFrequency: currentWorkouts.length > 0 ? 
          currentWorkouts.filter((w: any) => {
            const workoutDate = new Date(w.date);
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return workoutDate >= oneWeekAgo;
          }).length : 0,
        commonWorkoutTypes: currentWorkouts?.reduce((acc: any, workout: any) => {
          acc[workout.type] = (acc[workout.type] || 0) + 1;
          return acc;
        }, {}),
        averageIntensity: currentWorkouts?.reduce((sum: number, w: any) => {
          const intensityScore = w.intensity === 'low' ? 1 : w.intensity === 'moderate' ? 2 : 3;
          return sum + intensityScore;
        }, 0) / currentWorkouts.length
      } : null
    };

    // Generate AI workout plan
    const workoutPlan = await ollamaService.generateWorkoutPlan(enhancedProfile, goals);

    return NextResponse.json({
      workoutPlan,
      userProfile: enhancedProfile,
      goals,
      timestamp: new Date().toISOString(),
      source: 'llama3:latest'
    });

  } catch (error) {
    console.error('AI Workout Plan error:', error);
    
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
      { error: 'Failed to generate AI workout plan' },
      { status: 500 }
    );
  }
}
