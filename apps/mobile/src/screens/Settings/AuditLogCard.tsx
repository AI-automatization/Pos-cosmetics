import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AuditLog } from '../../api/audit.api';

// ─── Constants ────────────────────────────────────────
const ACTION_CONFIG: Record<
  'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN',
  { label: string; text: string; bg: string }
> = {
  CREATE: { label: 'Yaratish',  text: '#16A34A', bg: '#F0FDF4' },
  UPDATE: { label: 'Tahrirlash', text: '#2563EB', bg: '#EFF6FF' },
  DELETE: { label: "O'chirish",  text: '#EF4444', bg: '#FEE2E2' },
  LOGIN:  { label: 'Kirish',     text: '#6B7280', bg: '#F3F4F6' },
};

// ─── Helpers ──────────────────────────────────────────
export function formatDate(iso: string): string {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '\u2014';
  return (
    d.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── ActionBadge ──────────────────────────────────────
interface ActionBadgeProps {
  readonly action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
}

function ActionBadge({ action }: ActionBadgeProps) {
  const cfg = ACTION_CONFIG[action] ?? { label: action, text: '#6B7280', bg: '#F3F4F6' };
  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});

// ─── JsonPreview ──────────────────────────────────────
interface JsonPreviewProps {
  readonly label: string;
  readonly data: Record<string, unknown>;
  readonly bgColor: string;
  readonly textColor: string;
}

function JsonPreview({ label, data, bgColor, textColor }: JsonPreviewProps) {
  return (
    <View style={[previewStyles.container, { backgroundColor: bgColor }]}>
      <Text style={[previewStyles.label, { color: textColor }]}>{label}</Text>
      <ScrollView style={previewStyles.scroll} nestedScrollEnabled>
        <Text style={previewStyles.json}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  scroll: {
    maxHeight: 120,
  },
  json: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

// ─── AuditLogCard ─────────────────────────────────────
interface AuditLogCardProps {
  readonly log: AuditLog;
}

export default function AuditLogCard({ log }: AuditLogCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(log.oldValue ?? log.newValue);

  const entityLabel = log.entityId
    ? `${log.entityType}: ${log.entityId}`
    : log.entityType;

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => setExpanded((prev) => !prev)}
      activeOpacity={0.8}
    >
      <View style={cardStyles.row}>
        <ActionBadge action={log.action} />
        <View style={cardStyles.info}>
          <Text style={cardStyles.entity} numberOfLines={1}>
            {entityLabel}
          </Text>
          <Text style={cardStyles.meta}>
            {log.userName}
            {log.branchName ? ` \u00B7 ${log.branchName}` : ''}
          </Text>
        </View>
        <View style={cardStyles.right}>
          <Text style={cardStyles.date}>{formatDate(log.createdAt)}</Text>
          {hasDetail && (
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#9CA3AF"
              style={cardStyles.chevron}
            />
          )}
        </View>
      </View>

      {expanded && hasDetail && (
        <View style={cardStyles.detail}>
          {log.oldValue && (
            <JsonPreview
              label="Eski qiymat"
              data={log.oldValue}
              bgColor="#FEE2E2"
              textColor="#EF4444"
            />
          )}
          {log.newValue && (
            <JsonPreview
              label="Yangi qiymat"
              data={log.newValue}
              bgColor="#F0FDF4"
              textColor="#16A34A"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  entity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  chevron: {
    marginTop: 2,
  },
  detail: {
    marginTop: 10,
    gap: 0,
  },
});
