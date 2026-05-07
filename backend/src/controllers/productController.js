const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { search, category, supplier, minPrice, maxPrice, stockStatus } = req.query;
    
    let query = {};

    // Search by Name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Supplier
    if (supplier) {
      query.supplier = supplier;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by Stock Status
    if (stockStatus === 'low') {
      query.$expr = { $lte: ['$stockLevel', '$reorderPoint'] };
    } else if (stockStatus === 'healthy') {
      query.$expr = { $gt: ['$stockLevel', '$reorderPoint'] };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');
      
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      supplier,
      price,
      stockLevel,
      reorderPoint,
    } = req.body;

    // Cloudinary returns secure_url for the image URL
    const images = req.files ? req.files.map((file) => file.secure_url || file.url || file.path).filter(Boolean) : [];

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      supplier,
      price,
      stockLevel,
      reorderPoint,
      images,
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `Created Product: ${name} (SKU: ${sku})`,
      entityId: product._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.sku = req.body.sku || product.sku;
      product.description = req.body.description || product.description;
      product.category = req.body.category || product.category;
      product.supplier = req.body.supplier || product.supplier;
      product.price = req.body.price || product.price;
      product.stockLevel = req.body.stockLevel || product.stockLevel;
      product.reorderPoint = req.body.reorderPoint || product.reorderPoint;
      
      if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary
        for (const imageUrl of product.images) {
          const publicId = imageUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
          try { await cloudinary.uploader.destroy(`ai-smart-inventory/products/${publicId}`); } catch(e) {}
        }
        product.images = req.files.map((file) => file.secure_url || file.url || file.path).filter(Boolean);
      }

      const updatedProduct = await product.save();

      await ActivityLog.create({
        user: req.user._id,
        action: `Updated Product: ${product.name}`,
        entityId: product._id,
      });

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const name = product.name;
      const sku = product.sku;
      // Delete images from Cloudinary on product delete
      for (const imageUrl of product.images) {
        try {
          const publicId = imageUrl.split('/upload/')[1]?.replace(/\.[^.]+$/, '');
          if (publicId) await cloudinary.uploader.destroy(publicId);
        } catch (e) { console.error('Cloudinary delete error:', e.message); }
      }
      await product.deleteOne();

      await ActivityLog.create({
        user: req.user._id,
        action: `Deleted Product: ${name} (SKU: ${sku})`,
      });

      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
