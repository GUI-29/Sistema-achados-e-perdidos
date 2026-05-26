import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Item } from '../database/initDatabase';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onToggleEncontrado: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleEncontrado,
}) => {
  const isEncontrado = item.encontrado === 1;
  const hasAluno = !!item.aluno_nome;

  return (
    <View style={[styles.card, isEncontrado && styles.cardEncontrado]}>
      {/* colour stripe */}
      <View style={[styles.stripe, isEncontrado ? styles.stripeGreen : styles.stripeRed]} />

      <View style={styles.body}>
        {/* row 1 – nome + status */}
        <View style={styles.topRow}>
          <Text style={styles.nomeObjeto} numberOfLines={1}>{item.nome_objeto}</Text>
          <View style={[styles.statusBadge, isEncontrado ? styles.badgeGreen : styles.badgeRed]}>
            <Text style={[styles.statusText, isEncontrado ? styles.statusGreen : styles.statusRed]}>
              {isEncontrado ? '✅ Devolvido' : '🔴 Pendente'}
            </Text>
          </View>
        </View>

        {/* description */}
        <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>

        {/* meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👤</Text>
            <Text style={styles.metaText} numberOfLines={1}>{item.nome_pessoa}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{item.data_cadastro}</Text>
          </View>
        </View>

        {/* aluno row (only if linked) */}
        {hasAluno && (
          <View style={styles.alunoRow}>
            <Text style={styles.alunoIcon}>🎒</Text>
            <Text style={styles.alunoNome} numberOfLines={1}>{item.aluno_nome}</Text>
            <View style={styles.turmaBadge}>
              <Text style={styles.turmaText}>{item.aluno_turma}</Text>
            </View>
          </View>
        )}

        {/* action row */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.toggleBtn, isEncontrado ? styles.toggleBtnRed : styles.toggleBtnGreen]}
            onPress={() => onToggleEncontrado(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleBtnText}>
              {isEncontrado ? '↩ Marcar Pendente' : '✓ Item Devolvido'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnEdit]} onPress={() => onEdit(item)}>
            <Text style={styles.iconBtnEmoji}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDel]} onPress={() => onDelete(item.id)}>
            <Text style={styles.iconBtnEmoji}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    flexDirection: 'row',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  cardEncontrado: { opacity: 0.78 },
  stripe: { width: 5 },
  stripeRed: { backgroundColor: '#ef4444' },
  stripeGreen: { backgroundColor: '#22c55e' },

  body: { flex: 1, padding: 14 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  nomeObjeto: { fontSize: 17, fontWeight: '700', color: '#0f172a', flex: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeGreen: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusRed: { color: '#b91c1c' },
  statusGreen: { color: '#15803d' },

  descricao: { fontSize: 14, color: '#475569', marginBottom: 10, lineHeight: 20 },

  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaIcon: { fontSize: 13 },
  metaText: { fontSize: 13, color: '#64748b', fontWeight: '500', flex: 1 },

  /* aluno */
  alunoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  alunoIcon: { fontSize: 14 },
  alunoNome: { fontSize: 13, color: '#0369a1', fontWeight: '700', flex: 1 },
  turmaBadge: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  turmaText: { fontSize: 11, color: '#fff', fontWeight: '800' },

  /* actions */
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  toggleBtnGreen: { backgroundColor: '#dcfce7' },
  toggleBtnRed: { backgroundColor: '#fee2e2' },
  toggleBtnText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  iconBtn: { width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  iconBtnEdit: { backgroundColor: '#eff6ff' },
  iconBtnDel: { backgroundColor: '#fef2f2' },
  iconBtnEmoji: { fontSize: 18 },
});
