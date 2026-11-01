import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityList, { confirmDelete } from '../components/ActivityList';
import { useBudget } from '../store';
import { C } from '../theme';

export default function ActivityScreen() {
  const b = useBudget();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48 }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', color: C.text, fontSize: 17, fontWeight: '700', marginRight: 40 }}>Recent Activities</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {b.allRows.length === 0 && <Text style={{ color: C.mute }}>No activity yet.</Text>}
        <ActivityList rows={b.allRows.slice(0, 300)} onLongPress={(r) => confirmDelete(r, b.remove)} />
        {b.allRows.length > 0 && <Text style={{ color: C.mute, marginTop: 16 }}>Long press an entry to delete it.</Text>}
      </ScrollView>
    </View>
  );
}
