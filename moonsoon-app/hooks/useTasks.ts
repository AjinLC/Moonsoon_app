import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/context/AuthContext';

export interface TaskRow {
  id: string;
  title: string;
  due_date: string; // YYYY-MM-DD
  due_time: string | null; // HH:MM:SS or null = "no set time"
  done: boolean;
}

// Fetches tasks in [fromISO, toISO] (inclusive) with optimistic add/toggle/delete.
export function useTasks(fromISO: string, toISO: string) {
  const { user } = useSession();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('tasks')
      .select('id, title, due_date, due_time, done')
      .eq('user_id', user.id)
      .gte('due_date', fromISO)
      .lte('due_date', toISO)
      .order('due_time', { ascending: true, nullsFirst: false });
    if (data) setTasks(data as TaskRow[]);
    setLoading(false);
  }, [user?.id, fromISO, toISO]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (title: string, dueDate: string, dueTime: string | null) => {
      if (!user || !title.trim()) return;
      const { data } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, title: title.trim(), due_date: dueDate, due_time: dueTime })
        .select('id, title, due_date, due_time, done')
        .single();
      if (data && dueDate >= fromISO && dueDate <= toISO) {
        setTasks((prev) => [...prev, data as TaskRow]);
      }
    },
    [user?.id, fromISO, toISO]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
      const { error } = await supabase.from('tasks').update({ done: !target.done }).eq('id', id);
      if (error) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: target.done } : t)));
      }
    },
    [tasks]
  );

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  }, []);

  return { tasks, loading, refresh, addTask, toggleTask, deleteTask };
}
