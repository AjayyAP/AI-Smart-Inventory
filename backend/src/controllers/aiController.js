const {
  generateDescriptionService,
  getReorderSuggestionsService,
  processChatQueryService,
} = require('../services/aiService');
const Product = require('../models/Product');

// @desc    Generate Product Description
// @route   POST /api/ai/generate-description
// @access  Private
exports.generateDescription = async (req, res) => {
  try {
    const { productName, categoryName, tags } = req.body;
    const description = await generateDescriptionService(
      productName,
      categoryName,
      tags
    );
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Smart Reorder Recommendations
// @route   GET /api/ai/smart-reorder
// @access  Private
exports.smartReorder = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stockLevel', '$reorderPoint'] },
    }).select('name sku stockLevel reorderPoint price');

    const recommendation = await getReorderSuggestionsService(products);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process Chat Assistant Query
// @route   POST /api/ai/chat
// @access  Private
exports.chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Rich context gathering for the AI
    const products = await Product.find({}).select('name stockLevel reorderPoint sku').populate('category', 'name');
    const lowStockItems = products.filter(p => p.stockLevel <= p.reorderPoint);
    
    const contextData = {
      totalProducts: products.length,
      lowStockCount: lowStockItems.length,
      lowStockList: lowStockItems.map(p => ({ name: p.name, stock: p.stockLevel })),
      recentInventoryStatus: `The system has ${products.length} total products. ${lowStockItems.length} items are currently at or below reorder levels.`
    };

    const reply = await processChatQueryService(message, contextData);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
