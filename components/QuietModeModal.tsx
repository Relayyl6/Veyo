import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface QuietModeModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUIET_RULES = [
  {
    id: '1',
    icon: 'headset-outline',
    title: 'Enjoy your playlist without interruptions.',
  },
  {
    id: '2',
    icon: 'volume-mute-outline',
    title: 'Avoid conversations about bad roads, fuel prices, and politics.',
  },
  {
    id: '3',
    icon: 'timer-outline',
    title: 'Designed to add no more than 5 minutes to your trip on average.',
  },
  {
    id: '4',
    icon: 'chatbubble-ellipses-outline',
    title: 'Communicate with nods or head shakes only.',
  },
];

export default function QuietModeModal({
  visible,
  onClose,
}: QuietModeModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Header / Hero Image Frame */}
        <View style={styles.heroFrame}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=90',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color="#0B1528" />
          </TouchableOpacity>

          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>How Quiet Mode works</Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainHeading}>Ride in peace, stay in silence</Text>

          {/* 4 Feature Bullet Cards */}
          <View style={styles.rulesList}>
            {QUIET_RULES.map((rule) => (
              <View key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleIconCircle}>
                  <Ionicons name={rule.icon as any} size={18} color="#3122D2" />
                </View>
                <Text style={styles.ruleText}>{rule.title}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom CTA Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={onClose}
          >
            <Text style={styles.ctaButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroFrame: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#0B1528',
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  mainHeading: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 20,
    color: '#3122D2',
    textAlign: 'center',
    marginBottom: 24,
  },
  rulesList: {
    gap: 12,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 14,
  },
  ruleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ctaButton: {
    backgroundColor: '#3122D2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
