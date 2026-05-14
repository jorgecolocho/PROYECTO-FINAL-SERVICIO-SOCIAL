const pool = require('../database/connection');

async function getAll(user) {
  let sql, params = [];

  if (user.rol === 'admin') {
    sql = `
      SELECT i.*,
             u.nombre_completo AS estudiante_nombre,
             u.correo_institucional,
             o.titulo AS oferta_titulo,
             o.horas_acreditar
      FROM inscripciones i
      JOIN usuarios u ON i.id_estudiante = u.id_usuario
      JOIN ofertas  o ON i.id_oferta    = o.id_oferta
      ORDER BY i.fecha_inscripcion DESC
    `;
  } else {
    sql = `
      SELECT i.*,
             o.titulo AS oferta_titulo,
             o.horas_acreditar,
             o.ubicacion, o.horario
      FROM inscripciones i
      JOIN ofertas o ON i.id_oferta = o.id_oferta
      WHERE i.id_estudiante = ?
      ORDER BY i.fecha_inscripcion DESC
    `;
    params = [user.id];
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function inscribir(estudianteId, ofertaId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[oferta]] = await conn.query(
      'SELECT * FROM ofertas WHERE id_oferta = ? AND activo = TRUE FOR UPDATE',
      [ofertaId]
    );
    if (!oferta) throw { status: 404, message: 'Oferta no disponible' };
    if (oferta.cupo_actual >= oferta.cupo_maximo)
      throw { status: 409, message: 'Sin cupo disponible' };

    const [[existe]] = await conn.query(
      'SELECT id_inscripcion FROM inscripciones WHERE id_estudiante=? AND id_oferta=?',
      [estudianteId, ofertaId]
    );
    if (existe) throw { status: 409, message: 'Ya estás inscrito en esta oferta' };

    await conn.query(
      'INSERT INTO inscripciones (id_estudiante, id_oferta) VALUES (?,?)',
      [estudianteId, ofertaId]
    );
    await conn.query(
      'UPDATE ofertas SET cupo_actual = cupo_actual + 1 WHERE id_oferta = ?',
      [ofertaId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      throw { status: 409, message: 'Ya estás inscrito en esta oferta' };
    throw err;
  } finally {
    conn.release();
  }
}

async function cambiarEstado(id, estado) {
  const validos = ['pendiente', 'aceptado', 'finalizado'];
  if (!validos.includes(estado))
    throw { status: 400, message: 'Estado inválido' };

  await pool.query(
    'UPDATE inscripciones SET estado=? WHERE id_inscripcion=?',
    [estado, id]
  );
}

module.exports = { getAll, inscribir, cambiarEstado };
