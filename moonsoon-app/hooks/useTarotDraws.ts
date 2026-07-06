import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/context/AuthContext';
import type { DrawnCard } from '@/utils/tarot';

export interface TarotDrawRow {
  id: string;
  draw_date: string; // YYYY-MM-DD
  card_ids: string[];
  reversed: boolean[];
}

// Same day convention as SeedContext: UTC date string.
const todayISO = () => new Date().toISOString().slice(0, 10);

export function useTarotDraws() {
  const { user } = useSession();
  const [recent, setRecent] = useState<TarotDrawRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setRecent([]);
      return;
    }
    const { data } = await supabase
      .from('tarot_draws')
      .select('id, draw_date, card_ids, reversed')
      .eq('user_id', user.id)
      .order('draw_date', { ascending: false })
      .limit(5);
    if (data) setRecent(data as TarotDrawRow[]);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordDraw = useCallback(
    async (cards: DrawnCard[]) => {
      if (!user || cards.length === 0) return;
      await supabase.from('tarot_draws').upsert(
        {
          user_id: user.id,
          draw_date: todayISO(),
          card_ids: cards.map((c) => c.id),
          reversed: cards.map((c) => c.reversed),
        },
        { onConflict: 'user_id,draw_date', ignoreDuplicates: true }
      );
      refresh();
    },
    [user?.id, refresh]
  );

  return { recent, refresh, recordDraw };
}
