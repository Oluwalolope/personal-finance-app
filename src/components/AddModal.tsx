import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, tileAt } from '../theme';
import { INCOME_SOURCES } from '../config';
import { CatView, Expense, Income } from '../types';
import { dayLabel, fmt, fmtInput } from '../utils';

type Props = {
  visible: boolean;
  date: string;
  initialCat: string | null;
  cats: CatView[];
  onClose: () => void;
  onAddExpense: (e: Pick<Expense, 'amount' | 'cat' | 'note'>, date: string) => void;
  onAddIncome: (i: Pick<Income, 'amount' | 'source' | 'note'>, date: string) => void;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export default function AddModal({ visible, date, initialCat, cats, onClose, onAddExpense, onAddIncome }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [cat, setCat] = useState('');
  const [source, setSource] = useState(INCOME_SOURCES[0]);

  useEffect(() => {
    if (!visible) return;
    setAmount('0');
    setNote('');
    if (initialCat) setMode('expense');
    setCat(initialCat ?? cats[0]?.id ?? '');
  }, [visible, initialCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (k: string) =>
    setAmount((a) => {
      if (k === 'del') return a.length <= 1 ? '0' : a.slice(0, -1);
      if (a.length >= 12) return a;
      if (k === '.') return a.includes('.') ? a : a + '.';
      if (a.includes('.') && a.split('.')[1].length >= 2) return a;
      return a === '0' ? k : a + k;
    });

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    if (mode === 'expense') {
      if (!cat) return;
      onAddExpense({ amount: n, cat, note: note.trim() }, date);
    } else {
      onAddIncome({ amount: n, source, note: note.trim() }, date);
    }
    onClose();
  };

  const tiles =
    mode === 'expense'
      ? cats.map((c) => ({ id: c.id, title: c.name, sub: c.hasBudget ? `${fmt(c.left)} left` : 'No budget', i: c.index }))
      : INCOME_SOURCES.map((s, i) => ({ id: s, title: s, sub: 'Income', i }));
  const picked = mode === 'expense' ? cat : source;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#1B2350', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={mode === 'expense' ? 'arrow-up' : 'arrow-down'} size={20} color={C.blueLight} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>{mode === 'expense' ? 'Add expense' : 'Add income'}</Text>
                <Text style={{ color: C.mute, fontSize: 12 }}>{dayLabel(date)}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={22} color={C.text} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 4, marginTop: 18 }}>
            {(['expense', 'income'] as const).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: mode === m ? C.blue : 'transparent' }}>
                <Text style={{ color: C.text, fontWeight: '700' }}>{m === 'expense' ? 'Expense' : 'Income'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ color: C.text, fontSize: 20, fontWeight: '700' }}>₦</Text>
            </View>
            <Text style={{ color: C.text, fontSize: 46, fontWeight: '800' }}>{fmtInput(amount)}</Text>
          </View>
          <View style={{ alignSelf: 'center', backgroundColor: '#1D2257', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 14, marginTop: 10 }}>
            <Text style={{ color: C.blueLight, fontSize: 13 }}>{mode === 'expense' ? 'How much did you spend?' : 'How much did you receive?'}</Text>
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={C.mute}
            style={{ backgroundColor: C.card, color: C.text, borderRadius: 14, padding: 14, fontSize: 15, marginTop: 18 }}
          />

          <Text style={{ color: C.text, fontWeight: '700', marginTop: 20, marginBottom: 10 }}>{mode === 'expense' ? 'Section' : 'Source of income'}</Text>
          {tiles.length === 0 ? (
            <Text style={{ color: C.mute }}>Create a section in the Budget tab first.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {tiles.map((t) => {
                const col = tileAt(t.i);
                const on = picked === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => (mode === 'expense' ? setCat(t.id) : setSource(t.id))}
                    style={{ width: 132, borderRadius: 16, padding: 12, marginRight: 10, backgroundColor: col.bg, borderWidth: 2, borderColor: on ? col.fg : 'transparent' }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 18 }}>
                      {on && <Ionicons name="checkmark-circle" size={18} color={col.fg} />}
                    </View>
                    <Text style={{ color: col.fg, fontWeight: '800', marginTop: 8 }} numberOfLines={1}>{t.title}</Text>
                    <Text style={{ color: C.mute, fontSize: 12 }} numberOfLines={1}>{t.sub}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
            {KEYS.map((k) => (
              <Pressable key={k} onPress={() => press(k)} style={{ width: '33.33%', height: 56, alignItems: 'center', justifyContent: 'center' }}>
                {k === 'del' ? (
                  <Ionicons name="backspace-outline" size={26} color={C.blueLight} />
                ) : (
                  <Text style={{ color: C.text, fontSize: 26, fontWeight: '500' }}>{k}</Text>
                )}
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ color: '#111', fontWeight: '700', fontSize: 16 }}>Back</Text>
            </Pressable>
            <Pressable onPress={submit} style={{ flex: 1.3, backgroundColor: C.blue, paddingVertical: 16, borderRadius: 30, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{mode === 'expense' ? 'Add expense' : 'Add income'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
