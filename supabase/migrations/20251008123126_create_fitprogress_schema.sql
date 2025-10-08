/*
  # FitProgress Database Schema

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `workout_key` (text) - A, B, or C
      - `name` (text) - Nome do treino
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, references workouts)
      - `name` (text) - Nome do exercício
      - `order_index` (integer) - Ordem no treino
      - `default_sets` (integer) - Número de séries padrão
      - `default_reps` (integer) - Repetições padrão
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `workout_id` (uuid, references workouts)
      - `workout_date` (date) - Data do treino no formato brasileiro
      - `completed` (boolean) - Se o treino foi finalizado
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `exercise_logs`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references workout_sessions)
      - `exercise_id` (uuid, references exercises)
      - `set_number` (integer) - Número da série (1-4)
      - `weight` (decimal) - Carga em kg
      - `reps` (integer) - Repetições realizadas
      - `completed` (boolean) - Se a série foi completada
      - `rest_time` (integer) - Tempo de descanso em segundos
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own workouts, sessions, and logs

  3. Indexes
    - Index on user_id for faster queries
    - Index on workout_date for historical views
    - Index on session_id for exercise logs
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  workout_key text NOT NULL CHECK (workout_key IN ('A', 'B', 'C')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, workout_key)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  default_sets integer NOT NULL DEFAULT 4,
  default_reps integer NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  workout_id uuid REFERENCES workouts ON DELETE CASCADE NOT NULL,
  workout_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exercise_logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES workout_sessions ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises ON DELETE CASCADE NOT NULL,
  set_number integer NOT NULL CHECK (set_number > 0),
  weight decimal(6,2) DEFAULT 0,
  reps integer DEFAULT 0,
  completed boolean DEFAULT false,
  rest_time integer DEFAULT 90,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts table
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for exercises table
CREATE POLICY "Users can view exercises from own workouts"
  ON exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exercises to own workouts"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises from own workouts"
  ON exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from own workouts"
  ON exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- RLS Policies for workout_sessions table
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON workout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs table
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );