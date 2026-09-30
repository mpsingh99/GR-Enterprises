import { QuoteModel } from '../models/Quote.js';
export const createQuote = async (req, res) => {
    try {
        const quoteData = req.body;
        const count = await QuoteModel.countDocuments();
        const quoteNumber = `GRE-RFQ-2026-${1000 + count + 1}`;
        const id = quoteData.id || `quote-${Date.now()}`;
        const date = quoteData.date || new Date().toISOString().split('T')[0];
        const quote = await QuoteModel.create({
            ...quoteData,
            id,
            quoteNumber,
            date,
            status: 'Submitted',
        });
        res.status(201).json({
            success: true,
            message: 'RFQ Quote request submitted to Meerut commercial team',
            data: quote,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getQuotes = async (req, res) => {
    try {
        const { businessId } = req.query;
        let query = {};
        if (businessId)
            query.businessId = businessId;
        const quotes = await QuoteModel.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: quotes.length, data: quotes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, offeredPricePerUnit, adminResponseNote, validUntil } = req.body;
        const updateFields = {};
        if (status)
            updateFields.status = status;
        if (offeredPricePerUnit !== undefined)
            updateFields.offeredPricePerUnit = offeredPricePerUnit;
        if (adminResponseNote)
            updateFields.adminResponseNote = adminResponseNote;
        if (validUntil)
            updateFields.validUntil = validUntil;
        const updated = await QuoteModel.findOneAndUpdate({ id }, updateFields, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'Quote not found' });
            return;
        }
        res.json({ success: true, message: 'Quote updated', data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
