import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LaundryShop {
  id: number;
  name: string;
  washer: number;
  dryer: number;
  distance: string;
}

interface LaundryPopupProps {
  shop: LaundryShop | null;
  visible: boolean;
  onClose: () => void;
  onStartWash: () => void;
}

export default function LaundryPopup({ shop, visible, onClose, onStartWash }: LaundryPopupProps) {
  if (!shop) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.name}>{shop.name}</Text>
          <Text style={styles.distance}>📍 {shop.distance}</Text>

          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>👕</Text>
              <Text style={styles.cardLabel}>세탁기</Text>
              <Text style={styles.cardCount}>{shop.washer}대 가능</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>💨</Text>
              <Text style={styles.cardLabel}>건조기</Text>
              <Text style={styles.cardCount}>{shop.dryer}대 가능</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              (shop.washer === 0 && shop.dryer === 0) && styles.disabledButton
              ]}
              onPress={(shop.washer === 0 && shop.dryer === 0) ? undefined : onStartWash}
              >
            <Text style={styles.startButtonText}>
              {(shop.washer === 0 && shop.dryer === 0)
              ? '❌ 사용 가능한 기기 없음'
              : '이곳에서 세탁/건조 시작하기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: '#1e1e2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  distance: {
    color: '#888',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  cardCount: {
    color: '#4FC3F7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    padding: 8,
  },
  closeButtonText: {
    color: '#888',
    fontSize: 14,
  },
  disabledButton: {
  backgroundColor: '#444',
  },
});