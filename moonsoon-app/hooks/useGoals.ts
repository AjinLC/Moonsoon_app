import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/context/AuthContext';

export type GoalScope = 'week' | 'month' | 'year';

export interface GoalRow {
  id: string;
  title: string;
  scope: GoalScope;
  progress: number;
  target: number;
}

export function useGoals() {
  const { user } = useSession();
  const [goals, setGoals] = useState<GoalRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setGoals([]);
      return;
    }
    const { data } = await supabase
      .from('goals')
      .select('id, title, scope, progress, target')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setGoals(data as GoalRow[]);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addGoal = useCallback(
    async (title: string, scope: GoalScope, target: number) => {
      if (!user || !title.trim()) return;
      const { data } = await supabase
        .from('goals')
        .insert({ user_id: user.id, title: title.trim(), scope, target: Math.max(1, target) })
        .select('id, title, scope, progress, target')
        .single();
      if (data) setGoals((prev) => [...prev, data as GoalRow]);
    },
    [user?.id]
  );

  const incrementProgress = useCallback(
    async (id: string) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal || goal.progress >= goal.target) return;
      const next = goal.progress + 1;
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress: next } : g)));
      const { error } = await supabase.from('goals').update({ progress: next }).eq('id', id);
      if (error) {
        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress: goal.progress } : g)));
      }
    },
    [goals]
  );

  const deleteGoal = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await supabase.from('goals').delete().eq('id', id);
  }, []);

  return { goals, refresh, addGoal, incrementProgress, deleteGoal };
}
