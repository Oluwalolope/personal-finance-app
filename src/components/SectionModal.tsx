import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Text, View } from 'react-native';
import { Btn, Field } from './ui';
import { C } from '../theme';
import { Category } from '../types';

type Props = {
  visible: boolean;
  editing: Category | null;
  onClose: () => void;
  onSave: (name: string, budget: number) => void;
  onDelete: (id: string) => void;
};

export default function SectionModal({ visible, editing, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(editing?.name ?? '');
    setBudget(editing && editing.budget > 0 ? String(editing.budget) : '');
  }, [visible, editing]);

  const save = () => {
    if (!name.trim()) return;
    onSave(name.trim(), parseFloat(budget.replace(/,/g, '')) || 0);
    onClose();
  };
  const remove = () =>
    Alert.alert('Delete this section?', 'Past entries stay in your history as Uncategorised.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { if (editing) onDelete(editing.id); onClose(); } },
    ]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#000A' }}>
        <View style={{ backgroundColor: C.bg, padding: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          <Text style={{ color: C.text, fontSize: 20, fontWeight: '800', marginBottom: 14 }}>{editing ? 'Edit section' : 'New section'}</Text>
          <Field placeholder="Name (e.g. Travel, Entertainment)" value={name} onChangeText={setName} autoFocus />
          <Field placeholder="Monthly budget (optional)" keyboardType="numeric" value={budget} onChangeText={setBudget} />
          <Text style={{ color: C.mute, marginBottom: 14 }}>Leave the budget empty to just track spending.</Text>
          <Btn label="Save" onPress={save} />
          {editing && <Btn label="Delete section" kind="ghost" onPress={remove} style={{ marginTop: 8 }} />}
          <Btn label="Cancel" kind="ghost" onPress={onClose} style={{ marginTop: 8 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
