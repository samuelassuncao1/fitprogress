import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  exerciseName: string;
  defaultTime?: number;
}

export default function Timer({ exerciseName, defaultTime = 90 }: TimerProps) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const handleTimeChange = (newTime: number) => {
    setInitialTime(newTime);
    setTime(newTime);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <p className="text-sm font-medium text-slate-700 mb-3">{exerciseName}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="59"
            value={Math.floor(initialTime / 60)}
            onChange={(e) =>
              handleTimeChange(
                parseInt(e.target.value || '0') * 60 + (initialTime % 60)
              )
            }
            disabled={isRunning}
            className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm disabled:bg-slate-100"
          />
          <span className="text-slate-500">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={initialTime % 60}
            onChange={(e) =>
              handleTimeChange(
                Math.floor(initialTime / 60) * 60 + parseInt(e.target.value || '0')
              )
            }
            disabled={isRunning}
            className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm disabled:bg-slate-100"
          />
        </div>

        <div className="text-3xl font-bold text-slate-900 tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
            isRunning
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Iniciar
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
