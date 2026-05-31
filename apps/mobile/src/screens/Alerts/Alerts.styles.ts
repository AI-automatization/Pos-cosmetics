import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  markAllTextDisabled: {
    opacity: 0.4,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#2563EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowUnread: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
