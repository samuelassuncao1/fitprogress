import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Dumbbell, BarChart3, History, LogOut, User } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import WorkoutList from './components/WorkoutList';
import WorkoutSession from './components/WorkoutSession';
import ProgressView from './components/ProgressView';
import HistoryView from './components/HistoryView';
import EditWorkoutModal from './components/EditWorkoutModal';
import {
  getWorkouts,
  createWorkoutSession,
  saveExerciseLog,
  completeWorkoutSession,
  initializeDefaultWorkouts,
  type Workout,
  type ExerciseLog,
} from './lib/workouts';

type Screen = 'workouts' | 'progress' | 'history';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('workouts');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      initializeUserData();
    }
  }, [user]);

  const initializeUserData = async () => {
    try {
      await initializeDefaultWorkouts(user.id);
      await loadWorkouts();
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  const loadWorkouts = async () => {
    try {
      const data = await getWorkouts(user.id);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = async (logs: ExerciseLog[]) => {
    if (!activeWorkout) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = await createWorkoutSession(
        user.id,
        activeWorkout.id,
        today
      );

      for (const log of logs) {
        await saveExerciseLog({ ...log, session_id: sessionId });
      }

      await completeWorkoutSession(sessionId);

      setActiveWorkout(null);
      alert('Treino finalizado com sucesso!');
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Erro ao finalizar treino');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  if (!user) {
    return <AuthScreen />;
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
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8" />
            <h1 className="text-2xl font-bold">FitProgress</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-700 rounded-full p-2">
              <User className="w-5 h-5" />
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-blue-700 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
          <ProgressView workouts={workouts} userId={user.id} />
        )}
        {currentScreen === 'history' && <HistoryView userId={user.id} />}
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
