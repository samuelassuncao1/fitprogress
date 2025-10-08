import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Clock, Award } from 'lucide-react';
import type { Workout } from '../lib/workouts';

interface ProgressViewProps {
  workouts: Workout[];
  userId: string;
}

interface ExerciseProgressData {
  exercise_id: string;
  exerciseName: string;
  maxWeight: number;
  avgWeight: number;
  totalSets: number;
  lastWorkoutDate: string;
}

export default function ProgressView({ workouts, userId }: ProgressViewProps) {
  const [selectedTab, setSelectedTab] = useState<'charts' | 'stats'>('charts');
  const [progressData, setProgressData] = useState<ExerciseProgressData[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisMonthWorkouts: 0,
    avgRestTime: 90,
    completionRate: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [userId, workouts]);

  const loadProgressData = () => {
    try {
      setLoading(true);

      const history = JSON.parse(
        localStorage.getItem('fitprogress_history') || '[]'
      );

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthCount = history.filter(
        (session: any) => new Date(session.workout_date) >= thisMonth
      ).length;

      setStats({
        totalWorkouts: history.length,
        thisMonthWorkouts: thisMonthCount,
        avgRestTime: 90,
        completionRate: 100,
      });

      const allExercises: ExerciseProgressData[] = [];
      const progressData = JSON.parse(
        localStorage.getItem('fitprogress_progress') || '{}'
      );

      for (const workout of workouts) {
        if (!workout.exercises) continue;

        for (const exercise of workout.exercises) {
          const logs = progressData[exercise.id] || [];

          if (logs.length === 0) continue;

          const weights = logs.map((log: any) => log.weight);
          const maxWeight = Math.max(...weights);
          const avgWeight =
            weights.reduce((a: number, b: number) => a + b, 0) / weights.length;

          allExercises.push({
            exercise_id: exercise.id,
            exerciseName: exercise.name,
            maxWeight,
            avgWeight,
            totalSets: logs.length,
            lastWorkoutDate: logs[0]?.workout_date || '',
          });
        }
      }

      allExercises.sort((a, b) => b.maxWeight - a.maxWeight);
      setProgressData(allExercises);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-white rounded-xl shadow-md p-2">
        <button
          onClick={() => setSelectedTab('charts')}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            selectedTab === 'charts'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Progresso de Cargas
        </button>
        <button
          onClick={() => setSelectedTab('stats')}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            selectedTab === 'stats'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Estatísticas
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      ) : selectedTab === 'charts' ? (
        <div className="space-y-4">
          {progressData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                Complete alguns treinos para ver seu progresso
              </p>
            </div>
          ) : (
            progressData.map((data) => (
              <div
                key={data.exercise_id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {data.exerciseName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Último treino: {formatDate(data.lastWorkoutDate)}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {data.maxWeight}kg
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Carga Máxima</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {data.avgWeight.toFixed(1)}kg
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Média</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-700">
                      {data.totalSets}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Total Séries</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Frequência de Treinos
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalWorkouts}
                </p>
                <p className="text-sm text-slate-600 mt-1">Total de Treinos</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {stats.thisMonthWorkouts}
                </p>
                <p className="text-sm text-slate-600 mt-1">Este Mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tempo de Descanso
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-slate-700">
                {Math.floor(stats.avgRestTime / 60)}:
                {String(stats.avgRestTime % 60).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 mt-1">Tempo Médio</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Taxa de Conclusão
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {stats.completionRate}%
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Treinos Completos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
