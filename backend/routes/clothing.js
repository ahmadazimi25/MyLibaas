const express = require('express');
const ClothingItem = require('../models/ClothingItem');
const User = require('../models/User');

const router = express.Router();

// Create a new clothing item
router.post('/', async (req, res) => {
  try {
    const { owner, title, description, size, occasion, price, imageUrl } = req.body;
    if (!owner || !title || !price) {
      return res.status(400).json({ message: 'Owner, title, and price are required.' });
    }
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: 'Owner not found.' });
    }
    const clothingItem = new ClothingItem({
      owner,
      title,
      description,
      size,
      occasion,
      price,
      imageUrl
    });
    await clothingItem.save();
    res.status(201).json({ message: 'Clothing item created!', item: clothingItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all clothing items with search and filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      size,
      occasion,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Size filter
    if (size) {
      query.size = size;
    }

    // Occasion filter
    if (occasion) {
      query.occasion = occasion;
    }

    // Build sort options
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      ClothingItem.find(query)
        .populate('owner', 'username email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ClothingItem.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasMore,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get a single clothing item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id).populate('owner', 'username email');
    if (!item) {
      return res.status(404).json({ message: 'Clothing item not found.' });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
