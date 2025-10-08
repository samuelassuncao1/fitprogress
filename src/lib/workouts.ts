import { supabase } from './supabase';

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  order_index: number;
  default_sets: number;
  default_reps: number;
}

export interface Workout {
  id: string;
  user_id: string;
  workout_key: 'A' | 'B' | 'C';
  name: string;
  exercises?: Exercise[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  workout_date: string;
  completed: boolean;
}

export interface ExerciseLog {
  id?: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
  rest_time: number;
}

const DEFAULT_WORKOUTS = {
  A: {
    name: 'Pernas e Ombros',
    exercises: [
      { name: 'Agachamento Livre', order: 0 },
      { name: 'Leg Press 45°', order: 1 },
      { name: 'Cadeira Extensora', order: 2 },
      { name: 'Cadeira Flexora', order: 3 },
      { name: 'Desenvolvimento com Halteres', order: 4 },
      { name: 'Elevação Lateral', order: 5 },
    ],
  },
  B: {
    name: 'Peito e Tríceps',
    exercises: [
      { name: 'Supino Reto', order: 0 },
      { name: 'Supino Inclinado', order: 1 },
      { name: 'Crucifixo Inclinado', order: 2 },
      { name: 'Tríceps Testa', order: 3 },
      { name: 'Tríceps Corda', order: 4 },
    ],
  },
  C: {
    name: 'Costas e Bíceps',
    exercises: [
      { name: 'Barra Fixa', order: 0 },
      { name: 'Remada Curvada', order: 1 },
      { name: 'Pulldown', order: 2 },
      { name: 'Rosca Direta', order: 3 },
      { name: 'Rosca Alternada', order: 4 },
    ],
  },
};

export async function initializeDefaultWorkouts(userId: string) {
  const { data: existingWorkouts } = await supabase
    .from('workouts')
    .select('workout_key')
    .eq('user_id', userId);

  if (existingWorkouts && existingWorkouts.length > 0) {
    return;
  }

  for (const [key, workout] of Object.entries(DEFAULT_WORKOUTS)) {
    const { data: newWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        workout_key: key as 'A' | 'B' | 'C',
        name: workout.name,
      })
      .select()
      .single();

    if (workoutError || !newWorkout) continue;

    const exercisesToInsert = workout.exercises.map((ex) => ({
      workout_id: newWorkout.id,
      name: ex.name,
      order_index: ex.order,
      default_sets: 4,
      default_reps: 8,
    }));

    await supabase.from('exercises').insert(exercisesToInsert);
  }
}

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (*)
    `)
    .eq('user_id', userId)
    .order('workout_key');

  if (error) throw error;
  return data || [];
}

export async function updateWorkout(
  workoutId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', workoutId);

  if (error) throw error;
}

export async function updateExercise(
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', exerciseId);

  if (error) throw error;
}

export async function addExercise(
  workoutId: string,
  name: string,
  orderIndex: number
): Promise<void> {
  const { error } = await supabase.from('exercises').insert({
    workout_id: workoutId,
    name,
    order_index: orderIndex,
    default_sets: 4,
    default_reps: 8,
  });

  if (error) throw error;
}

export async function deleteExercise(exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId);

  if (error) throw error;
}

export async function createWorkoutSession(
  userId: string,
  workoutId: string,
  workoutDate: string
): Promise<string> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      workout_id: workoutId,
      workout_date: workoutDate,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveExerciseLog(log: ExerciseLog): Promise<void> {
  const { error } = await supabase.from('exercise_logs').upsert(log);
  if (error) throw error;
}

export async function completeWorkoutSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ completed: true, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function getWorkoutHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workouts (
        name,
        workout_key
      )
    `)
    .eq('user_id', userId)
    .eq('completed', true)
    .order('workout_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select(`
      *,
      workout_sessions!inner (
        user_id,
        workout_date,
        completed
      )
    `)
    .eq('workout_sessions.user_id', userId)
    .eq('workout_sessions.completed', true)
    .eq('exercise_id', exerciseId)
    .order('workout_sessions.workout_date', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}
