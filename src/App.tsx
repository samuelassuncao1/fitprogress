import { useState, useEffect } from 'react';
import { Dumbbell, BarChart3, History } from 'lucide-react';
import WorkoutList from './components/WorkoutList';
import WorkoutSession from './components/WorkoutSession';
import ProgressView from './components/ProgressView';
import HistoryView from './components/HistoryView';
import EditWorkoutModal from './components/EditWorkoutModal';
import {
  type Workout,
  type ExerciseLog,
} from './lib/workouts';

type Screen = 'workouts' | 'progress' | 'history';

const MOCK_USER_ID = 'local-user';

const DEFAULT_WORKOUTS_DATA = {
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

function App() {
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('workouts');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    initializeUserData();
  }, []);

  const initializeUserData = () => {
    const stored = localStorage.getItem('fitprogress_workouts');
    if (stored) {
      setWorkouts(JSON.parse(stored));
    } else {
      const initialWorkouts: Workout[] = Object.entries(DEFAULT_WORKOUTS_DATA).map(
        ([key, workout]) => ({
          id: `workout-${key}`,
          user_id: MOCK_USER_ID,
          workout_key: key as 'A' | 'B' | 'C',
          name: workout.name,
          exercises: workout.exercises.map((ex, idx) => ({
            id: `exercise-${key}-${idx}`,
            workout_id: `workout-${key}`,
            name: ex.name,
            order_index: ex.order,
            default_sets: 4,
            default_reps: 8,
          })),
        })
      );
      setWorkouts(initialWorkouts);
      localStorage.setItem('fitprogress_workouts', JSON.stringify(initialWorkouts));
    }
    setLoading(false);
  };

  const loadWorkouts = () => {
    const stored = localStorage.getItem('fitprogress_workouts');
    if (stored) {
      setWorkouts(JSON.parse(stored));
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = (logs: ExerciseLog[]) => {
    if (!activeWorkout) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = `session-${Date.now()}`;

      const history = JSON.parse(
        localStorage.getItem('fitprogress_history') || '[]'
      );

      const progressData = JSON.parse(
        localStorage.getItem('fitprogress_progress') || '{}'
      );

      history.push({
        id: sessionId,
        workout_id: activeWorkout.id,
        workout_date: today,
        completed: true,
        workouts: {
          name: activeWorkout.name,
          workout_key: activeWorkout.workout_key,
        },
      });

      logs.forEach((log) => {
        if (!progressData[log.exercise_id]) {
          progressData[log.exercise_id] = [];
        }
        progressData[log.exercise_id].push({
          ...log,
          session_id: sessionId,
          workout_date: today,
        });
      });

      localStorage.setItem('fitprogress_history', JSON.stringify(history));
      localStorage.setItem('fitprogress_progress', JSON.stringify(progressData));

      setActiveWorkout(null);
      alert('Treino finalizado com sucesso!');
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Erro ao finalizar treino');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (activeWorkout) {
    return (
      <WorkoutSession
        workout={activeWorkout}
        onComplete={handleCompleteWorkout}
        onCancel={() => setActiveWorkout(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8" />
            <h1 className="text-2xl font-bold">FitProgress</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {currentScreen === 'workouts' && (
          <WorkoutList
            workouts={workouts}
            onStartWorkout={handleStartWorkout}
            onEditWorkout={setEditingWorkout}
          />
        )}
        {currentScreen === 'progress' && (
          <ProgressView workouts={workouts} userId={MOCK_USER_ID} />
        )}
        {currentScreen === 'history' && <HistoryView userId={MOCK_USER_ID} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setCurrentScreen('workouts')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentScreen === 'workouts'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Dumbbell className="w-6 h-6" />
            <span className="text-xs font-medium">Treinos</span>
          </button>
          <button
            onClick={() => setCurrentScreen('progress')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentScreen === 'progress'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Progresso</span>
          </button>
          <button
            onClick={() => setCurrentScreen('history')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentScreen === 'history'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs font-medium">Histórico</span>
          </button>
        </div>
      </nav>

      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSave={() => {
            setEditingWorkout(null);
            loadWorkouts();
          }}
        />
      )}
    </div>
  );
}

export default App;
