const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', categoriesController.getCategories);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);
router.post('/reset-defaults', categoriesController.resetDefaults);

module.exports = router;
