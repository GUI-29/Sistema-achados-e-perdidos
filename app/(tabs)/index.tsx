import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ItemCard } from '../../components/ItemCard';
import { ItemForm } from '../../components/ItemForm';
import { EmptyState } from '../../components/EmptyState';
import {
  Item,
  getAllItens,
  createItem,
  updateItem,
  deleteItem,
  marcarEncontrado,
} from '../../database/initDatabase';

export default function ItensScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const loadItens = useCallback(async () => {
    const result = await getAllItens();
    setItens(result);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItens();
    }, [loadItens])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItens();
    setRefreshing(false);
  };

  const handleSave = async (
    nome_objeto: string,
    descricao: string,
    data_cadastro: string,
    nome_pessoa: string,
    id_aluno: number | null
  ) => {
    if (editingItem) {
      await updateItem(editingItem.id, nome_objeto, descricao, data_cadastro, nome_pessoa, id_aluno);
    } else {
      await createItem(nome_objeto, descricao, data_cadastro, nome_pessoa, id_aluno);
    }
    await loadItens();
    setEditingItem(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      await deleteItem(idToDelete);
      await loadItens();
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleToggleEncontrado = async (item: Item) => {
    await marcarEncontrado(item.id, item.encontrado === 1 ? 0 : 1);
    await loadItens();
  };

  const pendentes = itens.filter((i) => i.encontrado === 0);
  const devolvidos = itens.filter((i) => i.encontrado === 1);
  const sections: Item[] = [...pendentes, ...devolvidos];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📦 Achados & Perdidos</Text>
          <View style={styles.statsRow}>
            <View style={[styles.badge, styles.badgePendente]}>
              <Text style={styles.badgeText}>
                🔴 {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeEncontrado]}>
              <Text style={styles.badgeText}>
                ✅ {devolvidos.length} devolvido{devolvidos.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleEncontrado={handleToggleEncontrado}
            />
          )}
          ListEmptyComponent={
            <EmptyState message={'Nenhum item cadastrado ainda.\nToque em + para adicionar.'} />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
          }
          contentContainerStyle={itens.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Item Form Modal */}
        <ItemForm
          visible={formVisible}
          item={editingItem}
          onClose={() => { setFormVisible(false); setEditingItem(null); }}
          onSave={handleSave}
        />

        {/* Delete Confirmation Modal */}
        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Remover Item</Text>
              <Text style={styles.modalMessage}>
                Tem certeza que deseja remover este item do registro?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                  <Text style={styles.confirmBtnText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgePendente: { backgroundColor: '#fee2e2' },
  badgeEncontrado: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  list: { paddingTop: 8, paddingBottom: 100 },
  emptyList: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 22, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
