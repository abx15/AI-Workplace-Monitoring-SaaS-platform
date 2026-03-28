import dotenv from 'dotenv';
import { connectMongo } from '../config/mongo.config';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Camera } from '../models/Camera';
import { Alert } from '../models/Alert';
import bcrypt from 'bcryptjs';

// Apply DNS fix
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function seedDatabase() {
  console.log('🚀 Seeding MongoDB Database...\n');

  try {
    // Connect to MongoDB
    await connectMongo();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('📍 Clearing existing data...');
    await Alert.deleteMany({});
    await Camera.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Seed Companies
    console.log('📍 Seeding Companies...');
    const companies = [
      {
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        phone: '+1-555-0123',
        address: '123 Business Ave, Tech City, TC 12345',
        subscriptionPlan: 'premium'
      },
      {
        name: 'Digital Innovations Ltd.',
        email: 'info@digitalinnovations.com',
        phone: '+1-555-0456',
        address: '456 Innovation Drive, Silicon Valley, SV 67890',
        subscriptionPlan: 'enterprise'
      }
    ];

    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ Inserted ${createdCompanies.length} companies`);

    // Seed Users
    console.log('\n📍 Seeding Users...');
    
    // Hash passwords for admin users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const managerPassword = await bcrypt.hash('manager123', 12);
    
    const users = [
      // Admin users with passwords
      {
        name: 'Admin User',
        email: 'admin@techsolutions.com',
        password: adminPassword,
        employeeId: 'ADMIN001',
        companyId: createdCompanies[0]._id,
        department: 'admin',
        role: 'admin'
      },
      {
        name: 'Sarah Johnson',
        email: 'admin@digitalinnovations.com',
        password: adminPassword,
        employeeId: 'ADMIN002',
        companyId: createdCompanies[1]._id,
        department: 'admin',
        role: 'admin'
      },
      // Manager users with passwords
      {
        name: 'Priya Patel',
        email: 'manager@techsolutions.com',
        password: managerPassword,
        employeeId: 'MGR001',
        companyId: createdCompanies[0]._id,
        department: 'management',
        role: 'manager'
      },
      // Regular employees (without passwords for now)
      {
        name: 'Suresh Kumar',
        email: 'suresh.kumar@techsolutions.com',
        employeeId: 'EMP001',
        companyId: createdCompanies[0]._id,
        department: 'production',
        role: 'employee'
      },
      {
        name: 'Anjali Verma',
        email: 'anjali.verma@techsolutions.com',
        employeeId: 'EMP002',
        companyId: createdCompanies[0]._id,
        department: 'production',
        role: 'employee'
      },
      {
        name: 'Mohammed Ali',
        email: 'mohammed.ali@techsolutions.com',
        employeeId: 'EMP003',
        companyId: createdCompanies[0]._id,
        department: 'production',
        role: 'employee'
      },
      {
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@techsolutions.com',
        employeeId: 'EMP004',
        companyId: createdCompanies[0]._id,
        department: 'management',
        role: 'supervisor'
      },
      {
        name: 'John Smith',
        email: 'john.smith@digitalinnovations.com',
        employeeId: 'DI001',
        companyId: createdCompanies[1]._id,
        department: 'it',
        role: 'employee'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Inserted ${createdUsers.length} users`);

    // Seed Cameras
    console.log('\n📍 Seeding Cameras...');
    const cameras = [
      // Tech Solutions Inc. cameras
      {
        companyId: createdCompanies[0]._id,
        name: 'Main Entrance Camera',
        location: 'Main Entrance',
        rtspUrl: 'rtsp://camera1.techsolutions.com/stream',
        isActive: true
      },
      {
        companyId: createdCompanies[0]._id,
        name: 'Production Floor A',
        location: 'Production Floor A',
        rtspUrl: 'rtsp://camera2.techsolutions.com/stream',
        isActive: true
      },
      {
        companyId: createdCompanies[0]._id,
        name: 'Production Floor B',
        location: 'Production Floor B',
        rtspUrl: 'rtsp://camera3.techsolutions.com/stream',
        isActive: true
      },
      {
        companyId: createdCompanies[0]._id,
        name: 'Break Room',
        location: 'Break Room',
        rtspUrl: 'rtsp://camera4.techsolutions.com/stream',
        isActive: true
      },
      // Digital Innovations Ltd. cameras
      {
        companyId: createdCompanies[1]._id,
        name: 'Office Entrance',
        location: 'Office Entrance',
        rtspUrl: 'rtsp://camera1.digitalinnovations.com/stream',
        isActive: true
      },
      {
        companyId: createdCompanies[1]._id,
        name: 'Server Room',
        location: 'Server Room',
        rtspUrl: 'rtsp://camera2.digitalinnovations.com/stream',
        isActive: true
      }
    ];

    const createdCameras = await Camera.insertMany(cameras);
    console.log(`✅ Inserted ${createdCameras.length} cameras`);

    // Seed Alerts
    console.log('\n📍 Seeding Alerts...');
    const alerts = [
      // Tech Solutions Inc. alerts
      {
        companyId: createdCompanies[0]._id,
        employeeId: createdUsers[0]._id, // Suresh Kumar
        cameraId: createdCameras[1]._id, // Production Floor A
        alertType: 'idle',
        severity: 'medium',
        message: 'Employee detected idle for more than 30 minutes',
        metadata: {
          duration: 1800,
          location: 'Production Floor A',
          confidence: 0.94
        }
      },
      {
        companyId: createdCompanies[0]._id,
        employeeId: createdUsers[2]._id, // Mohammed Ali
        cameraId: createdCameras[2]._id, // Production Floor B
        alertType: 'sleeping',
        severity: 'high',
        message: 'Employee detected sleeping at workstation',
        metadata: {
          duration: 900,
          location: 'Production Floor B',
          confidence: 0.91
        }
      },
      {
        companyId: createdCompanies[0]._id,
        cameraId: createdCameras[0]._id, // Main Entrance
        alertType: 'unauthorized',
        severity: 'high',
        message: 'Unauthorized person detected in restricted area',
        metadata: {
          confidence: 0.95,
          location: 'Main Entrance',
          personId: 'unknown_001'
        }
      },
      {
        companyId: createdCompanies[0]._id,
        employeeId: createdUsers[1]._id, // Anjali Verma
        alertType: 'absentee',
        severity: 'medium',
        message: 'Employee marked absent for scheduled shift',
        metadata: {
          shift: 'morning',
          date: new Date().toISOString().split('T')[0],
          expectedTime: '09:00'
        }
      },
      // Digital Innovations Ltd. alerts
      {
        companyId: createdCompanies[1]._id,
        employeeId: createdUsers[5]._id, // John Smith
        cameraId: createdCameras[4]._id, // Office Entrance
        alertType: 'productivity',
        severity: 'low',
        message: 'Low productivity detected during work hours',
        metadata: {
          productivityScore: 0.65,
          location: 'Office Entrance',
          timeWindow: '2 hours'
        }
      }
    ];

    const createdAlerts = await Alert.insertMany(alerts);
    console.log(`✅ Inserted ${createdAlerts.length} alerts`);

    // Display statistics
    console.log('\n📊 Database Statistics:');
    console.log(`   Companies: ${await Company.countDocuments()}`);
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Cameras: ${await Camera.countDocuments()}`);
    console.log(`   Alerts: ${await Alert.countDocuments()}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('✅ MongoDB is ready for production use');

  } catch (error: any) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n👋 Seeding complete. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
