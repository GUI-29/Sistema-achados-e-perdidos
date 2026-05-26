import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { EmptyState } from '../../components/EmptyState';
import {
  Aluno,
  getAllAlunos,
  createAluno,
  updateAluno,
  deleteAluno,
  searchAlunos,
} from '../../database/initDatabase';

/* ─── Aluno Form Modal ─── */
interface AlunoFormProps {
  visible: boolean;
  aluno: Aluno | null;
  onClose: () => void;
  onSave: (nome: string, turma: string) => void;
}

function AlunoForm({ visible, aluno, onClose, onSave }: AlunoFormProps) {
  const [nome, setNome] = useState('');
  const [turma, setTurma] = useState('');

  React.useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setTurma(aluno.turma);
    } else {
      setNome('');
      setTurma('');
    }
  }, [aluno, visible]);

  const handleSave = () => {
    if (!nome.trim()) { Alert.alert('Campo obrigatório', 'Informe o nome do aluno.'); return; }
    if (!turma.trim()) { Alert.alert('Campo obrigatório', 'Informe a turma do aluno.'); return; }
    onSave(nome.trim(), turma.trim());
    onClose();
  };

  const canSave = nome.trim().length > 0 && turma.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formOverlay}
      >
        <View style={styles.formCard}>
          <View style={styles.handleBar} />
          <Text style={styles.formTitle}>
            {aluno ? '✏️ Editar Aluno' : '👨‍🎓 Novo Aluno'}
          </Text>

          <Text style={styles.label}>Nome do Aluno *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo..."
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#94a3b8"
            returnKeyType="next"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Turma *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 3ºAi, 2°ADM, 1°A..."
            value={turma}
            onChangeText={setTurma}
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            autoCapitalize="characters"
          />

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>{aluno ? 'Salvar' : 'Cadastrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ─── Aluno Card ─── */
interface AlunoCardProps {
  aluno: Aluno;
  onEdit: (a: Aluno) => void;
  onDelete: (id: number) => void;
}

function AlunoCard({ aluno, onEdit, onDelete }: AlunoCardProps) {
  // deterministic avatar colour from id
  const colors = ['#dbeafe', '#fce7f3', '#dcfce7', '#fef9c3', '#ede9fe', '#fee2e2', '#ffedd5'];
  const bg = colors[aluno.id % colors.length];
  const initials = aluno.nome
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardNome} numberOfLines={1}>{aluno.nome}</Text>
        <View style={styles.turmaBadge}>
          <Text style={styles.turmaText}>🏫 {aluno.turma}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => onEdit(aluno)}>
          <Text style={styles.actionEmoji}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(aluno.id)}>
          <Text style={styles.actionEmoji}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Screen ─── */
export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchText, setSearchText] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const loadAlunos = useCallback(async () => {
    const result = searchText.trim()
      ? await searchAlunos(searchText)
      : await getAllAlunos();
    setAlunos(result);
  }, [searchText]);

  useFocusEffect(useCallback(() => { loadAlunos(); }, [loadAlunos]));

  React.useEffect(() => { loadAlunos(); }, [searchText, loadAlunos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlunos();
    setRefreshing(false);
  };

  const handleSave = async (nome: string, turma: string) => {
    if (editingAluno) {
      await updateAluno(editingAluno.id, nome, turma);
    } else {
      await createAluno(nome, turma);
    }
    await loadAlunos();
    setEditingAluno(null);
  };

  const handleEdit = (a: Aluno) => { setEditingAluno(a); setFormVisible(true); };

  const handleDelete = (id: number) => { setIdToDelete(id); setDeleteModal(true); };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      await deleteAluno(idToDelete);
      await loadAlunos();
    }
    setDeleteModal(false);
    setIdToDelete(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>👨‍🎓 Alunos</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou turma..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity style={styles.clearSearch} onPress={() => setSearchText('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.countText}>
            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={alunos}
          keyExtractor={(a) => a.id.toString()}
          renderItem={({ item }) => (
            <AlunoCard aluno={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                searchText.trim()
                  ? 'Nenhum aluno encontrado para essa busca.'
                  : 'Nenhum aluno cadastrado.\nToque em + para adicionar.'
              }
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
          }
          contentContainerStyle={alunos.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Form */}
        <AlunoForm
          visible={formVisible}
          aluno={editingAluno}
          onClose={() => { setFormVisible(false); setEditingAluno(null); }}
          onSave={handleSave}
        />

        {/* Delete modal */}
        <Modal visible={deleteModal} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Remover Aluno</Text>
              <Text style={styles.modalMsg}>
                Tem certeza? O aluno será desvinculado dos itens registrados, mas os itens serão mantidos.
              </Text>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModal(false)}>
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

  /* header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 10 },
  clearSearch: { padding: 4 },
  clearSearchText: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },
  countText: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  /* list */
  list: { paddingTop: 8, paddingBottom: 100 },
  emptyList: { flex: 1 },

  /* card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  cardBody: { flex: 1, gap: 4 },
  cardNome: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  turmaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  turmaText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, flexShrink: 0 },
  actionBtn: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  editBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
  actionEmoji: { fontSize: 17 },

  /* FAB */
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

  /* overlay / modals */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '82%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  modalMsg: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 22, lineHeight: 22 },
  modalBtns: { flexDirection: 'row', gap: 12 },

  /* form */
  formOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  handleBar: {
    width: 44,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 20, textAlign: 'center' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  confirmBtn: { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
