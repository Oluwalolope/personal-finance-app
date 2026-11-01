import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Bar } from '../components/ui';
import EyeToggle from '../components/EyeToggle';
import { tileBox } from '../components/SectionTile';
import { useBudget } from '../store';
import { MAIN_ACCOUNT } from '../config';
import { C, tileAt } from '../theme';
import { fmt, monthKeyTitle } from '../utils';

const SPLIT_COLORS = [tileAt(4), tileAt(3), tileAt(1)]; // family, investments, savings
const LIVED = tileAt(2);

export default function StatsScreen() {
  const b = useBudget();
  const insets = useSafeAreaInsets();
  if (!b.ready) return null;
  const st = b.stats;
  const pct = (v: number) => (st.income > 0 ? Math.round((v / st.income) * 100) : 0);

  const segs = [
    ...st.splits.map((s, i) => ({ label: `${s.label} (${s.dest})`, value: s.sent, color: SPLIT_COLORS[i % 3].fg })),
    { label: `Lived on (${MAIN_ACCOUNT})`, value: st.spent, color: LIVED.fg },
    { label: 'Not yet sent or spent', value: Math.max(0, st.income - st.sent - st.spent), color: C.card2 },
  ];
  const line = (l: string, v: string, color: string = C.text) => (
    <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
      <Text style={{ color: C.mute }}>{l}</Text>
      <Text style={{ color, fontWeight: '600' }}>{v}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 56, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -40, top: 20, width: 190, height: 190, borderRadius: 95, backgroundColor: '#ffffff12' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>Statistics</Text>
              <Text style={{ color: '#DDE1FF', marginTop: 2 }}>All time</Text>
            </View>
            <View style={{ backgroundColor: '#00000033', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
              <EyeToggle />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#1A2490', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginTop: 22 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.yellow, marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '600' }}>Total income {fmt(st.income)}</Text>
          </View>
          <Text style={{ color: '#CBD0FF', marginTop: 10 }}>Lived on {fmt(st.spent)} · Sent out {fmt(st.sent)}</Text>
        </View>

        <View style={{ backgroundColor: C.bg, marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 16, paddingTop: 22 }}>
          <Card>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Where your income went</Text>
            <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: C.card2 }}>
              {segs.filter((s) => s.value > 0).map((s) => <View key={s.label} style={{ flex: s.value, backgroundColor: s.color }} />)}
            </View>
            {segs.map((s) => (
              <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 10 }} />
                <Text style={{ flex: 1, color: C.text }} numberOfLines={1}>{s.label}</Text>
                <Text style={{ color: C.mute, marginRight: 10 }}>{pct(s.value)}%</Text>
                <Text style={{ color: C.text, fontWeight: '700' }}>{fmt(s.value)}</Text>
              </View>
            ))}
          </Card>

          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 6 }}>Sent out and lived on</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {st.splits.map((s, i) => {
              const t = SPLIT_COLORS[i % 3];
              const left = Math.max(0, s.due - s.sent);
              return (
                <View key={s.key} style={tileBox(t.bg, t.fg + '33')}>
                  <Text style={{ color: t.fg, fontWeight: '800' }} numberOfLines={1}>{s.label}</Text>
                  <View>
                    <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>{fmt(s.sent)}</Text>
                    <Text style={{ color: C.mute, fontSize: 12 }}>sent to {s.dest}</Text>
                    <Bar value={s.sent} max={s.due} color={t.fg} />
                    <Text style={{ color: left > 0 ? C.amber : C.mute, fontSize: 12, marginTop: 6 }}>
                      {left > 0 ? `${fmt(left)} still to send` : 'Fully sent'}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={tileBox(LIVED.bg, LIVED.fg + '33')}>
              <Text style={{ color: LIVED.fg, fontWeight: '800' }}>Lived on</Text>
              <View>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>{fmt(st.spent)}</Text>
                <Text style={{ color: C.mute, fontSize: 12 }}>spent from {MAIN_ACCOUNT}</Text>
                <Bar value={st.spent} max={st.spent + Math.max(st.livingLeft, 0)} color={LIVED.fg} />
                <Text style={{ color: st.livingLeft < 0 ? C.red : C.mute, fontSize: 12, marginTop: 6 }}>{fmt(st.livingLeft)} left to live on</Text>
              </View>
            </View>
          </View>

          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 12 }}>By month</Text>
          {st.monthly.length === 0 && <Text style={{ color: C.mute }}>Nothing to show yet.</Text>}
          {st.monthly.map((m) => (
            <Card key={m.mk}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '700' }}>{monthKeyTitle(m.mk)}</Text>
              {line('Income', fmt(m.income), C.green)}
              {line('Sent out', `${fmt(m.sent)} of ${fmt(m.due)}`)}
              {line('Lived on', fmt(m.spent))}
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
