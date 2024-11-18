import React, { useState, useEffect } from 'react';
import { Trash2, Check, Plus, X, RefreshCw } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'my-todos';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // 初始化时从localStorage加载数据
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
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 当todos改变时保存到localStorage
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
          createdAt: new Date().toISOString()
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
    if (window.confirm('Are you sure you want to clear all todos?')) {
      setTodos([]);
    }
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // 过滤todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Todo List</h1>
        <button
          onClick={clearAllTodos}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>
      
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <Plus size={20} />
          Add
        </button>
      </form>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Completed
        </button>
      </div>

      <div className="space-y-2">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center gap-2 p-3 border rounded-lg ${
              todo.completed ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`p-1 rounded-full ${
                todo.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              } hover:opacity-80`}
            >
              {todo.completed ? <Check size={20} /> : <X size={20} />}
            </button>
            
            <div className="flex-1">
              <span
                className={`block ${
                  todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                }`}
              >
                {todo.text}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(todo.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      {todos.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No todos yet. Add some tasks to get started!
        </p>
      )}
      
      {todos.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            {todos.filter(t => t.completed).length} of {todos.length} tasks completed
          </span>
          {todos.some(todo => todo.completed) && (
            <button
              onClick={clearCompletedTodos}
              className="text-red-500 hover:underline"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;