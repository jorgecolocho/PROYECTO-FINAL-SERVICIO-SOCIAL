const inscripcionesService = require('../services/inscripcionesService');

async function getAll(req, res) {
  try {
    const rows = await inscripcionesService.getAll(req.user);
    res.json(rows);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error al obtener inscripciones' });
  }
}

async function inscribir(req, res) {
  if (req.user.rol !== 'estudiante')
    return res.status(403).json({ error: 'Solo estudiantes pueden inscribirse' });

  const { id_oferta } = req.body;
  if (!id_oferta) return res.status(400).json({ error: 'id_oferta requerido' });

  try {
    await inscripcionesService.inscribir(req.user.id, id_oferta);
    res.status(201).json({ mensaje: 'Inscripción realizada exitosamente' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error al inscribirse' });
  }
}

async function cambiarEstado(req, res) {
  try {
    await inscripcionesService.cambiarEstado(req.params.id, req.body.estado);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' });
  }
}

module.exports = { getAll, inscribir, cambiarEstado };
