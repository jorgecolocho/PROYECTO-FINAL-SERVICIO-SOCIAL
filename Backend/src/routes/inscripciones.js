const router = require('express').Router();
const inscripcionesController = require('../controllers/inscripcionesController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

// GET /api/inscripciones
router.get('/',                authMiddleware,            inscripcionesController.getAll);

// POST /api/inscripciones
router.post('/',               authMiddleware,            inscripcionesController.inscribir);

// PATCH /api/inscripciones/:id/estado
router.patch('/:id/estado',    authMiddleware, adminOnly, inscripcionesController.cambiarEstado);

module.exports = router;
