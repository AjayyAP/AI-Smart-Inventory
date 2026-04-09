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

    // Calculate total order value
    const ordersValue = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    // Fetch 5 most recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('supplier', 'name')
      .populate('user', 'name');

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stockLevel', '$reorderPoint'] },
    }).countDocuments();

    res.json({
      totalProducts,
      totalSuppliers,
      totalOrders,
      totalRevenue: ordersValue[0] ? ordersValue[0].total : 0,
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
