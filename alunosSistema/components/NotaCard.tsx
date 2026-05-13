import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Nota } from '../database/initDatabase';

interface NotaCardProps {
  nota: Nota;
  onEdit: (nota: Nota) => void;
  onDelete: (id: number) => void;
}

export const NotaCard: React.FC<NotaCardProps> = ({ nota, onEdit, onDelete }) => {
  const isApproved = (nota.media ?? 0) >= 7;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.aluno}>{nota.nome_aluno || 'Aluno não encontrado'}</Text>
        <View style={styles.notas}>
          <View style={styles.notaItem}>
            <Text style={styles.notaLabel}>N1</Text>
            <Text style={styles.notaValue}>{nota.n1?.toFixed(1) ?? '-'}</Text>
          </View>
          <View style={styles.notaItem}>
            <Text style={styles.notaLabel}>N2</Text>
            <Text style={styles.notaValue}>{nota.n2?.toFixed(1) ?? '-'}</Text>
          </View>
          <View style={styles.notaItem}>
            <Text style={styles.notaLabel}>Média</Text>
            <Text style={[styles.notaValue, styles.media, isApproved ? styles.approved : styles.reproved]}>
              {nota.media?.toFixed(1) ?? '-'}
            </Text>
          </View>
        </View>
        <View style={[styles.badge, isApproved ? styles.badgeApproved : styles.badgeReproved]}>
          <Text style={[styles.badgeText, isApproved ? styles.approvedText : styles.reprovedText]}>
            {isApproved ? '✅ Aprovado' : '❌ Reprovado'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(nota)}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => {
            console.log('Botão excluir clicado, ID:', nota.id);
            onDelete(nota.id);
          }}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6c3ce0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  aluno: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  notas: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  notaItem: {
    alignItems: 'center',
  },
  notaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  notaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  media: {
    fontSize: 20,
  },
  approved: {
    color: '#16a34a',
  },
  reproved: {
    color: '#dc2626',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeApproved: {
    backgroundColor: '#dcfce7',
  },
  badgeReproved: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvedText: {
    color: '#16a34a',
  },
  reprovedText: {
    color: '#dc2626',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0edff',
  },
  editText: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffeaea',
  },
  deleteText: {
    fontSize: 18,
  },
});