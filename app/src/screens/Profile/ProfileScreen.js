import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  ImageBackground,
  TextInput,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../store';
import { getMyProfile } from '../../api/userApi';

// ─── Avatar chữ cái đầu ──────────────────────────────────────────────────────
const Avatar = ({ name, size = 80 }) => {
  const initials = (name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = ['#00C897', '#4ECDC4', '#FFD93D', '#FF8C42', '#A29BFE', '#FF6B6B'];
  const colorIndex = (name || 'U').charCodeAt(0) % colors.length;

  return (
    <View style={[
      avatarStyles.circle,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: colors[colorIndex] }
    ]}>
      <Text style={[avatarStyles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center' },
  text:   { color: '#FFFFFF', fontWeight: '800' },
});

// ─── Row thông tin ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconBox}>
      <Text style={styles.infoIcon}>{icon}</Text>
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { user, token, logout, updateUserInformation } = useAuthStore();

  const [profileData, setProfileData]   = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail]       = useState('');
  const [saving, setSaving]             = useState(false);

  // ── Lấy thông tin chi tiết user từ backend ──
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const data = await getMyProfile();
        setProfileData(data);
      } catch (err) {
        console.log('Fetch profile error:', err.message);
        setProfileData(user); // fallback về dữ liệu trong store
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const displayData = profileData || user || {};

  // ── Mở modal chỉnh sửa ──
  const openEdit = () => {
    setEditUsername(displayData.username || '');
    setEditEmail(displayData.email || '');
    setShowEditModal(true);
  };

  // ── Lưu thay đổi ──
  const handleSave = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Lỗi', 'Tên đăng nhập không được để trống');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        username: editUsername.trim(),
        email: editEmail.trim(),
        role: displayData.role,
      };
      await updateUserInformation(payload);
      setShowEditModal(false);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  // ── Đăng xuất ──
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // ── Định dạng ngày ──
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // ── Rút gọn token để hiển thị ──
  const shortToken = token
    ? `${token.slice(0, 20)}...${token.slice(-10)}`
    : '—';

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
          <TouchableOpacity onPress={openEdit} style={styles.editBtn}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {loadingProfile ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00C897" />
              <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
          ) : (
            <>
              {/* ── Avatar & tên ── */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  <Avatar name={displayData.username} size={90} />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.displayName}>{displayData.username || 'Người dùng'}</Text>
                <Text style={styles.displayEmail}>{displayData.email || '—'}</Text>

                {/* Role badge */}
                {displayData.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {displayData.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Thông tin tài khoản ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

                <InfoRow icon="👤" label="Tên đăng nhập"  value={displayData.username} />
                <InfoRow icon="📧" label="Email"           value={displayData.email} />
                <InfoRow icon="🆔" label="ID người dùng"  value={displayData.id ? String(displayData.id) : '—'} />
                <InfoRow icon="🛡️" label="Vai trò"        value={displayData.role || '—'} />
                {displayData.createdAt && (
                  <InfoRow icon="📅" label="Ngày tạo" value={formatDate(displayData.createdAt)} />
                )}
                {displayData.updatedAt && (
                  <InfoRow icon="🔄" label="Cập nhật lần cuối" value={formatDate(displayData.updatedAt)} />
                )}
              </View>

              {/* ── Phiên đăng nhập ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Phiên đăng nhập</Text>

                <View style={styles.tokenCard}>
                  <View style={styles.tokenHeader}>
                    <Text style={styles.tokenLabel}>🔑 Access Token</Text>
                    <View style={styles.tokenActiveBadge}>
                      <View style={styles.tokenActiveDot} />
                      <Text style={styles.tokenActiveText}>Đang hoạt động</Text>
                    </View>
                  </View>
                  <Text style={styles.tokenValue}>{shortToken}</Text>
                </View>
              </View>

              {/* ── Hành động ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hành động</Text>

                <TouchableOpacity style={styles.actionBtn} onPress={openEdit} activeOpacity={0.8}>
                  <Text style={styles.actionBtnIcon}>✏️</Text>
                  <Text style={styles.actionBtnText}>Chỉnh sửa thông tin</Text>
                  <Text style={styles.actionBtnArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('../../assets/icons/logout.png')}
                    style={styles.logoutImg}
                  />
                  <Text style={[styles.actionBtnText, { color: '#FF4757' }]}>Đăng xuất</Text>
                  <Text style={[styles.actionBtnArrow, { color: '#FF4757' }]}>›</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </ScrollView>

        {/* ── Modal chỉnh sửa ── */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên đăng nhập</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor="#6B7280"
                    value={editUsername}
                    onChangeText={setEditUsername}
                    autoCapitalize="none"
                    editable={!saving}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email"
                    placeholderTextColor="#6B7280"
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!saving}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalBtnTextCancel}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#0A0E1A" />
                    : <Text style={styles.modalBtnTextSave}>Lưu</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bgImage:      { flex: 1 },
  container:    { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.82)' },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  backIcon:     { color: '#FFFFFF', fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerTitle:  { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  editBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  editIcon:     { fontSize: 18 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  // Loading
  loadingBox:   { alignItems: 'center', paddingTop: 80, gap: 14 },
  loadingText:  { color: '#9CA3AF', fontSize: 14 },

  // Avatar section
  avatarSection:  { alignItems: 'center', paddingVertical: 32 },
  avatarWrapper:  { position: 'relative', marginBottom: 14 },
  onlineDot:      { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#00C897', borderWidth: 2, borderColor: '#0A0E1A' },
  displayName:    { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  displayEmail:   { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
  roleBadge:      { marginTop: 10, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(0, 200, 151, 0.15)', borderWidth: 1, borderColor: '#00C89755' },
  roleText:       { color: '#00C897', fontSize: 12, fontWeight: '700' },

  // Section
  section:        { backgroundColor: 'rgba(20, 25, 41, 0.85)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  sectionTitle:   { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },

  // Info rows
  infoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoIconBox:    { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoIcon:       { fontSize: 16 },
  infoContent:    { flex: 1 },
  infoLabel:      { color: '#6B7280', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValue:      { color: '#E5E7EB', fontSize: 14, fontWeight: '500' },

  // Token card
  tokenCard:      { backgroundColor: 'rgba(0, 200, 151, 0.06)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(0, 200, 151, 0.2)' },
  tokenHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tokenLabel:     { color: '#D1D5DB', fontSize: 13, fontWeight: '600' },
  tokenActiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0, 200, 151, 0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tokenActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C897' },
  tokenActiveText:{ color: '#00C897', fontSize: 10, fontWeight: '700' },
  tokenValue:     { color: '#6B7280', fontSize: 11, fontFamily: 'monospace', letterSpacing: 0.5 },

  // Action buttons
  actionBtn:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 12 },
  actionBtnDanger:{ borderBottomWidth: 0, marginTop: 4 },
  actionBtnIcon:  { fontSize: 20, width: 28, textAlign: 'center' },
  actionBtnText:  { flex: 1, color: '#E5E7EB', fontSize: 15, fontWeight: '500' },
  actionBtnArrow: { color: '#4B5563', fontSize: 22 },
  logoutImg:      { width: 22, height: 22, tintColor: '#FF4757' },

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent:       { backgroundColor: '#141929', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#1E2540' },
  modalTitle:         { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
  inputGroup:         { marginBottom: 16 },
  inputLabel:         { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  inputWrapper:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1426', borderRadius: 14, borderWidth: 1, borderColor: '#1E2540', paddingHorizontal: 14 },
  inputIcon:          { fontSize: 18, marginRight: 10 },
  input:              { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 14 },
  modalButtons:       { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn:           { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  modalBtnCancel:     { backgroundColor: '#1E2540' },
  modalBtnSave:       { backgroundColor: '#00C897' },
  modalBtnTextCancel: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  modalBtnTextSave:   { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default ProfileScreen;
