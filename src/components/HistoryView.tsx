import { useState, useEffect } from 'react';
import { Calendar, Dumbbell } from 'lucide-react';
import { getWorkoutHistory } from '../lib/workouts';

interface HistoryViewProps {
  userId: string;
}

interface HistoryItem {
  id: string;
  workout_date: string;
  workouts: {
    name: string;
    workout_key: string;
  };
}

export default function HistoryView({ userId }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutHistory(userId);
      setHistory(data as HistoryItem[]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const groupByMonth = (items: HistoryItem[]) => {
    const groups: Record<string, HistoryItem[]> = {};

    items.forEach((item) => {
      const date = new Date(item.workout_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
    });

    return groups;
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-slate-600">Carregando histórico...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">Nenhum treino registrado ainda</p>
        <p className="text-sm text-slate-500 mt-2">
          Complete seu primeiro treino para ver o histórico
        </p>
      </div>
    );
  }

  const grouped = groupByMonth(history);
  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6">
      {sortedMonths.map((monthKey) => (
        <div key={monthKey}>
          <h3 className="text-lg font-bold text-slate-900 mb-3 px-2">
            {formatMonthYear(monthKey)}
          </h3>
          <div className="space-y-3">
            {grouped[monthKey].map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-4 border border-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Dumbbell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">
                      Treino {item.workouts.workout_key} - {item.workouts.name}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(item.workout_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
