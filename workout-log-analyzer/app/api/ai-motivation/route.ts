import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '../../../lib/ollama';

export async function POST(request: NextRequest) {
  try {
    const { recentWorkouts, userName } = await request.json();

    if (!recentWorkouts || !Array.isArray(recentWorkouts)) {
      return NextResponse.json(
        { error: 'Recent workout data is required' },
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

    // Add user context to recent workouts
    const workoutContext = {
      userName: userName || 'User',
      recentWorkouts: recentWorkouts.slice(-5), // Last 5 workouts
      totalWorkouts: recentWorkouts.length,
      weeklyFrequency: recentWorkouts.filter((w: any) => {
        const workoutDate = new Date(w.date);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= oneWeekAgo;
      }).length
    };

    // Generate motivational message
    const motivationalMessage = await ollamaService.generateMotivationalMessage(workoutContext.recentWorkouts);

    return NextResponse.json({
      message: motivationalMessage,
      context: workoutContext,
      timestamp: new Date().toISOString(),
      source: 'llama3:latest'
    });

  } catch (error) {
    console.error('AI Motivation error:', error);
    
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
      { error: 'Failed to generate motivational message' },
      { status: 500 }
    );
  }
}
