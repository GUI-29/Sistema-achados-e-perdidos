import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, FlatList, Alert } from 'react-native';
import { Nota, Aluno, getAllAlunos } from '../database/initDatabase';

interface NotaFormProps {
  visible: boolean;
  nota?: Nota | null;
  onClose: () => void;
  onSave: (n1: number, n2: number, id_aluno: number) => void;
  onLoadAlunos: () => Promise<Aluno[]>;
}

export const NotaForm: React.FC<NotaFormProps> = ({ visible, nota, onClose, onSave, onLoadAlunos }) => {
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const [id_aluno, setIdAluno] = useState<number | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadAlunos();
  }, [onLoadAlunos]);

  useEffect(() => {
    if (visible) {
      loadAlunos();
    }
  }, [visible, onLoadAlunos]);

  useEffect(() => {
    if (nota) {
      setN1(nota.n1?.toString() ?? '');
      setN2(nota.n2?.toString() ?? '');
      setIdAluno(nota.id_aluno);
    } else {
      setN1('');
      setN2('');
      setIdAluno(null);
    }
  }, [nota, visible]);

  const loadAlunos = async () => {
    if (onLoadAlunos) {
      const data = await onLoadAlunos();
      setAlunos(data);
    }
  };

  const handleSave = () => {
    const n1Num = parseFloat(n1);
    const n2Num = parseFloat(n2);
    if (n1 !== '' && (n1Num < 0 || n1Num > 10)) {
      Alert.alert('Erro', 'N1 deve estar entre 0 e 10');
      return;
    }
    if (n2 !== '' && (n2Num < 0 || n2Num > 10)) {
      Alert.alert('Erro', 'N2 deve estar entre 0 e 10');
      return;
    }
    if (!isNaN(n1Num) && !isNaN(n2Num) && id_aluno !== null) {
      onSave(n1Num, n2Num, id_aluno);
      onClose();
    }
  };

  const isNotaValida = (valor: string) => {
    if (valor === '') return true;
    const num = parseFloat(valor);
    return num >= 0 && num <= 10;
  };

  const calcularMedia = () => {
    const n1Num = parseFloat(n1);
    const n2Num = parseFloat(n2);
    if (!isNaN(n1Num) && !isNaN(n2Num)) {
      return ((n1Num + n2Num) / 2).toFixed(1);
    }
    return '-';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.title}>{nota ? 'Editar Nota' : 'Nova Nota'}</Text>
            
            <Text style={styles.label}>Selecione o Aluno</Text>
            {alunos.length === 0 ? (
              <Text style={styles.noAlunos}>Nenhum aluno cadastrado. Cadastre alunos primeiro na aba Alunos.</Text>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.selectButton} 
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={[styles.selectText, !id_aluno && styles.selectPlaceholder]}>
                    {alunos.find(a => a.id === id_aluno)?.nome || 'Selecione um aluno...'}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>

                <Modal visible={showPicker} transparent animationType="fade">
                  <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerTitle}>Selecionar Aluno</Text>
                      <FlatList
                        data={alunos}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[styles.pickerItem, id_aluno === item.id && styles.pickerItemSelected]}
                            onPress={() => {
                              setIdAluno(item.id);
                              setShowPicker(false);
                            }}
                          >
                            <Text style={[styles.pickerItemText, id_aluno === item.id && styles.pickerItemTextSelected]}>
                              {item.nome}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            )}

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>N1 (0-10)</Text>
                <TextInput
                  style={[styles.input, n1 !== '' && !isNotaValida(n1) && styles.inputError]}
                  placeholder="0.0"
                  value={n1}
                  onChangeText={setN1}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>N2 (0-10)</Text>
                <TextInput
                  style={[styles.input, n2 !== '' && !isNotaValida(n2) && styles.inputError]}
                  placeholder="0.0"
                  value={n2}
                  onChangeText={setN2}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.mediaContainer}>
              <Text style={styles.mediaLabel}>Média</Text>
              <Text style={styles.mediaValue}>{calcularMedia()}</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, (!id_aluno || !n1 || !n2) && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={!id_aluno || !n1 || !n2}
              >
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noAlunos: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginBottom: 16,
  },
  alunosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  alunoItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alunoSelected: {
    backgroundColor: '#6c3ce0',
    borderColor: '#6c3ce0',
  },
  alunoText: {
    fontSize: 14,
    color: '#666',
  },
  alunoTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f6ff',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0edff',
    borderRadius: 12,
  },
  mediaLabel: {
    fontSize: 16,
    color: '#666',
  },
  mediaValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6c3ce0',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6c3ce0',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#f8f6ff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a2e',
  },
  selectPlaceholder: {
    color: '#999',
  },
  selectArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f6ff',
  },
  pickerItemSelected: {
    backgroundColor: '#6c3ce0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1a1a2e',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});