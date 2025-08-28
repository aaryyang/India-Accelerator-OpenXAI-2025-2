'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, Brain, Calendar, Timer, Flame, Target, AlertCircle, CheckCircle, Moon, Sun, Dumbbell, Heart, Zap, TreePine, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number; // For cardio and other non-strength exercises
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
}

interface Workout {
  _id?: string;
  date: Date | string;
  exercises: Exercise[];
  duration: number;
  notes?: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  createdAt?: Date;
  updatedAt?: Date;
}

export function WorkoutAnalyzer() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [newWorkout, setNewWorkout] = useState({
    date: '',
    duration: '',
    notes: '',
    type: 'strength' as 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other',
  });

  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    type: 'strength' as 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other',
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Workout type options with icons and descriptions
  const workoutTypes = [
    { value: 'strength', label: 'Strength Training', icon: Dumbbell, desc: 'Weight lifting, resistance exercises', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { value: 'cardio', label: 'Cardio', icon: Heart, desc: 'Running, cycling, swimming', color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
    { value: 'flexibility', label: 'Flexibility', icon: Zap, desc: 'Yoga, stretching, mobility', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { value: 'sports', label: 'Sports', icon: Target, desc: 'Basketball, soccer, tennis', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { value: 'other', label: 'Other', icon: TreePine, desc: 'Hiking, dancing, activities', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  // Exercise presets based on workout type
  const exercisePresets = {
    strength: ['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Overhead Press', 'Barbell Row', 'Bicep Curl', 'Tricep Extension'],
    cardio: ['Running', 'Cycling', 'Swimming', 'Elliptical', 'Rowing', 'Jump Rope', 'HIIT Circuit', 'Stair Climbing'],
    flexibility: ['Yoga Flow', 'Static Stretching', 'Dynamic Warm-up', 'Foam Rolling', 'Pilates', 'Meditation', 'Deep Stretching'],
    sports: ['Basketball', 'Soccer', 'Tennis', 'Volleyball', 'Badminton', 'Table Tennis', 'Golf', 'Rock Climbing'],
    other: ['Hiking', 'Dancing', 'Martial Arts', 'Skateboarding', 'Surfing', 'Walking', 'Gardening', 'House Cleaning']
  };

  // Load workouts from database
  useEffect(() => {
    setIsClient(true);
    setNewWorkout(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const deleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const response = await fetch(`/api/workouts?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setWorkouts(workouts.filter(w => w._id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete workout: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout. Please try again.');
    }
  };

  // Stats calculations
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
  
  // Weekly data for charts - ensure consistent formatting
  const weeklyData = isClient ? workouts.slice(-7).map(w => {
    const date = new Date(w.date);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      duration: w.duration,
      exercises: w.exercises.length,
    };
  }) : [];

  // Exercise distribution
  const exerciseData = workouts.reduce((acc: Record<string, number>, w) => {
    w.exercises.forEach(ex => {
      acc[ex.name] = (acc[ex.name] || 0) + 1;
    });
    return acc;
  }, {});
  
  const typeData = Object.entries(exerciseData).slice(0, 6).map(([name, count]) => ({ 
    type: name, 
    count 
  }));

  const addExercise = () => {
    if (!currentExercise.name.trim()) {
      alert('Please enter exercise name');
      return;
    }
    
    if (currentExercise.type === 'strength') {
      const sets = parseInt(currentExercise.sets);
      const reps = parseInt(currentExercise.reps);
      const weight = parseFloat(currentExercise.weight);
      
      if (currentExercise.sets === '' || isNaN(sets) || sets < 1) {
        alert('Please enter valid sets (1 or greater)');
        return;
      }
      if (currentExercise.reps === '' || isNaN(reps) || reps < 1) {
        alert('Please enter valid reps (1 or greater)');
        return;
      }
      if (currentExercise.weight === '' || isNaN(weight) || weight < 0) {
        alert('Please enter valid weight (0 or greater)');
        return;
      }

      const exercise: Exercise = {
        name: currentExercise.name.trim(),
        sets: sets,
        reps: reps,
        weight: weight,
        type: currentExercise.type,
      };

      setExercises([...exercises, exercise]);
    } else {
      // For cardio, flexibility, sports, and other exercises
      const duration = parseFloat(currentExercise.duration);
      
      if (currentExercise.duration === '' || isNaN(duration) || duration <= 0) {
        alert('Please enter valid duration (greater than 0)');
        return;
      }

      const exercise: Exercise = {
        name: currentExercise.name.trim(),
        sets: 1, // Default values for non-strength exercises
        reps: 1,
        weight: 0,
        duration: duration,
        type: currentExercise.type,
      };

      setExercises([...exercises, exercise]);
    }
    
    setCurrentExercise({ name: '', sets: '', reps: '', weight: '', duration: '', type: currentExercise.type });
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (!newWorkout.date) {
      alert('Please select a workout date');
      return;
    }
    
    if (!newWorkout.duration || parseInt(newWorkout.duration) <= 0) {
      alert('Please enter a valid workout duration');
      return;
    }
    
    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const workoutData = {
      date: newWorkout.date,
      duration: parseInt(newWorkout.duration),
      exercises: exercises,
      notes: newWorkout.notes.trim(),
      type: newWorkout.type,
    };

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      const savedWorkout = await response.json();
      
      if (!response.ok || savedWorkout.error) {
        throw new Error(savedWorkout.error || 'Failed to save workout');
      }
      
      setWorkouts([savedWorkout, ...workouts]);

      // Reset form
      setNewWorkout({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
        type: 'strength',
      });
      setExercises([]);
      setCurrentExercise({ name: '', sets: '', reps: '', weight: '', duration: '', type: 'strength' });
      setShowAddForm(false);
      
      console.log('Workout added successfully');
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error instanceof Error) {
        alert(`Failed to save workout: ${error.message}`);
      } else {
        alert('Failed to save workout. Please try again.');
      }
    }
  };

  const analyzeWorkouts = async () => {
    console.log('analyzeWorkouts function called');
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    // Get AI analysis directly
    try {
      const aiResponse = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workouts })
      });
      
      console.log('AI Response status:', aiResponse.status);
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        console.log('AI Data received:', aiData);
        if (aiData.analysis) {
          setAiAnalysis(aiData.analysis);
        } else {
          setAiAnalysis('❌ **Analysis Error:** Unable to generate AI insights. Please try again.');
        }
      } else {
        setAiAnalysis('❌ **Service Error:** AI analysis service temporarily unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiAnalysis('❌ **Connection Error:** Unable to connect to AI analysis service. Please check your connection and try again.');
    }
    
    setIsAnalyzing(false);
  };

  const getWorkoutIcon = (type: string) => {
    const workoutType = workoutTypes.find(wt => wt.value === type);
    return workoutType ? workoutType.icon : Activity;
  };

  const getWorkoutTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(wt => wt.value === type);
    return workoutType ? workoutType.color : 'text-gray-500';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <div className={`shadow-lg border-b transition-all duration-500 backdrop-blur-lg ${
        darkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  FitTracker Pro
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  AI-Powered Workout Analytics
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Add Workout Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Log Workout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 transform hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Workouts
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalWorkouts}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 transform hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Hours
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {Math.round(totalDuration / 60)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <Timer className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 transform hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg Duration
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {avgDuration}m
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 transform hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Exercises
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalExercises}
                </p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 mb-8 ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
            : 'bg-white/80 border-gray-200 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-violet-600 p-3 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  AI Workout Analysis
                </h2>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get personalized insights from your fitness data
                </p>
              </div>
            </div>
            <button
              onClick={analyzeWorkouts}
              disabled={isAnalyzing || workouts.length === 0}
              className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Analyze Workouts</span>
                </>
              )}
            </button>
          </div>
          
          {isAnalyzing && (
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700/50 border border-gray-600' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <div className="text-center">
                  <p className={`mt-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Analyzing your workout patterns, frequency, variety, and progression to provide personalized recommendations...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isAnalyzing && aiAnalysis && (
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700/50 border border-gray-600' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div 
                className={`leading-relaxed transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} 
                dangerouslySetInnerHTML={{
                  __html: aiAnalysis
                    // Handle bold text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    // Handle bullet points with various symbols
                    .replace(/(?:^|\n)[•\-*]\s+/g, '<br/>• ')
                    // Handle paragraph breaks
                    .replace(/\n\n+/g, '<br/><br/>')
                    // Handle remaining single line breaks
                    .replace(/\n/g, '<br/>')
                    // Clean up any leading breaks
                    .replace(/^(<br\/>)+/, '')
                }}
              />
            </div>
          )}
          
          {!isAnalyzing && !aiAnalysis && workouts.length === 0 && (
            <div className={`text-center py-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Brain className={`h-12 w-12 mx-auto mb-4 transition-colors duration-300 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p>Add some workouts to get AI-powered insights!</p>
            </div>
          )}
        </div>

        {/* Workout Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h2 className={`text-xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Log New Workout
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Workout Type Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Workout Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workoutTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            setNewWorkout({ ...newWorkout, type: type.value as any });
                            setCurrentExercise({ ...currentExercise, type: type.value as any });
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                            newWorkout.type === type.value
                              ? darkMode
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-blue-500 bg-blue-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                        >
                          <IconComponent className={`h-8 w-8 mx-auto mb-2 ${type.color}`} />
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {type.label}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {type.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Workout Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                      placeholder="e.g., 45"
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Exercise Input */}
                <div className={`p-6 rounded-xl border transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Add Exercises
                  </h3>
                  
                  {/* Exercise Name with Presets */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={currentExercise.name}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                      placeholder="Enter exercise name or click a preset below"
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    
                    {/* Exercise Presets */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {exercisePresets[newWorkout.type].slice(0, 6).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setCurrentExercise({ ...currentExercise, name: preset })}
                          className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                            darkMode 
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercise Details - Conditional based on type */}
                  {currentExercise.type === 'strength' ? (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={currentExercise.sets}
                          onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                          placeholder="3"
                          className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={currentExercise.reps}
                          onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                          placeholder="12"
                          className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Weight (lbs/kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={currentExercise.weight}
                          onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                          placeholder="25"
                          className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={currentExercise.duration}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, duration: e.target.value })}
                        placeholder={currentExercise.type === 'cardio' ? '30' : '15'}
                        className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  )}

                  <button
                    onClick={addExercise}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                {/* Exercise List */}
                {exercises.length > 0 && (
                  <div className={`p-6 rounded-xl border transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Exercises Added ({exercises.length})
                    </h3>
                    <div className="space-y-3">
                      {exercises.map((exercise, index) => {
                        const IconComponent = getWorkoutIcon(exercise.type);
                        return (
                          <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                            darkMode 
                              ? 'bg-gray-600/50 border-gray-500' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`h-5 w-5 ${getWorkoutTypeColor(exercise.type)}`} />
                              <div>
                                <p className={`font-medium transition-colors duration-300 ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {exercise.name}
                                </p>
                                <p className={`text-sm transition-colors duration-300 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {exercise.type === 'strength' 
                                    ? `${exercise.sets} sets × ${exercise.reps} reps @ ${exercise.weight} lbs`
                                    : `${exercise.duration} minutes`
                                  }
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeExercise(index)}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                darkMode 
                                  ? 'hover:bg-red-800 text-red-400 hover:text-red-300' 
                                  : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                              }`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    placeholder="How did the workout feel? Any observations?"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveWorkout}
                    disabled={exercises.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Save Workout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Recent Workouts */}
        {workouts.length > 0 && isClient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Progress Chart */}
            <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
                : 'bg-white/80 border-gray-200 backdrop-blur-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-6 flex items-center space-x-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <TrendingUp className="h-5 w-5" />
                <span>Weekly Progress</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(55, 65, 81, 0.95)',
                      border: `1px solid ${darkMode ? '#4b5563' : '#6b7280'}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#ffffff'
                    }}
                    labelStyle={{
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}
                    itemStyle={{
                      color: '#60a5fa'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Exercise Distribution */}
            <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
                : 'bg-white/80 border-gray-200 backdrop-blur-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-6 flex items-center space-x-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Target className="h-5 w-5" />
                <span>Exercise Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="type" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(55, 65, 81, 0.95)',
                      border: `1px solid ${darkMode ? '#4b5563' : '#6b7280'}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#ffffff'
                    }}
                    labelStyle={{
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}
                    itemStyle={{
                      color: '#60a5fa'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-6 mt-8 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-6 flex items-center space-x-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Activity className="h-5 w-5" />
              <span>Recent Workouts</span>
            </h3>
            <div className="space-y-4">
              {workouts.slice(0, 5).map((workout) => {
                const IconComponent = getWorkoutIcon(workout.type || 'other');
                return (
                  <div key={workout._id} className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          workoutTypes.find(wt => wt.value === workout.type)?.bgColor || 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${getWorkoutTypeColor(workout.type || 'other')}`} />
                        </div>
                        <div>
                          <p className={`font-semibold transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {new Date(workout.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {workout.exercises.length} exercises • {workout.duration} minutes
                          </p>
                          <p className={`text-sm mt-1 transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {workout.exercises.map(e => e.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteWorkout(workout._id!)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                          darkMode 
                            ? 'hover:bg-red-800 text-red-400 hover:text-red-300' 
                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {workouts.length === 0 && (
          <div className={`rounded-2xl shadow-lg border transition-all duration-300 p-12 text-center ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <Activity className={`h-16 w-16 mx-auto mb-6 transition-colors duration-300 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to Start Your Fitness Journey?
            </h3>
            <p className={`mb-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Log your first workout to get personalized AI insights and track your progress!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-6 w-6" />
              <span>Log Your First Workout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
