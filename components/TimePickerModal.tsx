import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  onConfirm: (minutes: number, type: string) => void;
  onClose: () => void;
}

export default function TimePickerModal({ visible, onConfirm, onClose }: TimePickerModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(40);
  const [selectedType, setSelectedType] = useState<'세탁기' | '건조기'>('세탁기');
  const minuteOptions = [20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>세탁 정보를 선택하세요</Text>
          <Text style={styles.subtitle}>기기 종류와 남은 시간을 입력해주세요</Text>

          {/* 세탁기 / 건조기 선택 */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === '세탁기' && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedType('세탁기')}
            >
              <Text style={styles.typeIcon}>👕</Text>
              <Text style={[
                styles.typeText,
                selectedType === '세탁기' && styles.typeTextSelected,
              ]}>세탁기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === '건조기' && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedType('건조기')}
            >
              <Text style={styles.typeIcon}>💨</Text>
              <Text style={[
                styles.typeText,
                selectedType === '건조기' && styles.typeTextSelected,
              ]}>건조기</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timeLabel}>⏱️ 사용 시간 선택</Text>

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
            onPress={() => onConfirm(selectedMinutes, selectedType)}
          >
            <Text style={styles.confirmButtonText}>
              {selectedType} {selectedMinutes}분 시작하기
            </Text>
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
    maxHeight: '80%',
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    borderColor: '#4FC3F7',
    backgroundColor: '#1a2a3a',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
  typeTextSelected: {
    color: '#4FC3F7',
  },
  timeLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
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