import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PomodoroSettings {
  workDuration: number;  // 工作时长(分钟)
  breakDuration: number; // 休息时长(分钟)
  volume: number;        // 音量(0-1)
  isMuted: boolean;      // 是否静音
}

interface TimerState {
  mode: 'work' | 'break';
  endTime: number | null;   // 结束时间戳
  isRunning: boolean;
}

interface PomodoroTimerProps {
  onTimerComplete?: () => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  volume: 0.5,
  isMuted: false
};

const STORAGE_KEYS = {
  SETTINGS: 'pomodoro-settings',
  STATE: 'pomodoro-state'
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onTimerComplete }) => {
  // 从localStorage加载设置
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // 从localStorage加载状态
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATE);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 检查是否过期
      if (parsed.endTime && parsed.endTime > Date.now()) {
        return parsed;
      }
    }
    return { mode: 'work', endTime: null, isRunning: false };
  });

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  // 音频相关
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // 持久化设置
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // 持久化状态
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(timerState));
  }, [timerState]);

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2462/2462.wav');
    audioRef.current.volume = settings.volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 更新音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.isMuted ? 0 : settings.volume;
    }
  }, [settings.volume, settings.isMuted]);

  // 计时器逻辑
  useEffect(() => {
    if (timerState.isRunning && timerState.endTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, timerState.endTime! - now);

        if (remaining <= 0) {
          handleTimerComplete();
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timerState]);

  const handleTimerComplete = () => {
    if (audioRef.current && !settings.isMuted) {
      audioRef.current.play();
    }

    const nextMode = timerState.mode === 'work' ? 'break' : 'work';
    setTimerState({
      mode: nextMode,
      endTime: null,
      isRunning: false
    });

    if (onTimerComplete) {
      onTimerComplete();
    }
  };

  const toggleTimer = () => {
    if (!timerState.isRunning) {
      // 开始计时
      const duration = timerState.mode === 'work' ?
        settings.workDuration * 60 * 1000 :
        settings.breakDuration * 60 * 1000;

      setTimerState({
        ...timerState,
        endTime: Date.now() + duration,
        isRunning: true
      });
    } else {
      // 暂停计时
      setTimerState({
        ...timerState,
        endTime: null,
        isRunning: false
      });
    }
  };

  const resetTimer = () => {
    setTimerState({
      mode: timerState.mode,
      endTime: null,
      isRunning: false
    });
    setTimeLeft(timerState.mode === 'work' ?
      settings.workDuration * 60 :
      settings.breakDuration * 60
    );
  };

  const toggleMode = (newMode: string) => {
    setTimerState({
      mode: newMode as 'work' | 'break',
      endTime: null,
      isRunning: false
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!timerState.endTime) return 0;
    const total = timerState.mode === 'work' ?
      settings.workDuration * 60 :
      settings.breakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* 顶部工具栏 */}
          <div className="w-full flex justify-between items-center">
            <Select value={timerState.mode} onValueChange={toggleMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Clock className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Duration (minutes)</label>
                    <Slider
                      value={[settings.workDuration]}
                      min={1}
                      max={60}
                      step={1}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        workDuration: value[0]
                      })}
                    />
                    <span className="text-sm text-gray-500">{settings.workDuration} minutes</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Break Duration (minutes)</label>
                    <Slider
                      value={[settings.breakDuration]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        breakDuration: value[0]
                      })}
                    />
                    <span className="text-sm text-gray-500">{settings.breakDuration} minutes</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 时间显示 */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: `conic-gradient(
                  ${timerState.mode === 'work' ? 'bg-red-500' : 'bg-green-500'} ${getProgressPercentage()}%,
                  #e5e7eb ${getProgressPercentage()}%
                )`
              }}
            />
            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex space-x-2">
            <Button
              variant={timerState.isRunning ? "destructive" : "default"}
              size="icon"
              onClick={toggleTimer}
            >
              {timerState.isRunning ?
                <Pause className="h-4 w-4" /> :
                <Play className="h-4 w-4" />
              }
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center space-x-2 w-full max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettings({
                ...settings,
                isMuted: !settings.isMuted
              })}
              className="shrink-0"
            >
              {settings.isMuted ?
                <VolumeX className="h-4 w-4" /> :
                <Volume2 className="h-4 w-4" />
              }
            </Button>
            <Slider
              disabled={settings.isMuted}
              value={[settings.volume * 100]}
              min={0}
              max={100}
              step={1}
              className="w-full"
              onValueChange={(value) => setSettings({
                ...settings,
                volume: value[0] / 100
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;