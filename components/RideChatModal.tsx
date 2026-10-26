import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  time: string;
  bubbleColor?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface RideChatModalProps {
  visible: boolean;
  driverName?: string;
  driverAvatar?: string;
  etaMinutes?: number;
  onClose: () => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'driver',
    text: 'Hello sir, I am near the intersecting signal, reaching in 5 min.',
    time: '3:24 PM',
  },
  {
    id: 'm2',
    sender: 'user',
    text: 'Hey everybody, this is Stella.',
    time: '3:25 PM',
    bubbleColor: '#C2410C', // Orange accent bubble
  },
  {
    id: 'm3',
    sender: 'user',
    text: 'I am waiting near the bus stop.',
    time: '3:25 PM',
    bubbleColor: '#7C3AED', // Purple accent bubble
  },
];

export default function RideChatModal({
  visible,
  driverName = 'Barry John',
  driverAvatar = 'https://randomuser.me/api/portraits/men/32.jpg',
  etaMinutes = 5,
  onClose,
}: RideChatModalProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulated driver reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'driver',
          text: 'Got it, see you shortly!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>

          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
            <Feather name="more-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Floating Driver Arrival ETA Banner */}
        <View style={styles.arrivalBanner}>
          <View style={styles.arrivalTextGroup}>
            <Text style={styles.arrivalLabel}>DRIVER IS ARRIVING</Text>
            <Text style={styles.arrivalSub}>Meet your driver at pickup spot</Text>
          </View>

          <View style={styles.etaBadge}>
            <Text style={styles.etaNumber}>{etaMinutes}</Text>
            <Text style={styles.etaUnit}>MIN</Text>
          </View>
        </View>

        {/* Messages List */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.timestampContainer}>
              <Text style={styles.timestampText}>Today 3:24 PM</Text>
            </View>

            {messages.map((item) => {
              const isUser = item.sender === 'user';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowDriver,
                  ]}
                >
                  {!isUser && (
                    <Image source={{ uri: driverAvatar }} style={styles.avatar} />
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [
                            styles.bubbleUser,
                            item.bubbleColor ? { backgroundColor: item.bubbleColor } : {},
                          ]
                        : styles.bubbleDriver,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser && styles.messageTextUser,
                      ]}
                    >
                      {item.text}
                    </Text>

                    {isUser && (
                      <View style={styles.checkIconRow}>
                        <Ionicons name="checkmark-done" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Chat Input Bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.addMediaBtn} activeOpacity={0.8}>
              <Feather name="plus" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message"
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              style={styles.sendBtn}
              activeOpacity={0.85}
              onPress={handleSend}
            >
              <Ionicons name="send" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark theme matching screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  driverName: {
    fontFamily: 'JakartaBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  onlineStatus: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#0CC25F',
    marginTop: 1,
  },
  arrivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  arrivalTextGroup: {
    flex: 1,
  },
  arrivalLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  arrivalSub: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  etaBadge: {
    backgroundColor: '#3122D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 48,
  },
  etaNumber: {
    fontFamily: 'JakartaExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  etaUnit: {
    fontFamily: 'JakartaBold',
    fontSize: 8,
    color: '#A5B4FC',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  timestampText: {
    fontFamily: 'JakartaMedium',
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowDriver: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleDriver: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#3122D2',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  checkIconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    gap: 10,
  },
  addMediaBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 13,
    color: '#FFFFFF',
    padding: 0,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3122D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
