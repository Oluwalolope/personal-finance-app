import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C } from '../theme';
import { DAYS, dayKey, daysInMonth, fmtShort } from '../utils';

type Props = {
  view: Date;
  selected: string;
  today: string;
  totals: Record<string, number>;
  onSelect: (k: string) => void;
};

export default function Calendar({ view, selected, today, totals, onSelect }: Props) {
  const y = view.getFullYear(), m = view.getMonth();
  const cells: (number | null)[] = [
    ...Array<null>(new Date(y, m, 1).getDay()).fill(null),
    ...Array.from({ length: daysInMonth(view) }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((d) => (
          <Text key={d} style={{ flex: 1, textAlign: 'center', color: C.mute, fontSize: 12, marginBottom: 6 }}>{d[0]}</Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((d, ci) => {
            if (!d) return <View key={ci} style={{ flex: 1, height: 52 }} />;
            const k = dayKey(new Date(y, m, d));
            const sel = k === selected;
            const spent = totals[k];
            return (
              <Pressable key={ci} onPress={() => onSelect(k)} style={{ flex: 1, height: 52, alignItems: 'center', paddingTop: 2 }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: sel ? C.blue : 'transparent', borderWidth: k === today && !sel ? 1.5 : 0, borderColor: C.blueLight,
                }}>
                  <Text style={{ color: C.text, fontWeight: sel || k === today ? '700' : '400' }}>{d}</Text>
                </View>
                <Text style={{ color: C.amber, fontSize: 10, marginTop: 2 }}>{spent ? fmtShort(spent) : ''}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
