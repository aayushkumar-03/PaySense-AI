import pool from './pool';

export async function getUserByFirebaseUid(firebaseUid: string) {
  const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
  return result.rows[0];
}
