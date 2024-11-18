import React, { useState, useEffect } from 'react';
import { Trash2, Check, Plus, X, RefreshCw, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

const LOCAL_STORAGE_KEY = 'enhanced-todos';

const EnhancedTodoList = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved todos:', err);
        return [];
      }
    }
    return [];
  });
  
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<Todo['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
          priority: newPriority
        }
      ]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearAllTodos = () => {
    setTodos([]);
    setShowDeleteDialog(false);
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAndSearchedTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => 
      todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Task Manager</CardTitle>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Tasks</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete all tasks? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={clearAllTodos}>
                  Delete All
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={addTodo} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Todo['priority'])}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button type="submit" className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredAndSearchedTodos.map(todo => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-3 border rounded-lg transition-all duration-200 ${
                todo.completed ? 'bg-gray-50' : 'bg-white'
              } hover:shadow-md`}
            >
              <Button
                size="sm"
                variant="ghost"
                className={`rounded-full w-6 h-6 p-0 ${
                  todo.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                }`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed ? <Check className="w-4 h-4" /> : null}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`block truncate ${
                      todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Badge variant="secondary" className={`${getPriorityColor(todo.priority)} text-xs`}>
                    {todo.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(todo.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {todos.length === 0 && (
          <Alert>
            <AlertDescription className="text-center">
              No tasks yet. Add some tasks to get started!
            </AlertDescription>
          </Alert>
        )}
        
        {todos.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
            <span>
              {todos.filter(t => t.completed).length} of {todos.length} tasks completed
            </span>
            {todos.some(todo => todo.completed) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={clearCompletedTodos}
              >
                Clear completed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTodoList;