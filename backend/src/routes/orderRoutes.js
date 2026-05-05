const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id', protect, updateOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
