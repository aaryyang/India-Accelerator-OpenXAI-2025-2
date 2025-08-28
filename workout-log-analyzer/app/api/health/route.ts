import { NextResponse } from 'next/server';
import { ollamaService } from '../../../lib/ollama';

export async function GET() {
  try {
    // Check if Ollama service is available
    const isModelAvailable = await ollamaService.isModelAvailable();
    
    const status = {
      timestamp: new Date().toISOString(),
      service: 'workout-log-analyzer',
      ollama: {
        connected: true,
        llama3Available: isModelAvailable,
        host: 'http://localhost:11434'
      },
      features: {
        aiAnalysis: isModelAvailable,
        workoutPlans: isModelAvailable,
        motivation: isModelAvailable
      }
    };

    if (!isModelAvailable) {
      status.ollama.connected = false;
      return NextResponse.json(status, { status: 503 });
    }

    return NextResponse.json(status);
    
  } catch (error) {
    const errorStatus = {
      timestamp: new Date().toISOString(),
      service: 'workout-log-analyzer',
      ollama: {
        connected: false,
        llama3Available: false,
        host: 'http://localhost:11434',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      features: {
        aiAnalysis: false,
        workoutPlans: false,
        motivation: false
      }
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}
