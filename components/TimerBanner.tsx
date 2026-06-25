import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';

interface TimerBannerProps {
  minutes: number;
  seconds: number;
}

export default function TimerBanner({ minutes, seconds }: TimerBannerProps) {
  const { T } = useLanguage();

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🧺</Text>
      <Text style={styles.text}>
        {T.timerBanner}{' '}
        <Text style={styles.time}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: { fontSize: 18 },
  text: { color: '#1a1a2e', fontWeight: '600', fontSize: 14 },
  time: { fontWeight: 'bold', fontSize: 16 },
});