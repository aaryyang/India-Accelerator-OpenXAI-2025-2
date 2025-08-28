import { NextResponse } from 'next/server';

interface Workout {
  id: string;
  date: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
}

interface Recommendation {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement';
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'cardio' | 'strength' | 'recovery' | 'general';
}

// Rule-based fitness recommendations engine
function analyzeWorkouts(workouts: Workout[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Filter recent workouts
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  const lastTwoWeeksWorkouts = workouts.filter(w => new Date(w.date) >= twoWeeksAgo);
  
  // Rule 1: Cardio frequency check
  const recentCardio = recentWorkouts.filter(w => w.type === 'cardio');
  if (recentCardio.length === 0) {
    recommendations.push({
      id: '1',
      type: 'warning',
      message: 'You haven\'t done cardio in over a week. Consider adding a cardio session to maintain cardiovascular health.',
      priority: 'high',
      category: 'cardio',
    });
  } else if (recentCardio.length < 2) {
    recommendations.push({
      id: '2',
      type: 'suggestion',
      message: 'Try to include 2-3 cardio sessions per week for optimal cardiovascular benefits.',
      priority: 'medium',
      category: 'cardio',
    });
  }
  
  // Rule 2: Strength training consistency
  const recentStrength = recentWorkouts.filter(w => w.type === 'strength');
  if (recentStrength.length >= 3) {
    recommendations.push({
      id: '3',
      type: 'achievement',
      message: 'Excellent strength training consistency! You\'re on track for great muscle development.',
      priority: 'low',
      category: 'strength',
    });
  } else if (recentStrength.length === 0) {
    recommendations.push({
      id: '4',
      type: 'warning',
      message: 'No strength training this week. Include 2-3 strength sessions weekly to maintain muscle mass.',
      priority: 'high',
      category: 'strength',
    });
  }
  
  // Rule 3: Workout intensity balance
  const highIntensityWorkouts = recentWorkouts.filter(w => w.intensity === 'high');
  if (highIntensityWorkouts.length >= 5) {
    recommendations.push({
      id: '5',
      type: 'warning',
      message: 'You\'ve had many high-intensity workouts this week. Consider adding rest days or low-intensity sessions to prevent overtraining.',
      priority: 'high',
      category: 'recovery',
    });
  }
  
  // Rule 4: Workout frequency
  if (recentWorkouts.length >= 6) {
    recommendations.push({
      id: '6',
      type: 'achievement',
      message: 'Outstanding workout frequency! You\'re maintaining an excellent fitness routine.',
      priority: 'low',
      category: 'general',
    });
  } else if (recentWorkouts.length <= 2) {
    recommendations.push({
      id: '7',
      type: 'suggestion',
      message: 'Try to aim for 3-5 workouts per week for optimal fitness benefits.',
      priority: 'medium',
      category: 'general',
    });
  }
  
  // Rule 5: Flexibility and recovery
  const recentFlexibility = recentWorkouts.filter(w => w.type === 'flexibility');
  if (recentFlexibility.length === 0 && recentWorkouts.length > 0) {
    recommendations.push({
      id: '8',
      type: 'suggestion',
      message: 'Consider adding flexibility or yoga sessions to improve recovery and prevent injury.',
      priority: 'medium',
      category: 'recovery',
    });
  }
  
  // Rule 6: Workout duration analysis
  const avgDuration = recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length;
  if (avgDuration > 90) {
    recommendations.push({
      id: '9',
      type: 'suggestion',
      message: 'Your workouts are quite long. Consider shorter, more focused sessions to prevent fatigue.',
      priority: 'medium',
      category: 'general',
    });
  } else if (avgDuration < 20 && recentWorkouts.length > 0) {
    recommendations.push({
      id: '10',
      type: 'suggestion',
      message: 'Your average workout duration is quite short. Consider extending sessions for better results.',
      priority: 'medium',
      category: 'general',
    });
  }
  
  // Rule 7: Progress tracking
  if (lastTwoWeeksWorkouts.length >= 8) {
    const firstWeekWorkouts = lastTwoWeeksWorkouts.filter(w => 
      new Date(w.date) >= twoWeeksAgo && new Date(w.date) < oneWeekAgo
    );
    
    if (recentWorkouts.length > firstWeekWorkouts.length) {
      recommendations.push({
        id: '11',
        type: 'achievement',
        message: 'Great progress! You\'ve increased your workout frequency compared to last week.',
        priority: 'low',
        category: 'general',
      });
    }
  }
  
  return recommendations;
}

export async function POST(request: Request) {
  try {
    const { workouts } = await request.json();
    
    if (!Array.isArray(workouts)) {
      return NextResponse.json(
        { error: 'Workouts data must be an array' },
        { status: 400 }
      );
    }
    
    const recommendations = analyzeWorkouts(workouts);
    
    return NextResponse.json({
      recommendations,
      analysis: {
        totalWorkouts: workouts.length,
        recentWorkouts: workouts.filter(w => 
          new Date(w.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        analyzedAt: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze workouts' },
      { status: 500 }
    );
  }
}
