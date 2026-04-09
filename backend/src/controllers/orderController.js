const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderNumber, supplier, items, totalAmount } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderNumber,
      user: req.user._id,
      supplier,
      items,
      totalAmount,
    });

    const createdOrder = await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: `Created Order: ${orderNumber}`,
      entityId: createdOrder._id,
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { orderNumber, status, supplier, startDate, endDate } = req.query;
    let query = {};

    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (supplier) {
      query.supplier = supplier;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('supplier', 'name')
      .populate('items.product', 'name sku price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('supplier', 'name')
      .populate('items.product', 'name sku price');
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderNumber, supplier, items, totalAmount } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderNumber,
      user: req.user._id,
      supplier,
      items,
      totalAmount,
    });

    const createdOrder = await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: `Created Order: ${orderNumber}`,
      entityId: createdOrder._id,
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();

      await ActivityLog.create({
        user: req.user._id,
        action: `Updated Order Status: ${order.orderNumber} to ${order.status}`,
        entityId: updatedOrder._id,
      });

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const orderNumber = order.orderNumber;
      await order.deleteOne();
      
      await ActivityLog.create({
        user: req.user._id,
        action: `Deleted Order: ${orderNumber}`,
      });
      
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
