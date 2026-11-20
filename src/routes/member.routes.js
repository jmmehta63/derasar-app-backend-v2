const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { validateMember } = require('../validators/member.validator');
const { cacheResponse, invalidateCache } = require('../middleware/responseCache');

const cacheMembers = cacheResponse('members');
const invalidateMembers = invalidateCache('members');

// GET all members
router.get('/', cacheMembers, memberController.getAllMembers);

// GET single member by ID
router.get('/:id', cacheMembers, memberController.getMemberById);

// POST create new member
router.post('/', validateMember, invalidateMembers, memberController.createMember);

// PUT update member
router.put('/:id', validateMember, invalidateMembers, memberController.updateMember);

// DELETE member
router.delete('/:id', invalidateMembers, memberController.deleteMember);

// GET members by family name
router.get('/family/:familyName', cacheMembers, memberController.getMembersByFamily);

module.exports = router;
