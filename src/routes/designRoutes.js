const express = require('express');
const router = express.Router();
const { getDesigns, addDesign, deleteDesign } = require('../controllers/designController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getDesigns)
  .post(protectAdmin, addDesign);

router.route('/:id')
  .delete(protectAdmin, deleteDesign);

module.exports = router;
