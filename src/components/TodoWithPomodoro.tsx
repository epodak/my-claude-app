import React, { useState } from 'react';
import EnhancedTodoList from './EnhancedTodoList';  // 改为默认导入
import PomodoroTimer from './PomodoroTimer';  // 改为默认导入
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Timer, List } from 'lucide-react';

const TodoWithPomodoro = () => {
  const [activeTab, setActiveTab] = useState<string>('todo');
  const [showMobileTimer, setShowMobileTimer] = useState(false);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* 桌面布局 */}
      <div className="hidden md:flex gap-4">
        <div className="flex-1">
          <EnhancedTodoList />
        </div>
        <div className="w-80">
          <PomodoroTimer />
        </div>
      </div>

      {/* 移动端布局 */}
      <div className="md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="todo" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Timer
              </TabsTrigger>
            </TabsList>

            {activeTab === 'todo' && (
              <Sheet open={showMobileTimer} onOpenChange={setShowMobileTimer}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Timer className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Pomodoro Timer</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <PomodoroTimer />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          <TabsContent value="todo" className="m-0">
            <EnhancedTodoList />
          </TabsContent>
          
          <TabsContent value="timer" className="m-0">
            <PomodoroTimer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TodoWithPomodoro;