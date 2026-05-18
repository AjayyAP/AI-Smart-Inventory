const Supplier = require('../models/Supplier');
const { badRequest, isBlank, isValidEmail, isValidPhone } = require('../utils/validators');

const validateSupplier = ({ name, contactEmail, contactPhone, address }, partial = false) => {
  if ((!partial || name !== undefined) && isBlank(name)) throw badRequest('Supplier name is required');
  if ((!partial || contactEmail !== undefined) && !isValidEmail(contactEmail)) throw badRequest('Please enter a valid supplier email');
  if ((!partial || contactPhone !== undefined) && !isValidPhone(contactPhone)) throw badRequest('Please enter a valid supplier phone number');
  if ((!partial || address !== undefined) && isBlank(address)) throw badRequest('Supplier address is required');
};

const sendError = (res, error) => {
  res.status(error.statusCode || 500).json({ message: error.message });
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } }
      ];
    }
    const suppliers = await Supplier.find(query);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, address } = req.body;
    validateSupplier({ name, contactEmail, contactPhone, address });

    const supplier = await Supplier.create({
      name,
      contactEmail,
      contactPhone,
      address,
    });
    res.status(201).json(supplier);
  } catch (error) {
    sendError(res, error);
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, address } = req.body;
    validateSupplier({ name, contactEmail, contactPhone, address }, true);

    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      supplier.name = name || supplier.name;
      supplier.contactEmail = contactEmail || supplier.contactEmail;
      supplier.contactPhone = contactPhone || supplier.contactPhone;
      supplier.address = address || supplier.address;
      
      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    sendError(res, error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
