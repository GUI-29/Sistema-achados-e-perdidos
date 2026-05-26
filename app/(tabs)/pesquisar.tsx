import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
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
  searchItens,
  updateItem,
  deleteItem,
  marcarEncontrado,
} from '../../database/initDatabase';

export default function PesquisarScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchNomeObjeto, setSearchNomeObjeto] = useState('');
  const [searchDescricao, setSearchDescricao] = useState('');
  const [searchNomePessoa, setSearchNomePessoa] = useState('');
  const [searchData, setSearchData] = useState('');
  const [searchNomeAluno, setSearchNomeAluno] = useState('');
  const [searchTurmaAluno, setSearchTurmaAluno] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const handleSearch = useCallback(async () => {
    const result = await searchItens(
      searchNomeObjeto,
      searchDescricao,
      searchNomePessoa,
      searchData,
      searchNomeAluno,
      searchTurmaAluno,
    );
    setItens(result);
    setHasSearched(true);
  }, [searchNomeObjeto, searchDescricao, searchNomePessoa, searchData, searchNomeAluno, searchTurmaAluno]);

  useFocusEffect(
    useCallback(() => {
      if (hasSearched) handleSearch();
    }, [hasSearched, handleSearch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const handleClear = () => {
    setSearchNomeObjeto('');
    setSearchDescricao('');
    setSearchNomePessoa('');
    setSearchData('');
    setSearchNomeAluno('');
    setSearchTurmaAluno('');
    setItens([]);
    setHasSearched(false);
  };

  const handleEdit = (item: Item) => { setEditingItem(item); setFormVisible(true); };
  const handleDelete = (id: number) => { setIdToDelete(id); setDeleteModalVisible(true); };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      await deleteItem(idToDelete);
      await handleSearch();
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleToggleEncontrado = async (item: Item) => {
    await marcarEncontrado(item.id, item.encontrado === 1 ? 0 : 1);
    await handleSearch();
  };

  const handleSave = async (
    nome_objeto: string,
    descricao: string,
    data_cadastro: string,
    nome_pessoa: string,
    id_aluno: number | null,
  ) => {
    if (editingItem) {
      await updateItem(editingItem.id, nome_objeto, descricao, data_cadastro, nome_pessoa, id_aluno);
      await handleSearch();
    }
    setEditingItem(null);
  };

  const anyFilter =
    searchNomeObjeto.trim() ||
    searchDescricao.trim() ||
    searchNomePessoa.trim() ||
    searchData.trim() ||
    searchNomeAluno.trim() ||
    searchTurmaAluno.trim();

  const ListHeader = (
    <View style={styles.headerContent}>
      <Text style={styles.title}>🔎 Pesquisar</Text>
      <Text style={styles.subtitle}>Preencha um ou mais campos e toque em Buscar</Text>

      {/* ── Seção: Item ── */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📦</Text>
          <Text style={styles.sectionTitle}>Dados do Item</Text>
        </View>

        <Text style={styles.label}>Nome do Objeto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: carteira, chave, óculos..."
          value={searchNomeObjeto}
          onChangeText={setSearchNomeObjeto}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: preta, de couro, pequena..."
          value={searchDescricao}
          onChangeText={setSearchDescricao}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        <Text style={styles.label}>Quem Encontrou</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da pessoa que encontrou..."
          value={searchNomePessoa}
          onChangeText={setSearchNomePessoa}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        <Text style={styles.label}>Data de Cadastro</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          placeholder="Ex: 2024, 25/12, janeiro..."
          value={searchData}
          onChangeText={setSearchData}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {/* ── Seção: Aluno ── */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>👨‍🎓</Text>
          <Text style={styles.sectionTitle}>Dados do Aluno</Text>
        </View>

        <Text style={styles.label}>Nome do Aluno</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Pedro, Marcelo..."
          value={searchNomeAluno}
          onChangeText={setSearchNomeAluno}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Turma</Text>
        <TextInput
          style={[styles.input, styles.inputLast]}
          placeholder="Ex: 3ºAi, 2ºADM, 1ºA..."
          value={searchTurmaAluno}
          onChangeText={setSearchTurmaAluno}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCapitalize="characters"
        />
      </View>

      {/* ── Botões ── */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.searchBtn, !anyFilter && styles.searchBtnDisabled]}
          onPress={handleSearch}
          activeOpacity={0.85}
        >
          <Text style={styles.searchBtnText}>🔍 Buscar</Text>
        </TouchableOpacity>
        {!!anyFilter && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.85}>
            <Text style={styles.clearBtnText}>✕ Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasSearched && (
        <Text style={styles.resultCount}>
          {itens.length} resultado{itens.length !== 1 ? 's' : ''} encontrado{itens.length !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEncontrado={handleToggleEncontrado}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          hasSearched ? (
            <EmptyState message="Nenhum item encontrado para esta pesquisa." />
          ) : (
            <EmptyState message="Use os filtros acima para pesquisar itens cadastrados." />
          )
        }
        refreshControl={
          hasSearched ? (
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Form */}
      <ItemForm
        visible={formVisible}
        item={editingItem}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
      />

      {/* Delete Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Remover Item</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja remover este item?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                <Text style={styles.confirmBtnText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4ff' },

  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },

  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 14 },

  sectionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionIcon: { fontSize: 17 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a' },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  inputLast: { marginBottom: 0 },

  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  searchBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  searchBtnDisabled: { backgroundColor: '#93c5fd' },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  clearBtn: { backgroundColor: '#f1f5f9', borderRadius: 11, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  clearBtnText: { color: '#475569', fontSize: 15, fontWeight: '600' },

  resultCount: { fontSize: 13, color: '#2563eb', fontWeight: '700', marginTop: 4 },

  listContent: { paddingBottom: 40, flexGrow: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '82%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 22 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});