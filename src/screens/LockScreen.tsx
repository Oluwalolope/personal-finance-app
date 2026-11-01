import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PinPad from '../components/PinPad';
import { C } from '../theme';
import { NAME } from '../config';

const hash = (p: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, 'pin:' + p);
type Stage = 'enter' | 'create' | 'confirm';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const insets = useSafeAreaInsets();
  const [stored, setStored] = useState<string | null | undefined>(undefined);
  const [stage, setStage] = useState<Stage>('enter');
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState('');
  const [msg, setMsg] = useState('');
  const [canBio, setCanBio] = useState(false);
  const bioRef = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    SecureStore.getItemAsync('pinh').then((v) => { setStored(v); if (!v) setStage('create'); });
  }, []);

  const bio = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock your budget', cancelLabel: 'Use PIN' });
      if (r.success) onUnlock();
    } finally {
      busy.current = false;
    }
  }, [onUnlock]);

  useEffect(() => {
    if (!stored) return;
    (async () => {
      const ok = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
      bioRef.current = ok;
      setCanBio(ok);
      if (ok && AppState.currentState === 'active') bio();
    })();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active' && bioRef.current) bio(); });
    return () => sub.remove();
  }, [stored, bio]);

  useEffect(() => {
    if (pin.length < 4) return;
    (async () => {
      if (stage === 'enter') {
        if ((await hash(pin)) === stored) onUnlock();
        else { setMsg('Wrong PIN, try again'); setPin(''); }
      } else if (stage === 'create') {
        setFirst(pin); setPin(''); setStage('confirm'); setMsg('');
      } else if (pin === first) {
        await SecureStore.setItemAsync('pinh', await hash(pin));
        onUnlock();
      } else {
        setMsg('PINs did not match, start again'); setPin(''); setFirst(''); setStage('create');
      }
    })();
  }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stored === undefined) return <View style={{ flex: 1, backgroundColor: C.blue }} />;

  const heading = stage === 'enter' ? 'Enter your PIN' : stage === 'create' ? 'Create a 4-digit PIN' : 'Confirm your PIN';
  return (
    <View style={{ flex: 1, backgroundColor: C.blue }}>
      <View style={{ paddingTop: insets.top + 50, paddingHorizontal: 24, alignItems: 'center', flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>Hello {NAME}</Text>
        <Text style={{ color: '#DDE1FF', marginTop: 8, fontSize: 16 }}>{heading}</Text>
        <View style={{ flexDirection: 'row', marginTop: 28 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: 18, height: 18, borderRadius: 9, marginHorizontal: 9, backgroundColor: i < pin.length ? '#fff' : '#ffffff40' }} />
          ))}
        </View>
        <Text style={{ color: C.yellow, marginTop: 16, height: 20 }}>{msg}</Text>
      </View>
      <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 28, paddingBottom: insets.bottom + 20 }}>
        <PinPad
          onDigit={(d) => { if (pin.length < 4) { setMsg(''); setPin(pin + d); } }}
          onDelete={() => setPin(pin.slice(0, -1))}
          onBio={stage === 'enter' && canBio ? bio : undefined}
        />
      </View>
    </View>
  );
}
