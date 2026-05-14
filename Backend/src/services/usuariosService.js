const pool = require('../database/connection');

async function getAll() {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre_completo, u.correo_institucional,
            u.rol, u.materias_aprobadas, u.created_at,
            c.nombre_carrera, f.nombre_facultad
     FROM usuarios u
     LEFT JOIN carreras   c ON u.id_carrera  = c.id_carrera
     LEFT JOIN facultades f ON c.id_facultad = f.id_facultad
     ORDER BY u.rol, u.nombre_completo`
  );
  return rows;
}

async function getMe(userId) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre_completo, u.correo_institucional,
            u.rol, u.materias_aprobadas, u.created_at,
            c.id_carrera, c.nombre_carrera,
            f.nombre_facultad
     FROM usuarios u
     LEFT JOIN carreras   c ON u.id_carrera  = c.id_carrera
     LEFT JOIN facultades f ON c.id_facultad = f.id_facultad
     WHERE u.id_usuario = ?`,
    [userId]
  );
  if (!rows.length) throw { status: 404, message: 'Usuario no encontrado' };
  return rows[0];
}

module.exports = { getAll, getMe };
