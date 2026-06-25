import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';

interface TimerBannerProps {
  minutes: number;
  seconds: number;
  shopName?: string;
}

export default function TimerBanner({ minutes, seconds, shopName }: TimerBannerProps) {
  const { T } = useLanguage();

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🧺</Text>
      <View>
        {shopName && (
          <Text style={styles.shopName}>{shopName}</Text>
        )}
        <Text style={styles.text}>
          {T.timerBanner}{' '}
          <Text style={styles.time}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </Text>
      </View>
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
  shopName: {
    color: '#1a1a2e',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  text: { color: '#1a1a2e', fontWeight: '600', fontSize: 14 },
  time: { fontWeight: 'bold', fontSize: 16 },
});