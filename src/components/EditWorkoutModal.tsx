import { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import type { Workout, Exercise } from '../lib/workouts';
import {
  updateWorkout,
  updateExercise,
  addExercise,
  deleteExercise,
} from '../lib/workouts';

interface EditWorkoutModalProps {
  workout: Workout;
  onClose: () => void;
  onSave: () => void;
}

export default function EditWorkoutModal({
  workout,
  onClose,
  onSave,
}: EditWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [exercises, setExercises] = useState<Exercise[]>(
    workout.exercises?.sort((a, b) => a.order_index - b.order_index) || []
  );
  const [saving, setSaving] = useState(false);

  const handleUpdateExercise = (
    exerciseId: string,
    field: keyof Exercise,
    value: string | number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex))
    );
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: `temp-${Date.now()}`,
      workout_id: workout.id,
      name: 'Novo Exercício',
      order_index: exercises.length,
      default_sets: 4,
      default_reps: 8,
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateWorkout(workout.id, workoutName);

      for (const exercise of exercises) {
        if (exercise.id.startsWith('temp-')) {
          await addExercise(
            workout.id,
            exercise.name,
            exercise.order_index
          );
        } else {
          await updateExercise(exercise.id, {
            name: exercise.name,
            default_sets: exercise.default_sets,
            default_reps: exercise.default_reps,
            order_index: exercise.order_index,
          });
        }
      }

      const originalExerciseIds = new Set(
        workout.exercises?.map((ex) => ex.id) || []
      );
      const currentExerciseIds = new Set(
        exercises.filter((ex) => !ex.id.startsWith('temp-')).map((ex) => ex.id)
      );

      for (const originalId of originalExerciseIds) {
        if (!currentExerciseIds.has(originalId)) {
          await deleteExercise(originalId);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Editar Treino {workout.workout_key}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Treino
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Exercícios
              </label>
              <button
                onClick={handleAddExercise}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="pt-3">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          handleUpdateExercise(
                            exercise.id,
                            'name',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                        placeholder="Nome do exercício"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            value={exercise.default_sets}
                            onChange={(e) =>
                              handleUpdateExercise(
                                exercise.id,
                                'default_sets',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center"
                          />
                          <span className="text-xs text-slate-600 text-center block mt-1">
                            Séries
                          </span>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            value={exercise.default_reps}
                            onChange={(e) =>
                              handleUpdateExercise(
                                exercise.id,
                                'default_reps',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center"
                          />
                          <span className="text-xs text-slate-600 text-center block mt-1">
                            Repetições
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition mt-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
