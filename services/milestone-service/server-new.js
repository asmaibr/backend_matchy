import express from 'express';
import cors from 'cors';
import eurekaClient from './eureka-client.js';
import apiRoutes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 9090;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for frontend (since we're bypassing gateway temporarily)
app.use(cors({ 
  origin: 'http://localhost:4200',
  credentials: true 
}));

// Increase body size limit for file uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// API ROUTES
// ============================================

app.use('/api', apiRoutes);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Matchy Backend Service running on http://localhost:${PORT}`);
  console.log(`📊 Database: matchy_db`);
  console.log(`✅ Ready to accept requests`);
  console.log(`🔗 Registering with Eureka at http://localhost:8761`);
  console.log(`🏗️  Architecture: Repository → Service → Controller`);
  console.log(`✅ Advanced features loaded: AI Matching, Payments, Advanced Search`);
});
