import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Item, Aluno, getAllAlunos } from '../database/initDatabase';

interface ItemFormProps {
  visible: boolean;
  item?: Item | null;
  onClose: () => void;
  onSave: (
    nome_objeto: string,
    descricao: string,
    data_cadastro: string,
    nome_pessoa: string,
    id_aluno: number | null
  ) => void;
}

const getTodayStr = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const ItemForm: React.FC<ItemFormProps> = ({ visible, item, onClose, onSave }) => {
  const [nomeObjeto, setNomeObjeto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataCadastro, setDataCadastro] = useState(getTodayStr());
  const [nomePessoa, setNomePessoa] = useState('');
  const [idAluno, setIdAluno] = useState<number | null>(null);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    if (visible) {
      getAllAlunos().then(setAlunos);
    }
  }, [visible]);

  useEffect(() => {
    if (item) {
      setNomeObjeto(item.nome_objeto);
      setDescricao(item.descricao);
      setDataCadastro(item.data_cadastro);
      setNomePessoa(item.nome_pessoa);
      setIdAluno(item.id_aluno ?? null);
    } else {
      setNomeObjeto('');
      setDescricao('');
      setDataCadastro(getTodayStr());
      setNomePessoa('');
      setIdAluno(null);
    }
  }, [item, visible]);

  const handleSave = () => {
    if (!nomeObjeto.trim()) { Alert.alert('Campo obrigatório', 'Informe o nome do objeto.'); return; }
    if (!descricao.trim()) { Alert.alert('Campo obrigatório', 'Informe a descrição.'); return; }
    if (!dataCadastro.trim()) { Alert.alert('Campo obrigatório', 'Informe a data de cadastro.'); return; }
    if (!nomePessoa.trim()) { Alert.alert('Campo obrigatório', 'Informe quem encontrou.'); return; }
    onSave(nomeObjeto.trim(), descricao.trim(), dataCadastro.trim(), nomePessoa.trim(), idAluno);
    onClose();
  };

  const selectedAluno = alunos.find((a) => a.id === idAluno) ?? null;
  const filteredAlunos = pickerSearch.trim()
    ? alunos.filter(
        (a) =>
          a.nome.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          a.turma.toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : alunos;

  const canSave =
    nomeObjeto.trim().length > 0 &&
    descricao.trim().length > 0 &&
    dataCadastro.trim().length > 0 &&
    nomePessoa.trim().length > 0;

  return (
    <>
      {/* ── Main Form ── */}
      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.handleBar} />
              <Text style={styles.title}>
                {item ? '✏️ Editar Item' : '📦 Novo Item'}
              </Text>

              <Text style={styles.label}>Nome do Objeto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Carteira, Chave, Livro..."
                value={nomeObjeto}
                onChangeText={setNomeObjeto}
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />

              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Cor, tamanho, marca, detalhes..."
                value={descricao}
                onChangeText={setDescricao}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Data de Cadastro *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={dataCadastro}
                onChangeText={setDataCadastro}
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />

              <Text style={styles.label}>Quem Encontrou *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome de quem encontrou o item"
                value={nomePessoa}
                onChangeText={setNomePessoa}
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
                autoCapitalize="words"
              />

              <Text style={styles.label}>
                Item recuperado por:{' '}
                <Text style={styles.optional}>(opcional)</Text>
              </Text>

              {alunos.length === 0 ? (
                <View style={styles.noAlunosBox}>
                  <Text style={styles.noAlunosText}>
                    Nenhum aluno cadastrado. Acesse a aba Alunos para cadastrar.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => { setPickerSearch(''); setPickerVisible(true); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.pickerBtnInner}>
                    {selectedAluno ? (
                      <View style={styles.selectedAluno}>
                        <View style={styles.selectedAlunoInfo}>
                          <Text style={styles.selectedAlunoNome} numberOfLines={1}>
                            {selectedAluno.nome}
                          </Text>
                          <View style={styles.turmaBadge}>
                            <Text style={styles.turmaText}>{selectedAluno.turma}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.clearAluno}
                          onPress={() => setIdAluno(null)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.clearAlunoText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.pickerPlaceholder}>Selecionar aluno...</Text>
                        <Text style={styles.pickerArrow}>▼</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>{item ? 'Salvar' : 'Cadastrar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Aluno Picker ── */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Selecionar Aluno</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerSearchRow}>
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Buscar por nome ou turma..."
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
            </View>

            <FlatList
              data={filteredAlunos}
              keyExtractor={(a) => a.id.toString()}
              renderItem={({ item: a }) => {
                const isSel = a.id === idAluno;
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, isSel && styles.pickerItemSelected]}
                    onPress={() => { setIdAluno(a.id); setPickerVisible(false); }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.pickerItemNome, isSel && styles.pickerItemNomeSel]}
                      numberOfLines={1}
                    >
                      {a.nome}
                    </Text>
                    <View style={[styles.turmaBadge, isSel && styles.turmaBadgeSel]}>
                      <Text style={[styles.turmaText, isSel && styles.turmaTextSel]}>
                        {a.turma}
                      </Text>
                    </View>
                    {isSel && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.pickerEmpty}>
                  <Text style={styles.pickerEmptyText}>Nenhum aluno encontrado.</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  scrollContent: { justifyContent: 'flex-end' },
  card: {
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
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 20, textAlign: 'center' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optional: { fontWeight: '400', color: '#94a3b8', textTransform: 'none', letterSpacing: 0 },
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
  textArea: { minHeight: 76, paddingTop: 12 },

  noAlunosBox: {
    backgroundColor: '#fef9c3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  noAlunosText: { fontSize: 13, color: '#854d0e', textAlign: 'center' },

  pickerBtn: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerPlaceholder: { fontSize: 15, color: '#94a3b8', flex: 1 },
  pickerArrow: { fontSize: 12, color: '#64748b' },

  selectedAluno: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  selectedAlunoInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  selectedAlunoNome: { fontSize: 15, color: '#0f172a', fontWeight: '600', flex: 1 },
  clearAluno: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  clearAlunoText: { fontSize: 12, color: '#64748b', fontWeight: '700' },

  turmaBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  turmaBadgeSel: { backgroundColor: 'rgba(255,255,255,0.25)' },
  turmaText: { fontSize: 12, color: '#2563eb', fontWeight: '700' },
  turmaTextSel: { color: '#fff' },

  buttons: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },

  /* picker modal */
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  pickerCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  pickerClose: { fontSize: 16, color: '#64748b', fontWeight: '700', padding: 4 },
  pickerSearchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerSearchInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  pickerItemSelected: { backgroundColor: '#2563eb' },
  pickerItemNome: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '600' },
  pickerItemNomeSel: { color: '#fff' },
  pickerCheck: { fontSize: 16, color: '#fff', fontWeight: '800' },
  pickerEmpty: { padding: 32, alignItems: 'center' },
  pickerEmptyText: { color: '#94a3b8', fontSize: 15 },
});
