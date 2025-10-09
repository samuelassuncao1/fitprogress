import { Edit2, Play } from 'lucide-react';
import type { Workout } from '../lib/workouts';
import { getExerciseImage } from '../utils/exerciseImages';

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
      {workouts.map((workout) => {
        const firstExercise = workout.exercises?.sort(
          (a, b) => a.order_index - b.order_index
        )[0];

        return (
          <div
            key={workout.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
          >
            <div className="relative h-40">
              {firstExercise && (
                <>
                  <img
                    src={getExerciseImage(firstExercise.name)}
                    alt={workout.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </>
              )}
              <button
                onClick={() => onEditWorkout(workout)}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 p-2 rounded-lg hover:bg-white transition shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">
                  Treino {workout.workout_key}
                </h3>
                <p className="text-white/90 text-sm">{workout.name}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {workout.exercises?.length || 0} exercícios
                </p>
                <div className="space-y-1">
                  {workout.exercises
                    ?.sort((a, b) => a.order_index - b.order_index)
                    .slice(0, 3)
                    .map((exercise) => (
                      <p key={exercise.id} className="text-sm text-slate-600">
                        • {exercise.name}
                      </p>
                    ))}
                  {workout.exercises && workout.exercises.length > 3 && (
                    <p className="text-sm text-slate-500 font-medium">
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
          </div>
        );
      })}
    </div>
  );
}
