import { Request, Response } from 'express';
import { OrderModel } from '../models/Order.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;

    const count = await OrderModel.countDocuments();
    const orderIndex = 1000 + count + 1;

    const orderNumber = orderData.orderNumber || `GRE-${orderData.mode === 'B2B' ? 'B2B' : 'D2C'}-2026-${orderIndex}`;
    const invoiceNumber = orderData.invoiceNumber || `GRE-INV-2026-${orderIndex}`;
    const orderId = orderData.id || `ord-${Date.now()}`;
    const date = orderData.date || new Date().toISOString().split('T')[0];

    // Compute GST breakdown if not present
    // Seller is in Uttar Pradesh (State Code '09')
    const buyerState = orderData.shippingAddress?.state || 'Uttar Pradesh';
    const isInterstate = !buyerState.toLowerCase().includes('uttar pradesh') && buyerState !== 'UP';
    const totalTax = orderData.taxAmount || 0;

    const taxBreakdown = orderData.taxBreakdown || {
      cgst: isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100,
      sgst: isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100,
      igst: isInterstate ? totalTax : 0,
    };

    const newOrder = await OrderModel.create({
      ...orderData,
      id: orderId,
      orderNumber,
      invoiceNumber,
      date,
      taxBreakdown,
      status: orderData.status || 'Confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, mode, status } = req.query;
    let query: any = {};

    if (customerId) query.customerId = customerId;
    if (mode) query.mode = mode;
    if (status) query.status = status;

    const orders = await OrderModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findOne({
      $or: [{ id }, { orderNumber: id }, { invoiceNumber: id }],
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, paymentStatus } = req.body;

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updated = await OrderModel.findOneAndUpdate({ id }, updateFields, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
