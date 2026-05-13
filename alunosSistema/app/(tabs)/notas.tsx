import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { NotaCard } from '../../components/NotaCard';
import { NotaForm } from '../../components/NotaForm';
import { EmptyState } from '../../components/EmptyState';
import { Nota, Aluno, getAllNotas, getAllAlunos, createNota, updateNota, deleteNota } from '../../database/initDatabase';

export default function NotasScreen() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [notasKey, setNotasKey] = useState(0);

  const loadNotas = useCallback(async () => {
    const result = await getAllNotas();
    console.log('Notas carregadas:', result);
    setNotas(result);
    setNotasKey(k => k + 1);
  }, []);

  const loadAlunos = useCallback(async () => {
    return await getAllAlunos();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotas();
    }, [loadNotas])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotas();
    setRefreshing(false);
  };

  const handleSave = async (n1: number, n2: number, id_aluno: number) => {
    if (editingNota) {
      await updateNota(editingNota.id, n1, n2, id_aluno);
    } else {
      await createNota(n1, n2, id_aluno);
    }
    await loadNotas();
  };

  const handleEdit = (nota: Nota) => {
    setEditingNota(nota);
    setFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    console.log('confirmDelete chamado, idToDelete:', idToDelete);
    if (idToDelete !== null) {
      try {
        await deleteNota(idToDelete); 
        console.log('delete Nota OK');
        await loadNotas();
        console.log('loadNotas OK');
      } catch (e) {
        console.error('Erro ao excluir:', e);
      }
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingNota(null);
  };

  const hasAlunos = notas.length > 0 || true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notas</Text>
      </View>

      <FlatList
        data={notas}
        key={`notas-list-${notasKey}`}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotaCard nota={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<EmptyState message="Nenhuma nota cadastrada" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6c3ce0']} />}
        contentContainerStyle={notas.length === 0 ? styles.emptyList : undefined}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <NotaForm
        visible={formVisible}
        nota={editingNota}
        onClose={handleCloseForm}
        onSave={handleSave}
        onLoadAlunos={loadAlunos}
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Confirmar Exclusão</Text>
            <Text style={styles.deleteMessage}>Tem certeza que deseja excluir esta nota?</Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity style={styles.cancelDelete} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDelete} onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c3ce0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c3ce0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDelete: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmDelete: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});