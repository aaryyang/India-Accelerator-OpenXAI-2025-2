// Google Gemini API service - much faster and lighter than Ollama
export class GeminiService {
  private apiKey: string | undefined;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // You can get a free API key from https://makersuite.google.com/app/apikey
    this.apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  }

  async isServiceAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
      console.log('Gemini API key not configured, using fallback analysis');
      return false;
    }
    return true;
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!await this.isServiceAvailable()) {
      throw new Error('Gemini API not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Check if we have a valid response
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async analyzeWorkoutData(workoutData: any): Promise<string> {
    const prompt = `You are a personal fitness trainer analyzing MY workout data. Speak directly to me using "you" and "your". Be encouraging and personal.

MY WORKOUT DATA:
- Weekly frequency: ${workoutData.workoutFrequency} sessions
- Exercise types: ${Object.keys(workoutData.exerciseTypes).join(', ')}
- Average duration: ${workoutData.averageDuration} minutes
- Fitness level: ${workoutData.userProfile.fitnessLevel}
- Goals: ${workoutData.userProfile.goals.join(', ')}

Provide a personal analysis in 120-150 words using BULLET POINTS format covering:

• **Frequency & Schedule:** How's my current frequency? What should I adjust?

• **Exercise Balance:** What muscle groups am I hitting well? What am I missing?

• **Next Steps:** Give me 3 specific actions to improve my routine.

IMPORTANT: Format your response using bullet points (•) for each main point and sub-points. Be encouraging, use "you/your", include emojis, and keep it concise but actionable. Make it feel like advice from my personal trainer.`;

    return await this.generateResponse(prompt);
  }

  async generateWorkoutPlan(userProfile: any, goals: string[]): Promise<string> {
    const prompt = `Create a comprehensive, personalized weekly workout plan for:

**USER PROFILE:**
- Fitness Level: ${userProfile.fitnessLevel}
- Primary Goals: ${goals.join(', ')}
- Available time per session: 45-60 minutes

**PROVIDE DETAILED WEEKLY PLAN WITH:**

🗓️ **Weekly Schedule (7 days):**
- Specific workout for each day
- Rest/recovery days
- Workout duration and intensity

💪 **Exercise Details:**
- Specific exercises with sets/reps
- Progressive difficulty levels
- Equipment alternatives

🎯 **Goal-Specific Focus:**
- Exercises aligned with stated goals
- Progression timeline
- Success metrics to track

⚡ **Additional Guidance:**
- Warm-up and cool-down recommendations
- Nutrition timing tips
- Recovery strategies

**Format as a detailed, actionable 7-day plan with specific exercises, sets, reps, and progression notes. Include emojis and make it engaging!**`;

    return await this.generateResponse(prompt);
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
