import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Row } from '../types';
import { C } from '../theme';
import { fmt, groupLabel, timeLabel } from '../utils';
import { useBudget } from '../store';

export const confirmDelete = (r: Row, remove: (t: 'income' | 'expenses', id: string) => void) =>
  Alert.alert('Delete this entry?', '', [
    { text: 'Cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => remove(r.type, r.id) },
  ]);

export function ActivityRow({ row, onLongPress }: { row: Row; onLongPress?: () => void }) {
  const { hide } = useBudget();
  const inc = row.type === 'income';
  const sub = [row.note, timeLabel(row.ts)].filter(Boolean).join(' · ');
  return (
    <Pressable onLongPress={onLongPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: inc ? '#16332A' : '#3A1C22' }}>
        <Ionicons name={inc ? 'arrow-down' : 'arrow-up'} size={20} color={inc ? C.green : C.red} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{row.title}</Text>
        {!!sub && <Text style={{ color: C.mute, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{sub}</Text>}
      </View>
      <View style={{ backgroundColor: inc ? '#12392A' : '#3B1D22', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
        <Text style={{ color: inc ? C.green : C.red, fontWeight: '700', fontSize: 13 }}>{inc ? '+' : '-'}{hide ? '••••••' : fmt(row.amount)}</Text>
      </View>
    </Pressable>
  );
}

type Props = { rows: Row[]; grouped?: boolean; onLongPress?: (r: Row) => void };

export default function ActivityList({ rows, grouped = true, onLongPress }: Props) {
  let last = '';
  return (
    <View>
      {rows.map((r) => {
        const head = grouped && r.date !== last ? groupLabel(r.date) : null;
        last = r.date;
        return (
          <View key={r.id}>
            {head && <Text style={{ color: C.mute, fontSize: 13, marginTop: 14, marginBottom: 2 }}>{head}</Text>}
            <ActivityRow row={r} onLongPress={onLongPress ? () => onLongPress(r) : undefined} />
          </View>
        );
      })}
    </View>
  );
}
