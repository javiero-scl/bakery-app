const express = require('express');
const router = express.Router();
const UserRole = require('../models/UserRole');

const toFrontend = (ur) => {
  const obj = ur.toObject ? ur.toObject() : ur;
  obj.user_name = obj.user_id?.user_name || '';
  obj.rol_name = obj.role_id?.rol_name || '';
  return obj;
};

// GET /api/user-roles
router.get('/', async (req, res) => {
  try {
    const userRoles = await UserRole.find()
      .populate('user_id', 'user_name')
      .populate('role_id', 'rol_name')
      .sort({ created_at: -1 });
    res.json(userRoles.map(toFrontend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user-roles
router.post('/', async (req, res) => {
  try {
    const userRole = new UserRole({
      user_id: req.body.user_id,
      role_id: req.body.role_id,
    });
    const saved = await userRole.save();
    const populated = await UserRole.findById(saved._id)
      .populate('user_id', 'user_name')
      .populate('role_id', 'rol_name');
    res.status(201).json(toFrontend(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/user-roles/:id
router.delete('/:id', async (req, res) => {
  try {
    const userRole = await UserRole.findByIdAndDelete(req.params.id);
    if (!userRole) return res.status(404).json({ message: 'Asignación no encontrada' });
    res.json({ message: 'Asignación eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
