const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// @desc    Get dashboard metrics aggregation
// @route   GET /api/analytics/dashboard-summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Revenue is cash received, not the full invoice amount.
    const ordersValue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);
    const pendingValue = await Order.aggregate([
      { $match: { balanceAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } },
    ]);
    // Fetch 5 most recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('supplier', 'name')
      .populate('user', 'name');

    const pendingPayments = await Order.find({ balanceAmount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount paidAmount balanceAmount supplier createdAt')
      .populate('supplier', 'name');

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stockLevel', '$reorderPoint'] },
    }).countDocuments();

    res.json({
      totalProducts,
      totalSuppliers,
      totalOrders,
      totalRevenue: ordersValue[0] ? ordersValue[0].total : 0,
      totalPendingAmount: pendingValue[0] ? pendingValue[0].total : 0,
      recentOrders,
      pendingPayments,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
