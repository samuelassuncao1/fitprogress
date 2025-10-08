import { useState } from 'react';
import { Check, ArrowLeft, Save } from 'lucide-react';
import type { Workout, Exercise, ExerciseLog } from '../lib/workouts';
import Timer from './Timer';

interface WorkoutSessionProps {
  workout: Workout;
  onComplete: (logs: ExerciseLog[]) => void;
  onCancel: () => void;
}

interface SetData {
  weight: number;
  reps: number;
  completed: boolean;
}

export default function WorkoutSession({
  workout,
  onComplete,
  onCancel,
}: WorkoutSessionProps) {
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });

  const exercises = workout.exercises?.sort(
    (a, b) => a.order_index - b.order_index
  ) || [];

  const [exerciseData, setExerciseData] = useState<
    Record<string, SetData[]>
  >(() => {
    const initial: Record<string, SetData[]> = {};
    exercises.forEach((ex) => {
      initial[ex.id] = Array.from({ length: ex.default_sets }, () => ({
        weight: 0,
        reps: ex.default_reps,
        completed: false,
      }));
    });
    return initial;
  });

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: keyof SetData,
    value: number | boolean
  ) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, idx) =>
        idx === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  };

  const toggleCompleted = (exerciseId: string, setIndex: number) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, idx) =>
        idx === setIndex ? { ...set, completed: !set.completed } : set
      ),
    }));
  };

  const handleComplete = () => {
    const logs: Omit<ExerciseLog, 'session_id'>[] = [];

    exercises.forEach((exercise) => {
      const sets = exerciseData[exercise.id] || [];
      sets.forEach((set, index) => {
        logs.push({
          exercise_id: exercise.id,
          set_number: index + 1,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
          rest_time: 90,
        });
      });
    });

    onComplete(logs as ExerciseLog[]);
  };

  const formatDateForDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">
              Treino {workout.workout_key} - {workout.name}
            </h2>
            <p className="text-blue-100 text-sm">
              {formatDateForDisplay(workoutDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-100">Data:</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            className="px-3 py-1 rounded-lg text-slate-900 text-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {exercises.map((exercise, exIndex) => (
          <div key={exercise.id} className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {exIndex + 1}. {exercise.name}
            </h3>

            <div className="space-y-3 mb-4">
              {exerciseData[exercise.id]?.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${
                    set.completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => toggleCompleted(exercise.id, setIndex)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      set.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-300 hover:border-green-500'
                    }`}
                  >
                    {set.completed && <Check className="w-4 h-4 text-white" />}
                  </button>

                  <span className="font-medium text-slate-700 w-8">
                    {setIndex + 1}ª
                  </span>

                  <div className="flex gap-2 flex-1">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) =>
                          updateSet(
                            exercise.id,
                            setIndex,
                            'weight',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Peso"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center"
                      />
                      <span className="text-xs text-slate-500 text-center block mt-1">
                        kg
                      </span>
                    </div>

                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        onChange={(e) =>
                          updateSet(
                            exercise.id,
                            setIndex,
                            'reps',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Reps"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center"
                      />
                      <span className="text-xs text-slate-500 text-center block mt-1">
                        reps
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Timer exerciseName={`Descanso - ${exercise.name}`} />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" />
          Finalizar Treino
        </button>
      </div>
    </div>
  );
}
