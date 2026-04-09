const express = require('express');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, createSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, admin, deleteSupplier);

module.exports = router;
