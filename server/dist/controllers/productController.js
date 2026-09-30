import { ProductModel } from '../models/Product.js';
export const getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        if (search && typeof search === 'string' && search.trim()) {
            const term = search.trim();
            query.$or = [
                { title: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { sku: { $regex: term, $options: 'i' } },
            ];
        }
        const products = await ProductModel.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: products.length, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getProductById = async (req, res) => {
    try {
        const idParam = String(req.params.id);
        const product = await ProductModel.findOne({ $or: [{ id: idParam }, { sku: idParam.toUpperCase() }] });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.id) {
            productData.id = `prod-${Date.now()}`;
        }
        const existing = await ProductModel.findOne({
            $or: [{ id: productData.id }, { sku: productData.sku.toUpperCase() }],
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'Product ID or SKU already exists' });
            return;
        }
        const product = await ProductModel.create(productData);
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ProductModel.findOneAndUpdate({ id }, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProductModel.findOneAndDelete({ id });
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, message: 'Product removed from catalog', id });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
