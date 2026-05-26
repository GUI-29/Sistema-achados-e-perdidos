import * as SQLite from 'expo-sqlite';

const DB_NAME = 'achados_perdidos.db';

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export const migrateDbIfNeeded = async (): Promise<void> => {
  const db = await getDatabase();

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_objeto TEXT NOT NULL,
        descricao TEXT NOT NULL,
        data_cadastro TEXT NOT NULL,
        nome_pessoa TEXT NOT NULL,
        encontrado INTEGER NOT NULL DEFAULT 0
      );
    `);
    await db.execAsync('PRAGMA user_version = 1');
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        turma TEXT NOT NULL
      );
    `);
    await db.execAsync(`
      ALTER TABLE itens ADD COLUMN id_aluno INTEGER REFERENCES alunos(id) ON DELETE SET NULL;
    `);
    await db.execAsync('PRAGMA user_version = 2');
  }
};

/* ─────────────────────────────────────────────
   ALUNOS
───────────────────────────────────────────── */
export interface Aluno {
  id: number;
  nome: string;
  turma: string;
}

export const getAllAlunos = async (): Promise<Aluno[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Aluno>('SELECT * FROM alunos ORDER BY nome COLLATE NOCASE');
};

export const createAluno = async (nome: string, turma: string): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO alunos (nome, turma) VALUES (?, ?)',
    [nome, turma]
  );
  return result.lastInsertRowId;
};

export const updateAluno = async (id: number, nome: string, turma: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('UPDATE alunos SET nome = ?, turma = ? WHERE id = ?', [nome, turma, id]);
};

export const deleteAluno = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM alunos WHERE id = ?', [id]);
};

export const searchAlunos = async (text: string): Promise<Aluno[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Aluno>(
    'SELECT * FROM alunos WHERE nome LIKE ? OR turma LIKE ? ORDER BY nome COLLATE NOCASE',
    [`%${text}%`, `%${text}%`]
  );
};

/* ─────────────────────────────────────────────
   ITENS
───────────────────────────────────────────── */
export interface Item {
  id: number;
  nome_objeto: string;
  descricao: string;
  data_cadastro: string;
  nome_pessoa: string;
  encontrado: number;
  id_aluno: number | null;
  // join fields
  aluno_nome?: string;
  aluno_turma?: string;
}

const BASE_QUERY = `
  SELECT itens.*,
         alunos.nome  AS aluno_nome,
         alunos.turma AS aluno_turma
  FROM itens
  LEFT JOIN alunos ON itens.id_aluno = alunos.id
`;

export const getAllItens = async (): Promise<Item[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Item>(`${BASE_QUERY} ORDER BY itens.data_cadastro DESC`);
};

export const createItem = async (
  nome_objeto: string,
  descricao: string,
  data_cadastro: string,
  nome_pessoa: string,
  id_aluno: number | null
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO itens (nome_objeto, descricao, data_cadastro, nome_pessoa, encontrado, id_aluno) VALUES (?, ?, ?, ?, 0, ?)',
    [nome_objeto, descricao, data_cadastro, nome_pessoa, id_aluno]
  );
  return result.lastInsertRowId;
};

export const updateItem = async (
  id: number,
  nome_objeto: string,
  descricao: string,
  data_cadastro: string,
  nome_pessoa: string,
  id_aluno: number | null
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE itens SET nome_objeto = ?, descricao = ?, data_cadastro = ?, nome_pessoa = ?, id_aluno = ? WHERE id = ?',
    [nome_objeto, descricao, data_cadastro, nome_pessoa, id_aluno, id]
  );
};

export const marcarEncontrado = async (id: number, encontrado: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('UPDATE itens SET encontrado = ? WHERE id = ?', [encontrado, id]);
};

export const deleteItem = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM itens WHERE id = ?', [id]);
};

export const searchItens = async (
  nomeObjeto: string,
  descricao: string,
  nomePessoa: string,
  dataCadastro: string,
  nomeAluno: string,
  turmaAluno: string
): Promise<Item[]> => {
  const db = await getDatabase();

  const conditions: string[] = [];
  const params: string[] = [];

  if (nomeObjeto.trim()) {
    conditions.push('itens.nome_objeto LIKE ?');
    params.push(`%${nomeObjeto.trim()}%`);
  }
  if (descricao.trim()) {
    conditions.push('itens.descricao LIKE ?');
    params.push(`%${descricao.trim()}%`);
  }
  if (nomePessoa.trim()) {
    conditions.push('itens.nome_pessoa LIKE ?');
    params.push(`%${nomePessoa.trim()}%`);
  }
  if (dataCadastro.trim()) {
    conditions.push('itens.data_cadastro LIKE ?');
    params.push(`%${dataCadastro.trim()}%`);
  }
  if (nomeAluno.trim()) {
    conditions.push('alunos.nome LIKE ?');
    params.push(`%${nomeAluno.trim()}%`);
  }
  if (turmaAluno.trim()) {
    conditions.push('alunos.turma LIKE ?');
    params.push(`%${turmaAluno.trim()}%`);
  }

  if (conditions.length === 0) {
    return await getAllItens();
  }

  const whereClause = conditions.join(' AND ');
  return await db.getAllAsync<Item>(
    `${BASE_QUERY} WHERE ${whereClause} ORDER BY itens.data_cadastro DESC`,
    params
  );
};
