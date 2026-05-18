const Order = require('../models/Order');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const { badRequest, isBlank } = require('../utils/validators');

const calculatePayment = (totalAmount, paidAmount = 0) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount) || 0;
  const balance = Math.max(total - paid, 0);
  const paymentStatus = paid <= 0 ? 'Pending' : balance > 0 ? 'Partial' : 'Paid';

  return { paidAmount: paid, balanceAmount: balance, paymentStatus };
};

const updateProductStock = async (items, direction) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw badRequest('Product not found while updating stock');
    }

    const quantity = Number(item.quantity) || 0;
    if (direction === 'deduct') {
      if (product.stockLevel < quantity) {
        throw badRequest(`Insufficient stock for ${product.name}`);
      }
      product.stockLevel -= quantity;
    } else {
      product.stockLevel += quantity;
    }

    await product.save();
  }
};

const getProductId = (item) => item.product?._id?.toString() || item.product?.toString();

const getQuantityByProduct = (items = []) =>
  items.reduce((quantities, item) => {
    const productId = getProductId(item);
    if (!productId) return quantities;

    quantities[productId] = (quantities[productId] || 0) + (Number(item.quantity) || 0);
    return quantities;
  }, {});

const validateOrderItemsStock = async (items, existingOrder = null) => {
  const requestedByProduct = getQuantityByProduct(items);
  const productIds = Object.keys(requestedByProduct);

  const products = await Product.find({ _id: { $in: productIds } });
  const existingByProduct = existingOrder?.stockDeducted ? getQuantityByProduct(existingOrder.items) : {};

  for (const productId of productIds) {
    const product = products.find((item) => item._id.toString() === productId);
    if (!product) {
      throw badRequest('Product not found while validating stock');
    }

    const availableStock = product.stockLevel + (existingByProduct[productId] || 0);
    if (requestedByProduct[productId] > availableStock) {
      throw badRequest(
        `Insufficient stock for ${product.name}. Available: ${availableStock}, requested: ${requestedByProduct[productId]}`
      );
    }
  }
};

const validateOrderPayload = ({ supplier, items, totalAmount, paidAmount }) => {
  if (isBlank(supplier)) throw badRequest('Wholesale supplier is required');
  if (!items || items.length === 0) throw badRequest('No order items');

  items.forEach((item) => {
    if (isBlank(item.product)) throw badRequest('Product is required for every order item');
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw badRequest('Quantity must be at least 1');
    }
    if (Number(item.priceAtPurchase) < 0 || Number.isNaN(Number(item.priceAtPurchase))) {
      throw badRequest('Sale price must be zero or greater');
    }
  });

  const total = Number(totalAmount);
  const paid = Number(paidAmount) || 0;
  if (Number.isNaN(total) || total < 0) throw badRequest('Total amount is invalid');
  if (paid < 0) throw badRequest('Paid amount cannot be negative');
  if (paid > total) throw badRequest('Paid amount cannot be greater than total amount');
};

const sendError = (res, error) => {
  res.status(error.statusCode || 500).json({ message: error.message });
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderNumber, supplier, items, totalAmount, paymentMethod, paidAmount, paymentDate } = req.body;

    validateOrderPayload({ supplier, items, totalAmount, paidAmount });

    await validateOrderItemsStock(items);

    const payment = calculatePayment(totalAmount, paidAmount);

    const order = new Order({
      orderNumber,
      user: req.user._id,
      supplier,
      items,
      totalAmount,
      paymentMethod,
      paidAmount: payment.paidAmount,
      balanceAmount: payment.balanceAmount,
      paymentStatus: payment.paymentStatus,
      paymentDate: payment.paidAmount > 0 ? paymentDate || new Date() : undefined,
      stockDeducted: true,
    });

    await updateProductStock(items, 'deduct');
    const createdOrder = await order.save();

    await ActivityLog.create({
      user: req.user._id,
      action: `Created Order: ${orderNumber}`,
      entityId: createdOrder._id,
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
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
    sendError(res, error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const { supplier, items, totalAmount, paymentMethod, paidAmount, paymentDate } = req.body;
    
    validateOrderPayload({ supplier, items, totalAmount, paidAmount });

    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.stockDeducted) {
        await validateOrderItemsStock(items, order);
        await updateProductStock(order.items, 'restore');
        await updateProductStock(items, 'deduct');
      } else {
        await validateOrderItemsStock(items);
      }

      order.supplier = supplier;
      order.items = items;
      order.totalAmount = totalAmount;
      if (paymentMethod) order.paymentMethod = paymentMethod;
      const payment = calculatePayment(totalAmount, paidAmount);
      order.paidAmount = payment.paidAmount;
      order.balanceAmount = payment.balanceAmount;
      order.paymentStatus = payment.paymentStatus;
      order.paymentDate = payment.paidAmount > 0 ? paymentDate || order.paymentDate || new Date() : undefined;

      const updatedOrder = await order.save();

      await ActivityLog.create({
        user: req.user._id,
        action: `Updated Order: ${order.orderNumber}`,
        entityId: updatedOrder._id,
      });

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    sendError(res, error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const nextStatus = req.body.status || order.status;

      if (nextStatus === 'Completed' && !order.stockDeducted) {
        await updateProductStock(order.items, 'deduct');
        order.stockDeducted = true;
      }

      if (nextStatus !== 'Completed' && order.stockDeducted) {
        await updateProductStock(order.items, 'restore');
        order.stockDeducted = false;
      }

      order.status = nextStatus;
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
    sendError(res, error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      if (order.stockDeducted) {
        await updateProductStock(order.items, 'restore');
      }

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
    sendError(res, error);
  }
};
