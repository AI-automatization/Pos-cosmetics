import { StyleSheet } from 'react-native';
import { C } from './settings.constants';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },

  scroll: {
    paddingBottom: 40,
    gap: 8,
    paddingTop: 16,
  },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  profileRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  profileBranch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileBranchText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  profileEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.white,
  },

  // Section title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 52,
  },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBlue: {
    backgroundColor: '#EFF6FF',
  },
  menuIconPurple: {
    backgroundColor: '#F5F3FF',
  },
  menuLabelContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
  },
  menuLabelDanger: {
    color: C.red,
  },
  menuSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: C.muted,
  },

  // Segment control
  segmentRow: {
    flexDirection: 'row',
  },
  segmentBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  segmentBtnFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentBtnLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
  },
  segmentTextActive: {
    color: C.white,
  },

  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: C.border,
    paddingTop: 8,
  },
});
