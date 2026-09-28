import { Router } from 'express';
import {
  registerRetail,
  googleSync,
  login,
  registerB2B,
  getAllUsers,
  updateUserRole,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', registerRetail);
router.post('/google-sync', googleSync);
router.post('/login', login);
router.post('/b2b-register', registerB2B);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
