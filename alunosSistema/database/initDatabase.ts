import * as SQLite from 'expo-sqlite';

const DB_NAME = 'alunos.db';

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
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        celular TEXT NOT NULL
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        n1 REAL,
        n2 REAL,
        media REAL,
        id_aluno INTEGER NOT NULL,
        FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON DELETE CASCADE
      );
    `);
    
    await db.execAsync('PRAGMA user_version = 1');
  }
};

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  celular: string;
}

export interface Nota {
  id: number;
  n1: number | null;
  n2: number | null;
  media: number | null;
  id_aluno: number;
  nome_aluno?: string;
}

export const getAllAlunos = async (): Promise<Aluno[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Aluno>('SELECT * FROM alunos ORDER BY nome');
};

export const getAlunoById = async (id: number): Promise<Aluno | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync<Aluno>('SELECT * FROM alunos WHERE id = ?', id);
};

export const createAluno = async (nome: string, email: string, celular: string): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO alunos (nome, email, celular) VALUES (?, ?, ?)',
    [nome, email, celular]
  );
  return result.lastInsertRowId;
};

export const updateAluno = async (id: number, nome: string, email: string, celular: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE alunos SET nome = ?, email = ?, celular = ? WHERE id = ?',
    [nome, email, celular, id]
  );
};

export const deleteAluno = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM alunos WHERE id = ?', [id]);
};

export const searchAlunos = async (searchText: string): Promise<Aluno[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Aluno>(
    'SELECT * FROM alunos WHERE nome LIKE ? ORDER BY nome',
    [`%${searchText}%`]
  );
};

export const getAllNotas = async (): Promise<Nota[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Nota>(`
    SELECT notas.*, alunos.nome as nome_aluno 
    FROM notas 
    LEFT JOIN alunos ON notas.id_aluno = alunos.id 
    ORDER BY alunos.nome
  `);
};

export const getNotaById = async (id: number): Promise<Nota | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync<Nota>(`
    SELECT notas.*, alunos.nome as nome_aluno 
    FROM notas 
    LEFT JOIN alunos ON notas.id_aluno = alunos.id 
    WHERE notas.id = ?
  `, id);
};

export const createNota = async (n1: number, n2: number, id_aluno: number): Promise<number> => {
  const media = (n1 + n2) / 2;
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO notas (n1, n2, media, id_aluno) VALUES (?, ?, ?, ?)',
    [n1, n2, media, id_aluno]
  );
  return result.lastInsertRowId;
};

export const updateNota = async (id: number, n1: number, n2: number, id_aluno: number): Promise<void> => {
  const media = (n1 + n2) / 2;
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE notas SET n1 = ?, n2 = ?, media = ?, id_aluno = ? WHERE id = ?',
    [n1, n2, media, id_aluno, id]
  );
};

export const deleteNota = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notas WHERE id = ?', [id]);
};