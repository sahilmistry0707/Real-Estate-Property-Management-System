const Property = require('../models/Property');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all public properties with search, filtering, sorting, pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      purpose,
      type,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      status,
      search,
      featured,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { approvalStatus: 'Approved' };

    // Purpose filter (Buy / Rent)
    if (purpose && (purpose === 'Buy' || purpose === 'Rent')) {
      query.purpose = purpose;
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // City filter
    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms && bedrooms !== 'All') {
      const beds = Number(bedrooms);
      if (!isNaN(beds)) {
        if (beds >= 5) {
          query.bedrooms = { $gte: 5 };
        } else {
          query.bedrooms = beds;
        }
      }
    }

    // Bathrooms filter
    if (bathrooms && bathrooms !== 'All') {
      const baths = Number(bathrooms);
      if (!isNaN(baths)) {
        query.bathrooms = { $gte: baths };
      }
    }

    // Furnishing filter
    if (furnishing && furnishing !== 'All') {
      query.furnishing = furnishing;
    }

    // Status filter (Default is usually Available, but allow All or specific)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Search query (across title, description, address, city)
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { city: { $regex: s, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('agent', 'fullName email phone avatar agencyName')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'agent',
      'fullName email phone avatar agencyName bio createdAt'
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // If property is pending or rejected, only admin or the property owner can see it
    if (property.approvalStatus !== 'Approved') {
      if (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== property.agent._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'This property listing is pending administrative approval.',
        });
      }
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Agent, Admin)
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      purpose,
      price,
      area,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      imageUrlList,
      featured,
    } = req.body;

    // Collect uploaded image paths
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        uploadedImages.push(`/uploads/${file.filename}`);
      });
    }

    // Handle extra imageUrls if provided (from URL list string or array)
    let extraImages = [];
    if (imageUrlList) {
      try {
        extraImages = Array.isArray(imageUrlList) ? imageUrlList : JSON.parse(imageUrlList);
      } catch {
        extraImages = imageUrlList.split(',').map((u) => u.trim());
      }
    }

    const allImages = [...uploadedImages, ...extraImages].filter(Boolean);

    // Parse amenities if sent as stringified JSON or comma-separated
    let parsedAmenities = [];
    if (amenities) {
      try {
        parsedAmenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
      } catch {
        parsedAmenities = typeof amenities === 'string' ? amenities.split(',').map((a) => a.trim()) : [];
      }
    }

    // Default approval status:
    // If Admin creates it, it can be immediately Approved.
    // If Agent creates it, it must be Pending!
    const approvalStatus = req.user.role === 'admin' ? 'Approved' : 'Pending';

    const property = await Property.create({
      title,
      description,
      type,
      purpose,
      price: Number(price),
      area: Number(area),
      bedrooms: Number(bedrooms || 0),
      bathrooms: Number(bathrooms || 0),
      furnishing: furnishing || 'Semi-Furnished',
      amenities: parsedAmenities,
      images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      address,
      city,
      state: state || 'Gujarat',
      pincode,
      latitude: Number(latitude || 23.0225),
      longitude: Number(longitude || 72.5714),
      agent: req.user._id,
      status: 'Available',
      approvalStatus,
      featured: featured === 'true' || featured === true,
    });

    // Notify admins about new pending property submission
    if (approvalStatus === 'Pending') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          title: 'New Property Listing Pending Approval',
          message: `Agent ${req.user.fullName} submitted "${property.title}" in ${property.city} for approval.`,
          type: 'system',
          link: `/admin/properties`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message:
        approvalStatus === 'Approved'
          ? 'Property created and published successfully!'
          : 'Property submitted successfully! It is now pending administrative approval.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent who owns it, Admin)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Role check: Admin or the owner agent
    if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property.',
      });
    }

    // Uploaded images
    let updatedImages = [...property.images];
    if (req.files && req.files.length > 0) {
      const newUploads = req.files.map((file) => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newUploads];
    }

    if (req.body.existingImages) {
      try {
        const retained = JSON.parse(req.body.existingImages);
        if (Array.isArray(retained)) {
          updatedImages = retained;
          if (req.files && req.files.length > 0) {
            req.files.forEach((file) => updatedImages.push(`/uploads/${file.filename}`));
          }
        }
      } catch {
        // ignore
      }
    }

    // Parse amenities
    let parsedAmenities = property.amenities;
    if (req.body.amenities) {
      try {
        parsedAmenities = Array.isArray(req.body.amenities) ? req.body.amenities : JSON.parse(req.body.amenities);
      } catch {
        parsedAmenities = typeof req.body.amenities === 'string' ? req.body.amenities.split(',').map((a) => a.trim()) : property.amenities;
      }
    }

    const updates = { ...req.body };
    delete updates.approvalStatus; // Agents cannot manually approve via update!
    if (req.user.role === 'admin' && req.body.approvalStatus) {
      updates.approvalStatus = req.body.approvalStatus;
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.area) updates.area = Number(updates.area);
    if (updates.bedrooms !== undefined) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined) updates.bathrooms = Number(updates.bathrooms);
    if (updates.latitude !== undefined) updates.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) updates.longitude = Number(updates.longitude);
    updates.amenities = parsedAmenities;
    updates.images = updatedImages;

    property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner Agent, Admin)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property.',
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent's own properties
// @route   GET /api/properties/agent/my-properties
// @access  Private (Agent)
const getMyProperties = async (req, res, next) => {
  try {
    const { status, approvalStatus, search } = req.query;
    const query = { agent: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (approvalStatus && approvalStatus !== 'All') query.approvalStatus = approvalStatus;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    const counts = {
      total: properties.length,
      approved: properties.filter((p) => p.approvalStatus === 'Approved').length,
      pending: properties.filter((p) => p.approvalStatus === 'Pending').length,
      rejected: properties.filter((p) => p.approvalStatus === 'Rejected').length,
      available: properties.filter((p) => p.status === 'Available').length,
      sold: properties.filter((p) => p.status === 'Sold').length,
      rented: properties.filter((p) => p.status === 'Rented').length,
    };

    res.status(200).json({
      success: true,
      counts,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property listing status (Available, Sold, Rented)
// @route   PATCH /api/properties/:id/status
// @access  Private (Agent, Admin)
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Sold', 'Rented'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    property.status = status;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property status updated to ${status}`,
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all map properties (lightweight list with coords for Map View)
// @route   GET /api/properties/map/all
// @access  Public
const getMapProperties = async (req, res, next) => {
  try {
    const { purpose, type, city } = req.query;
    const query = { approvalStatus: 'Approved' };

    if (purpose && purpose !== 'All') query.purpose = purpose;
    if (type && type !== 'All') query.type = type;
    if (city && city.trim() !== '') query.city = { $regex: new RegExp(city.trim(), 'i') };

    const properties = await Property.find(query).select(
      'title price purpose type bedrooms bathrooms area address city latitude longitude images status'
    );

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updatePropertyStatus,
  getMapProperties,
};
