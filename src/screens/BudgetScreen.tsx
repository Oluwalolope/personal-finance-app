import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Btn } from '../components/ui';
import Calendar from '../components/Calendar';
import EyeToggle from '../components/EyeToggle';
import SectionTile, { tileBox } from '../components/SectionTile';
import SectionModal from '../components/SectionModal';
import ActivityList, { confirmDelete } from '../components/ActivityList';
import AddModal from '../components/AddModal';
import { useBudget } from '../store';
import { C } from '../theme';
import { dayLabel, fmt, monthTitle, toCsv } from '../utils';
import { Category } from '../types';

export default function BudgetScreen() {
  const b = useBudget();
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState(false);
  const [preCat, setPreCat] = useState<string | null>(null);
  const [sectionModal, setSectionModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  if (!b.ready) return null;

  const mask = (v: number) => (b.hide ? '••••••' : fmt(v));

  const openEntry = (cat: string | null = null) => { setPreCat(cat); setEntry(true); };
  const openSection = (c: Category | null) => { setEditing(c); setSectionModal(true); };
  const exportCsv = async () => {
    const path = `${FileSystem.cacheDirectory}budget-${b.mk}.csv`;
    await FileSystem.writeAsStringAsync(path, toCsv(b.income, b.expenses, b.label));
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export budget' });
  };
  const dayRows = b.rows.filter((r) => r.date === b.selected);
  const incomeRows = b.rows.filter((r) => r.type === 'income');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Cap behind the translucent status bar so content never bleeds through */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: C.blue, zIndex: 10 }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 56, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -40, top: 20, width: 190, height: 190, borderRadius: 95, backgroundColor: '#ffffff12' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>Budget</Text>
              <Text style={{ color: '#DDE1FF', marginTop: 2 }}>{monthTitle(b.view)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00000033', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8 }}>
              <EyeToggle />
              <View style={{ width: 16 }} />
              <Pressable onPress={() => b.shiftMonth(-1)} hitSlop={10}><Ionicons name="chevron-back" size={20} color="#fff" /></Pressable>
              <View style={{ width: 14 }} />
              <Pressable onPress={() => b.shiftMonth(1)} hitSlop={10}><Ionicons name="chevron-forward" size={20} color="#fff" /></Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#1A2490', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginTop: 22 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.yellow, marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '600' }}>{mask(b.livingLeft)} left of {mask(b.available)}</Text>
          </View>
          <Text style={{ color: '#CBD0FF', marginTop: 10 }}>Income {mask(b.total)} · Spent {mask(b.spent)}</Text>
          {b.carry !== 0 && <Text style={{ color: '#CBD0FF', marginTop: 2 }}>Carried over {mask(b.carry)} from earlier months</Text>}
        </View>

        <View style={{ backgroundColor: C.bg, marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 16, paddingTop: 22 }}>
          <Card>
            <Calendar view={b.view} selected={b.selected} today={b.today} totals={b.byDay} onSelect={b.setSelected} />
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>{dayLabel(b.selected)}</Text>
              <Btn label="Add" onPress={() => openEntry()} style={{ paddingVertical: 8, paddingHorizontal: 18 }} />
            </View>
            {dayRows.length === 0 ? (
              <Text style={{ color: C.mute, marginTop: 10 }}>No entries for this day.</Text>
            ) : (
              <ActivityList rows={dayRows} grouped={false} onLongPress={(r) => confirmDelete(r, b.remove)} />
            )}
          </Card>

          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginTop: 6 }}>Sections</Text>
          <Text style={{ color: C.mute, marginBottom: 12, marginTop: 2 }}>
            {mask(b.assigned)} budgeted of {mask(b.available)} available. Tap a section to log a spend.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {b.cats.map((c) => (
              <SectionTile key={c.id} cat={c} onPress={() => openEntry(c.id)} onEdit={() => openSection({ id: c.id, name: c.name, budget: c.budget })} />
            ))}
            <Pressable onPress={() => openSection(null)} style={{ ...tileBox('transparent', C.line), borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add-circle-outline" size={30} color={C.blueLight} />
              <Text style={{ color: C.blueLight, fontWeight: '700', marginTop: 6 }}>New section</Text>
            </Pressable>
          </View>

          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginTop: 10 }}>Income this month</Text>
          {incomeRows.length === 0 ? (
            <Text style={{ color: C.mute, marginTop: 8 }}>No income logged yet.</Text>
          ) : (
            <ActivityList rows={incomeRows} onLongPress={(r) => confirmDelete(r, b.remove)} />
          )}

          <Btn label="Export month to CSV" kind="ghost" onPress={exportCsv} style={{ marginTop: 24 }} />
        </View>
      </ScrollView>

      <AddModal visible={entry} date={b.selected} initialCat={preCat} cats={b.cats} onClose={() => setEntry(false)} onAddExpense={b.addExpense} onAddIncome={b.addIncome} />
      <SectionModal
        visible={sectionModal}
        editing={editing}
        onClose={() => setSectionModal(false)}
        onSave={(name, budget) => (editing ? b.updateCat(editing.id, name, budget) : b.addCat(name, budget))}
        onDelete={b.removeCat}
      />
    </View>
  );
}
