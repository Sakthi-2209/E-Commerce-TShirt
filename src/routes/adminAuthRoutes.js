const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getDashboardStats,
} = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/refresh', refreshAdminToken);
router.post('/logout', protectAdmin, logoutAdmin);
router.get('/stats', protectAdmin, getDashboardStats);

module.exports = router;
