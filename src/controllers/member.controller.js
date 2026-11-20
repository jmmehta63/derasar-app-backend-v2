const Member = require('../models/Member.model');

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const { search, city, state, isActive, page = 1, limit = 100 } = req.query;
    
    const query = { isDeleted: { $ne: true } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city) query.city = city;
    if (state) query.state = state;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const members = await Member.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const count = await Member.countDocuments(query);
    
    res.status(200).json({
      members,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new member
exports.createMember = async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    
    res.status(201).json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Member already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.updatedBy || 'Admin' },
      { new: true, runValidators: true }
    );
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, updatedBy: req.body?.updatedBy || 'Admin' },
      { new: true }
    );
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get members by family name
exports.getMembersByFamily = async (req, res) => {
  try {
    const members = await Member.find({ 
      name: { $regex: req.params.familyName, $options: 'i' },
      isDeleted: { $ne: true }
    }).sort({ name: 1 });
    
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
