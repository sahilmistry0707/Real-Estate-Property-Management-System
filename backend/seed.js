const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const Booking = require('./src/models/Booking');
const Visit = require('./src/models/Visit');
const Wishlist = require('./src/models/Wishlist');
const Inquiry = require('./src/models/Inquiry');
const Notification = require('./src/models/Notification');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Purging existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Booking.deleteMany({}),
      Visit.deleteMany({}),
      Wishlist.deleteMany({}),
      Inquiry.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Inserting users...');

    // 1 Admin
    const admin = await User.create({
      fullName: 'Vikramaditya Singhania',
      email: 'admin@realestate.com',
      phone: '+91 98250 11223',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Principal Administrator & Managing Director of Real Estate PMS Platform.',
    });

    // 3 Agents
    const agentRajesh = await User.create({
      fullName: 'Rajesh Patel',
      email: 'rajesh.patel@realty.com',
      phone: '+91 98980 44556',
      password: 'Agent@123',
      role: 'agent',
      status: 'active',
      agencyName: 'Shree Sai Realty & Associates',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Specialist in luxury residential apartments and commercial properties across Ahmedabad and Gandhinagar.',
    });

    const agentPriya = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya.sharma@realty.com',
      phone: '+91 98790 33221',
      password: 'Agent@123',
      role: 'agent',
      status: 'active',
      agencyName: 'Skyline Luxury Homes',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: '12+ years experience in premium gated villas, golf estates, and rental penthouses in Gujarat.',
    });

    const agentAmit = await User.create({
      fullName: 'Amit Mehta',
      email: 'amit.mehta@realty.com',
      phone: '+91 94260 77889',
      password: 'Agent@123',
      role: 'agent',
      status: 'active',
      agencyName: 'Gujarat Prime Estates',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Commercial office spaces, high-street retail, and investment plots expert.',
    });

    // 5 Users
    const userRahul = await User.create({
      fullName: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      phone: '+91 98240 55667',
      password: 'User@123',
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      bio: 'Looking for a 3BHK flat near SG Highway or Prahlad Nagar.',
    });

    const userSneha = await User.create({
      fullName: 'Sneha Joshi',
      email: 'sneha.joshi@gmail.com',
      phone: '+91 97230 11998',
      password: 'User@123',
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Seeking rental villa or high-end apartment in Gandhinagar GIFT City.',
    });

    const userVikram = await User.create({
      fullName: 'Vikram Shah',
      email: 'vikram.shah@gmail.com',
      phone: '+91 98255 44332',
      password: 'User@123',
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      bio: 'Real estate investor looking for prime commercial plots and retail shops.',
    });

    const userAnanya = await User.create({
      fullName: 'Ananya Desai',
      email: 'ananya.desai@gmail.com',
      phone: '+91 99090 88776',
      password: 'User@123',
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'First time home buyer looking for modern 2 BHK apartment in Vadodara.',
    });

    const userKaran = await User.create({
      fullName: 'Karan Thakor',
      email: 'karan.thakor@gmail.com',
      phone: '+91 97120 66554',
      password: 'User@123',
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      bio: 'Software engineer looking for modern studio or 1 BHK apartment.',
    });

    console.log('[Seed] Users seeded successfully.');
    console.log('[Seed] Inserting realistic Gujarat properties...');

    const propertiesData = [
      {
        title: 'Shivalik Curv - Ultra Luxury 4 BHK Sky Villa',
        description: 'Exquisite 4 BHK sky villa with double-height ceiling, panoramic view of SG Highway, Italian marble flooring, VRV air conditioning, automated smart home controls, and private terrace plunge pool.',
        type: 'Villa',
        purpose: 'Buy',
        price: 34500000,
        area: 4200,
        bedrooms: 4,
        bathrooms: 5,
        furnishing: 'Furnished',
        amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Clubhouse', 'Power Backup', 'Elevator', 'Garden', 'Balcony', 'EV Charging Station'],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        ],
        address: 'Next to Iscon Cross Road, SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        latitude: 23.0298,
        longitude: 72.5073,
        agent: agentRajesh._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'GIFT One Tower - Grade A Executive Commercial Office',
        description: 'Sprawling commercial IT office space on the 18th floor of GIFT One Tower. Fully plug-and-play with 60 workstations, 4 managerial cabins, executive board room, cafeteria, and data server room.',
        type: 'Commercial',
        purpose: 'Rent',
        price: 185000,
        area: 3100,
        bedrooms: 0,
        bathrooms: 4,
        furnishing: 'Furnished',
        amenities: ['Elevator', 'Security', 'Power Backup', 'Parking', 'Fire Safety', 'High Speed Internet', 'Cafeteria'],
        address: '18th Floor, GIFT One, GIFT City',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382355',
        latitude: 23.1601,
        longitude: 72.6841,
        agent: agentAmit._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'The Sovereign - Modern 3 BHK High-Rise Residence',
        description: 'Spectacular 3 BHK apartment with modular German kitchen, wooden floor master bedroom, expansive sunset balcony, and access to an infinity pool and wellness spa.',
        type: 'Apartment',
        purpose: 'Buy',
        price: 16500000,
        area: 2350,
        bedrooms: 3,
        bathrooms: 3,
        furnishing: 'Semi-Furnished',
        amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Elevator', 'Garden', 'Balcony', 'Clubhouse'],
        address: 'Near Vastrapur Lake, Vastrapur',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        latitude: 23.0373,
        longitude: 72.5298,
        agent: agentRajesh._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'Gulmohar Serenade - Royal 5 BHK Spanish Bungalow',
        description: 'Stately independent Spanish villa built over 600 square yards plot. Includes landscaped Japanese zen garden, gazebos, dedicated home theater room, servant quarters, and 4-car covered parking.',
        type: 'Villa',
        purpose: 'Buy',
        price: 58000000,
        area: 5600,
        bedrooms: 5,
        bathrooms: 6,
        furnishing: 'Furnished',
        amenities: ['Garden', 'Security', 'Power Backup', 'Clubhouse', 'Gym', 'Parking', 'Private Pool', 'Balcony'],
        address: 'Bodakdev Extension, Near Judges Bungalow Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380054',
        latitude: 23.0456,
        longitude: 72.5182,
        agent: agentPriya._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'Riverfront Elegance - 2 BHK Fully Furnished Flat',
        description: 'Vibrant and cozy 2 BHK apartment overlooking the Sabarmati river promenade. Ideal for families and young professionals. Walking distance to metro station.',
        type: 'Apartment',
        purpose: 'Rent',
        price: 32000,
        area: 1250,
        bedrooms: 2,
        bathrooms: 2,
        furnishing: 'Furnished',
        amenities: ['Parking', 'Security', 'Elevator', 'Power Backup', 'Balcony'],
        address: 'Riverfront West Promenade, Paldi',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380007',
        latitude: 23.0125,
        longitude: 72.5698,
        agent: agentRajesh._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      {
        title: 'Vesu Emerald - Premium 4 BHK Gated Society Flat',
        description: 'Prestigious 4 BHK flat in Surat’s posh Vesu corridor. Grand foyer, double balcony, imported marble, two covered parking slots, club house and badminton court.',
        type: 'Apartment',
        purpose: 'Buy',
        price: 24000000,
        area: 3100,
        bedrooms: 4,
        bathrooms: 4,
        furnishing: 'Semi-Furnished',
        amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Elevator', 'Clubhouse', 'Garden', 'Balcony'],
        address: 'VIP Road, Vesu',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395007',
        latitude: 21.1418,
        longitude: 72.7758,
        agent: agentPriya._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'Adajan Bliss - Spacious 3 BHK Family Apartment',
        description: 'Sunny 3 BHK flat with serene river views in Adajan. Near prime shopping malls, top schools and healthcare centers. 24x7 security and children play area.',
        type: 'Apartment',
        purpose: 'Rent',
        price: 28000,
        area: 1650,
        bedrooms: 3,
        bathrooms: 3,
        furnishing: 'Semi-Furnished',
        amenities: ['Parking', 'Elevator', 'Security', 'Garden', 'Power Backup'],
        address: 'LP Savani Road, Adajan',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395009',
        latitude: 21.1959,
        longitude: 72.7933,
        agent: agentAmit._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      {
        title: 'Alkapuri Heritage - Colonial 4 BHK Luxury Bungalow',
        description: 'Charming colonial-style independent home in the heart of Alkapuri, Vadodara. Features teakwood woodwork, sprawling private lawn, solar heating, and servant quarters.',
        type: 'House',
        purpose: 'Buy',
        price: 39000000,
        area: 4500,
        bedrooms: 4,
        bathrooms: 4,
        furnishing: 'Furnished',
        amenities: ['Garden', 'Parking', 'Security', 'Power Backup', 'Balcony'],
        address: 'RC Dutt Road, Alkapuri',
        city: 'Vadodara',
        state: 'Gujarat',
        pincode: '390007',
        latitude: 22.3107,
        longitude: 73.1706,
        agent: agentPriya._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: true,
      },
      {
        title: 'Gota Heights - Affordable 2 BHK Contemporary Flat',
        description: 'Well-ventilated 2 BHK apartment near SG Highway SGVP Circle. Great connectivity, low maintenance society, landscaped garden, and high-speed automatic lifts.',
        type: 'Apartment',
        purpose: 'Buy',
        price: 5200000,
        area: 1150,
        bedrooms: 2,
        bathrooms: 2,
        furnishing: 'Unfurnished',
        amenities: ['Parking', 'Elevator', 'Security', 'Garden', 'Power Backup'],
        address: 'Near Vandematram Cross Roads, Gota',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382481',
        latitude: 23.0977,
        longitude: 72.5332,
        agent: agentRajesh._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      {
        title: 'Prahlad Nagar Corporate Road - Commercial Showroom',
        description: 'Main road facing ground + mezzanine commercial showroom ideal for fashion flagship store, bank branch, or electronics experience center. 60 feet frontage.',
        type: 'Commercial',
        purpose: 'Buy',
        price: 45000000,
        area: 2800,
        bedrooms: 0,
        bathrooms: 2,
        furnishing: 'Unfurnished',
        amenities: ['Parking', 'Security', 'Power Backup', 'Fire Safety'],
        address: 'Corporate Road, Near Titanium Square, Prahlad Nagar',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        latitude: 23.0116,
        longitude: 72.5126,
        agent: agentAmit._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      {
        title: 'Rander Green Acres - Residential NA Plot',
        description: 'Clear title residential NA plotting parcel ready for luxury bungalow construction. Complete with underground drainage, wide RCC internal roads, and water supply connection.',
        type: 'Plot',
        purpose: 'Buy',
        price: 18500000,
        area: 4500,
        bedrooms: 0,
        bathrooms: 0,
        furnishing: 'Unfurnished',
        amenities: ['Security', 'Garden'],
        address: 'Near Jahangirpura Canal Road, Rander',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395005',
        latitude: 21.2185,
        longitude: 72.7876,
        agent: agentAmit._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      {
        title: 'Urban Studio Pod - Smart 1 RK Studio Apartment',
        description: 'Compact minimalist studio apartment tailored for tech employees and single executives working at GIFT City. Includes murphy bed, kitchenette, and high speed WiFi.',
        type: 'Studio',
        purpose: 'Rent',
        price: 18000,
        area: 480,
        bedrooms: 1,
        bathrooms: 1,
        furnishing: 'Furnished',
        amenities: ['Elevator', 'Security', 'Power Backup', 'Gym', 'High Speed Internet'],
        address: 'Koba Circle, Gandhinagar Highway',
        city: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382007',
        latitude: 23.1895,
        longitude: 72.6369,
        agent: agentPriya._id,
        status: 'Available',
        approvalStatus: 'Approved',
        featured: false,
      },
      // Pending Property for Admin Approval demonstration
      {
        title: 'Sindhu Bhavan Heights - Pending 3 BHK Luxury Flat',
        description: 'Brand newly completed 3 BHK flat on Sindhu Bhavan Road. Marble lobby, two elevators, gymnasium, and kids play area. Awaiting final administrative approval.',
        type: 'Apartment',
        purpose: 'Buy',
        price: 19500000,
        area: 2500,
        bedrooms: 3,
        bathrooms: 3,
        furnishing: 'Unfurnished',
        amenities: ['Parking', 'Security', 'Gym', 'Elevator', 'Clubhouse', 'Balcony'],
        address: 'Off Sindhu Bhavan Road, Bodakdev',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380054',
        latitude: 23.0412,
        longitude: 72.5089,
        agent: agentRajesh._id,
        status: 'Available',
        approvalStatus: 'Pending',
        featured: false,
      },
      // Rejected Property for Admin workflow demonstration
      {
        title: 'Substandard Warehouse - Industrial Shed',
        description: 'Old warehouse shed requiring renovation. Missing safety documents and clear titles.',
        type: 'Commercial',
        purpose: 'Rent',
        price: 45000,
        area: 3000,
        bedrooms: 0,
        bathrooms: 1,
        furnishing: 'Unfurnished',
        amenities: ['Parking'],
        address: 'Narol Industrial Estate',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382405',
        latitude: 22.9782,
        longitude: 72.5934,
        agent: agentAmit._id,
        status: 'Available',
        approvalStatus: 'Rejected',
        rejectionReason: 'Incomplete compliance documentation and structural safety certificate missing.',
        featured: false,
      },
    ];

    const properties = await Property.insertMany(propertiesData);
    console.log(`[Seed] Seeded ${properties.length} properties.`);

    console.log('[Seed] Seeding bookings, visits, wishlists, and inquiries...');

    // Seed Wishlists for Rahul & Sneha
    await Wishlist.create([
      { user: userRahul._id, property: properties[0]._id },
      { user: userRahul._id, property: properties[2]._id },
      { user: userSneha._id, property: properties[1]._id },
      { user: userSneha._id, property: properties[3]._id },
    ]);

    // Seed Bookings
    const booking1 = await Booking.create({
      user: userRahul._id,
      property: properties[0]._id,
      agent: agentRajesh._id,
      bookingType: 'Purchase Booking',
      preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      preferredTime: '11:00 AM',
      message: 'Interested in booking token for 4 BHK villa with home loan pre-approval.',
      status: 'Pending',
    });

    const booking2 = await Booking.create({
      user: userSneha._id,
      property: properties[1]._id,
      agent: agentAmit._id,
      bookingType: 'Rental Booking',
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      preferredTime: '03:30 PM',
      message: 'Looking to finalize 3-year commercial corporate lease agreement.',
      status: 'Approved',
      responseNotes: 'Lease draft agreement has been emailed. Meeting confirmed for 3:30 PM.',
    });

    // Seed Visits
    await Visit.create([
      {
        user: userRahul._id,
        property: properties[2]._id,
        agent: agentRajesh._id,
        visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        visitTime: '05:00 PM',
        message: 'Family site viewing for 3 BHK flat near Vastrapur lake.',
        status: 'Approved',
        responseNotes: 'Will meet at site entrance at 5 PM sharp.',
      },
      {
        user: userVikram._id,
        property: properties[3]._id,
        agent: agentPriya._id,
        visitDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        visitTime: '10:30 AM',
        message: 'Want to inspect the bungalow structure and verify boundary walls.',
        status: 'Pending',
      },
    ]);

    // Seed Inquiries
    await Inquiry.create([
      {
        user: userRahul._id,
        property: properties[0]._id,
        agent: agentRajesh._id,
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        phone: '+91 98240 55667',
        message: 'Is the pricing negotiable for direct cash settlement? What is the maintenance fee?',
        status: 'Replied',
        reply: 'Hello Rahul, yes there is slight flexibility on price for quick registration. Maintenance is Rs 4.5/sqft/mo.',
      },
      {
        user: userAnanya._id,
        property: properties[7]._id,
        agent: agentPriya._id,
        name: 'Ananya Desai',
        email: 'ananya.desai@gmail.com',
        phone: '+91 99090 88776',
        message: 'Is this bungalow in Vadodara clear titled? Are bank loans available on this heritage property?',
        status: 'New',
      },
    ]);

    // Seed Notifications
    await Notification.create([
      {
        recipient: admin._id,
        title: 'New Property Listing Pending Approval',
        message: 'Agent Rajesh Patel submitted "Sindhu Bhavan Heights" for administrative review.',
        type: 'system',
        link: '/admin/properties',
        isRead: false,
      },
      {
        recipient: agentRajesh._id,
        title: 'New Booking Request Received',
        message: 'Rahul Verma submitted a purchase booking request for "Shivalik Curv - Ultra Luxury 4 BHK Sky Villa".',
        type: 'booking_created',
        link: '/agent/bookings',
        isRead: false,
      },
      {
        recipient: userRahul._id,
        title: 'Property Visit Confirmed',
        message: 'Your visit for "The Sovereign - Modern 3 BHK High-Rise" has been approved for 5:00 PM.',
        type: 'visit_status',
        link: '/dashboard/visits',
        isRead: false,
      },
      {
        recipient: userSneha._id,
        title: 'Booking Approved',
        message: 'Your rental booking for "GIFT One Tower - Commercial Office" has been approved by agent Amit Mehta.',
        type: 'booking_status',
        link: '/dashboard/bookings',
        isRead: true,
      },
    ]);

    console.log('[Seed] Database seeding completed successfully! ✨');
    console.log('======================================================');
    console.log('ADMIN ACCOUNT:');
    console.log('  Email:    admin@realestate.com');
    console.log('  Password: Admin@123');
    console.log('AGENT ACCOUNTS:');
    console.log('  Email:    rajesh.patel@realty.com / Agent@123');
    console.log('  Email:    priya.sharma@realty.com / Agent@123');
    console.log('  Email:    amit.mehta@realty.com / Agent@123');
    console.log('USER ACCOUNTS:');
    console.log('  Email:    rahul.verma@gmail.com / User@123');
    console.log('  Email:    sneha.joshi@gmail.com / User@123');
    console.log('======================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
