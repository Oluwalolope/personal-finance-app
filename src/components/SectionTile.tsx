import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CatView } from '../types';
import { C, tileAt } from '../theme';
import { fmt } from '../utils';
import { useBudget } from '../store';

type Props = { cat: CatView; onPress: () => void; onEdit: () => void };

export const tileBox = (bg: string, border: string) => ({
  width: '48.5%' as const, minHeight: 124, borderRadius: 20, padding: 14, marginBottom: 12,
  backgroundColor: bg, borderWidth: 1, borderColor: border, justifyContent: 'space-between' as const,
});

export default function SectionTile({ cat, onPress, onEdit }: Props) {
  const { hide } = useBudget();
  const mask = (v: number) => (hide ? '••••••' : fmt(v));
  const t = tileAt(cat.index);
  const over = cat.hasBudget && cat.left < 0;
  const todayOver = cat.todayLeft < 0;
  const pct = cat.hasBudget ? Math.round((cat.spent / cat.budget) * 100) : 0;
  return (
    <Pressable onPress={onPress} style={tileBox(t.bg, t.fg + '33')}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={onEdit} hitSlop={12}><Ionicons name="create-outline" size={18} color={t.fg} /></Pressable>
        <View style={{ backgroundColor: t.fg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
          <Text style={{ color: '#101214', fontSize: 11, fontWeight: '800' }}>{cat.hasBudget ? `${pct}% used` : 'Add'}</Text>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <Text style={{ color: t.fg, fontWeight: '800', fontSize: 16 }} numberOfLines={1}>{cat.name}</Text>
        {cat.hasBudget ? (
          <>
            <Text style={{ color: over ? C.red : C.text, fontSize: 13, marginTop: 4 }}>{mask(cat.left)} left</Text>
            <Text style={{ color: todayOver ? C.red : C.mute, fontSize: 12 }}>
              {todayOver ? `Over today by ${mask(-cat.todayLeft)}` : `${mask(cat.todayLeft)} left today`}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: C.text, fontSize: 13, marginTop: 4 }}>{mask(cat.spent)} spent</Text>
            <Text style={{ color: C.mute, fontSize: 12 }}>No budget set</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
