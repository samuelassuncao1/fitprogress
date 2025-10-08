import { Dumbbell, Edit2, Play } from 'lucide-react';
import type { Workout } from '../lib/workouts';

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout: (workout: Workout) => void;
  onEditWorkout: (workout: Workout) => void;
}

export default function WorkoutList({
  workouts,
  onStartWorkout,
  onEditWorkout,
}: WorkoutListProps) {
  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-xl shadow-md p-6 border border-slate-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Treino {workout.workout_key}
                </h3>
                <p className="text-slate-600 text-sm">{workout.name}</p>
              </div>
            </div>
            <button
              onClick={() => onEditWorkout(workout)}
              className="text-slate-400 hover:text-blue-600 transition"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Exercícios:</p>
            <div className="space-y-1">
              {workout.exercises
                ?.sort((a, b) => a.order_index - b.order_index)
                .slice(0, 3)
                .map((exercise) => (
                  <p key={exercise.id} className="text-sm text-slate-700">
                    • {exercise.name}
                  </p>
                ))}
              {workout.exercises && workout.exercises.length > 3 && (
                <p className="text-sm text-slate-500">
                  +{workout.exercises.length - 3} exercícios
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onStartWorkout(workout)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Iniciar Treino
          </button>
        </div>
      ))}
    </div>
  );
}
