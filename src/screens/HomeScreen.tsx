import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Title, Btn, Bar } from '../components/ui';
import ActivityList, { confirmDelete } from '../components/ActivityList';
import AddModal from '../components/AddModal';
import { useBudget } from '../store';
import { MAIN_ACCOUNT, NAME } from '../config';
import { C } from '../theme';
import { fmt, monthTitle } from '../utils';
import { SplitView } from '../types';

export default function HomeScreen() {
  const b = useBudget();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState(false);
  if (!b.ready) return null;

  const sent = b.splits.filter((s) => s.done).length;
  const todayOver = b.todayLeftAll < 0;

  const tapSplit = (s: SplitView) => {
    if (!s.done) return b.setSent(s.key, s.amount);
    Alert.alert('Mark as not sent?', `This resets ${s.label} for this month.`, [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => b.setSent(s.key, 0) },
    ]);
  };
  const splitNote = (s: SplitView) =>
    s.done ? `Sent ${fmt(s.sent)} to ${s.dest}` : s.sent > 0 ? `${fmt(s.sent)} already sent to ${s.dest}` : `to ${s.dest}`;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 56, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -50, top: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: '#ffffff12' }} />
          <View style={{ position: 'absolute', left: -60, bottom: -80, width: 190, height: 190, borderRadius: 95, backgroundColor: '#00000014' }} />
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Hello {NAME}</Text>
          <Text style={{ color: '#CBD0FF', marginTop: 2 }}>{monthTitle(b.view)} · {b.dl} days left</Text>
          <Pressable onPress={b.toggleHide} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
            <Text style={{ color: '#DDE1FF' }}>Left to live on in {MAIN_ACCOUNT}  </Text>
            <Ionicons name={b.hide ? 'eye-off-outline' : 'eye-outline'} size={18} color="#DDE1FF" />
          </Pressable>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 4 }}>{fmt(b.livingLeft)}</Text>
          <Text style={{ color: '#CBD0FF' }}>of {fmt(b.available)} available</Text>
          <Text style={{ color: '#CBD0FF', marginBottom: 20, height: 18 }}>{b.carry !== 0 ? `Includes ${fmt(b.carry)} carried over` : ''}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Btn label="Quick log" kind="yellow" onPress={() => setModal(true)} style={{ marginRight: 10 }} />
            <Btn label="View budget" kind="white" onPress={() => router.push('/budget')} />
          </View>
        </View>

        <View style={{ backgroundColor: C.bg, marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 16, paddingTop: 22 }}>
          <Card>
            <Title>Today</Title>
            {b.hasBudgets ? (
              <>
                <Text style={{ color: todayOver ? C.red : C.green, fontSize: 26, fontWeight: '800' }}>
                  {todayOver ? `Over by ${fmt(-b.todayLeftAll)}` : `${fmt(b.todayLeftAll)} left`}
                </Text>
                <Text style={{ color: C.mute, marginTop: 4 }}>Spent {fmt(b.budgetedToday)} of {fmt(b.allowanceToday)} allowed in budgeted sections</Text>
                <Bar value={b.budgetedToday} max={b.allowanceToday} color={todayOver ? C.red : C.green} />
              </>
            ) : (
              <>
                <Text style={{ color: C.text, fontSize: 26, fontWeight: '800' }}>{fmt(b.spentToday)} spent</Text>
                <Text style={{ color: C.mute, marginTop: 4 }}>Set a budget on a section in the Budget tab to get a daily allowance.</Text>
              </>
            )}
            {b.isCurrent && b.available > 0 && (
              <Text style={{ color: C.mute, marginTop: 10 }}>
                Overall, about {fmt(b.dailyOverall)} a day keeps you going to the end of the month.
              </Text>
            )}
          </Card>

          <Card>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>Move your money</Text>
            <Text style={{ color: C.mute, marginTop: 4 }}>{sent} of {b.splits.length} fully sent. Tap a row when you send it.</Text>
            <Bar value={sent} max={b.splits.length} />
            {b.splits.map((s) => (
              <Pressable key={s.key} onPress={() => tapSplit(s)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={s.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={s.done ? C.green : C.mute} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ color: s.done ? C.mute : C.text, fontWeight: '600' }}>{s.label} ({s.pct}%)</Text>
                    <Text style={{ color: C.mute, fontSize: 12 }}>{splitNote(s)}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: s.done ? C.mute : C.text, fontWeight: '700' }}>{fmt(s.done ? s.sent : s.remaining)}</Text>
                  {!s.done && s.sent > 0 && <Text style={{ color: C.amber, fontSize: 12 }}>additional</Text>}
                </View>
              </Pressable>
            ))}
          </Card>

          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            {[['Income', fmt(b.total), C.green], ['Spent', fmt(b.spent), C.text]].map(([l, v, c], i) => (
              <Card key={l} style={{ flex: 1, marginBottom: 0, marginRight: i === 0 ? 10 : 0 }}>
                <Text style={{ color: C.mute }}>{l}</Text>
                <Text style={{ color: c, fontSize: 18, fontWeight: '800', marginTop: 4 }}>{v}</Text>
              </Card>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>Recent activities</Text>
            <Pressable onPress={() => router.push('/activity')} hitSlop={10}><Text style={{ color: C.blueLight, fontWeight: '600' }}>See all</Text></Pressable>
          </View>
          {b.allRows.length === 0 && <Text style={{ color: C.mute, marginTop: 10 }}>Nothing yet. Log your income, then your spending.</Text>}
          <ActivityList rows={b.allRows.slice(0, 5)} onLongPress={(r) => confirmDelete(r, b.remove)} />
        </View>
      </ScrollView>

      <Pressable onPress={() => setModal(true)} style={{ position: 'absolute', right: 20, bottom: 24, width: 62, height: 62, borderRadius: 31, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', elevation: 6, borderWidth: 3, borderColor: C.blueLight }}>
        <Ionicons name="add" size={34} color="#fff" />
      </Pressable>
      <AddModal visible={modal} date={b.today} initialCat={null} cats={b.cats} onClose={() => setModal(false)} onAddExpense={b.addExpense} onAddIncome={b.addIncome} />
    </View>
  );
}
