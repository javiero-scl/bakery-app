const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// GET /api/roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ created_at: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roles
router.post('/', async (req, res) => {
  try {
    const role = new Role({ rol_name: req.body.rol_name });
    const newRole = await role.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/roles/:id
router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { rol_name: req.body.rol_name },
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/roles/:id
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json({ message: 'Rol eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
