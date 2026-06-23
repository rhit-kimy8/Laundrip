import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  onConfirm: (minutes: number) => void;
  onClose: () => void;
}

export default function TimePickerModal({ visible, onConfirm, onClose }: TimePickerModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(40);
  const minuteOptions = [20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>세탁 시간을 선택하세요</Text>
          <Text style={styles.subtitle}>세탁기에 표시된 남은 시간을 입력해주세요</Text>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {minuteOptions.map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.option,
                  selectedMinutes === min && styles.selectedOption,
                ]}
                onPress={() => setSelectedMinutes(min)}
              >
                <Text style={[
                  styles.optionText,
                  selectedMinutes === min && styles.selectedOptionText,
                ]}>
                  {min}분
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(selectedMinutes)}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>취소</Text>
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
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 20,
  },
  scroll: {
    maxHeight: 200,
    marginBottom: 16,
  },
  option: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#4FC3F7',
  },
  optionText: {
    color: '#888',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
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
});