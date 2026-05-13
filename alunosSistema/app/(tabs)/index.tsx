import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AlunoCard } from '../../components/AlunoCard';
import { AlunoForm } from '../../components/AlunoForm';
import { EmptyState } from '../../components/EmptyState';
import { Aluno, getAllAlunos, createAluno, updateAluno, deleteAluno, searchAlunos } from '../../database/initDatabase';

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchText, setSearchText] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const loadAlunos = useCallback(async () => {
    if (searchText.trim()) {
      const result = await searchAlunos(searchText);
      setAlunos(result);
    } else {
      const result = await getAllAlunos();
      setAlunos(result);
    }
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      loadAlunos();
    }, [loadAlunos])
  );

  useEffect(() => {
    loadAlunos();
  }, [searchText, loadAlunos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlunos();
    setRefreshing(false);
  };

  const handleSave = async (nome: string, email: string, celular: string) => {
    if (editingAluno) {
      await updateAluno(editingAluno.id, nome, email, celular);
    } else {
      await createAluno(nome, email, celular);
    }
    await loadAlunos();
    setEditingAluno(null);
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      await deleteAluno(idToDelete);
      await loadAlunos();
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingAluno(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alunos</Text>
        <TextInput
          style={styles.search}
          placeholder="Buscar por nome..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlunoCard aluno={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<EmptyState message="Nenhum aluno cadastrado" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6c3ce0']} />}
        contentContainerStyle={alunos.length === 0 ? styles.emptyList : undefined}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AlunoForm
        visible={formVisible}
        aluno={editingAluno}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Confirmar Exclusão</Text>
            <Text style={styles.deleteMessage}>Tem certeza que deseja excluir este aluno? Isso também excluirá todas as suas notas.</Text>
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
    marginBottom: 12,
  },
  search: {
    backgroundColor: '#f0edff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
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