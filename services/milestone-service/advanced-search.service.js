// Advanced Search Service
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'matchy_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Advanced project search with filters
 */
export async function searchProjects(filters = {}) {
  try {
    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as applications_count
      FROM projects p
      WHERE 1=1
    `;
    const params = [];

    // Search query (title, description, company)
    if (filters.query) {
      query += ` AND (
        p.project_title LIKE ? OR 
        p.description LIKE ? OR 
        p.company_name LIKE ? OR
        p.details_of_work LIKE ?
      )`;
      const searchTerm = `%${filters.query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const skillConditions = filters.skills.map(() => 'JSON_CONTAINS(p.skills, ?)').join(' OR ');
      query += ` AND (${skillConditions})`;
      filters.skills.forEach(skill => {
        params.push(JSON.stringify(skill));
      });
    }

    // Budget range
    if (filters.minBudget) {
      query += ` AND p.budget >= ?`;
      params.push(filters.minBudget);
    }
    if (filters.maxBudget) {
      query += ` AND p.budget <= ?`;
      params.push(filters.maxBudget);
    }

    // Location filter
    if (filters.location) {
      query += ` AND p.location LIKE ?`;
      params.push(`%${filters.location}%`);
    }

    // Category filter
    if (filters.category) {
      query += ` AND p.category = ?`;
      params.push(filters.category);
    }

    // Status filter
    if (filters.status) {
      query += ` AND p.status = ?`;
      params.push(filters.status);
    } else {
      query += ` AND p.status = 'open'`; // Default to open projects
    }

    // Deadline filter
    if (filters.deadlineBefore) {
      query += ` AND p.deadline <= ?`;
      params.push(filters.deadlineBefore);
    }
    if (filters.deadlineAfter) {
      query += ` AND p.deadline >= ?`;
      params.push(filters.deadlineAfter);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY p.${sortBy} ${sortOrder}`;

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [results] = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM projects p WHERE 1=1`;
    const countParams = params.slice(0, -2); // Remove limit and offset
    
    if (filters.query) {
      countQuery += ` AND (
        p.project_title LIKE ? OR 
        p.description LIKE ? OR 
        p.company_name LIKE ? OR
        p.details_of_work LIKE ?
      )`;
    }
    if (filters.skills && filters.skills.length > 0) {
      const skillConditions = filters.skills.map(() => 'JSON_CONTAINS(p.skills, ?)').join(' OR ');
      countQuery += ` AND (${skillConditions})`;
    }
    if (filters.minBudget) countQuery += ` AND p.budget >= ?`;
    if (filters.maxBudget) countQuery += ` AND p.budget <= ?`;
    if (filters.location) countQuery += ` AND p.location LIKE ?`;
    if (filters.category) countQuery += ` AND p.category = ?`;
    if (filters.status) {
      countQuery += ` AND p.status = ?`;
    } else {
      countQuery += ` AND p.status = 'open'`;
    }
    if (filters.deadlineBefore) countQuery += ` AND p.deadline <= ?`;
    if (filters.deadlineAfter) countQuery += ` AND p.deadline >= ?`;

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
}

/**
 * Advanced freelancer search with filters
 */
export async function searchFreelancers(filters = {}) {
  try {
    let query = `
      SELECT fp.*,
        (SELECT COUNT(*) FROM applications WHERE freelancer_id = fp.freelancer_id) as total_applications
      FROM freelancer_profiles fp
      WHERE 1=1
    `;
    const params = [];

    // Search query (name, email, bio)
    if (filters.query) {
      query += ` AND (
        fp.freelancer_name LIKE ? OR 
        fp.freelancer_email LIKE ? OR 
        fp.bio LIKE ?
      )`;
      const searchTerm = `%${filters.query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const skillConditions = filters.skills.map(() => 'JSON_CONTAINS(fp.skills, ?)').join(' OR ');
      query += ` AND (${skillConditions})`;
      filters.skills.forEach(skill => {
        params.push(JSON.stringify(skill));
      });
    }

    // Experience range
    if (filters.minExperience) {
      query += ` AND fp.experience_years >= ?`;
      params.push(filters.minExperience);
    }
    if (filters.maxExperience) {
      query += ` AND fp.experience_years <= ?`;
      params.push(filters.maxExperience);
    }

    // Hourly rate range
    if (filters.minRate) {
      query += ` AND fp.hourly_rate >= ?`;
      params.push(filters.minRate);
    }
    if (filters.maxRate) {
      query += ` AND fp.hourly_rate <= ?`;
      params.push(filters.maxRate);
    }

    // Rating filter
    if (filters.minRating) {
      query += ` AND fp.average_rating >= ?`;
      params.push(filters.minRating);
    }

    // Location filter
    if (filters.location) {
      query += ` AND fp.location LIKE ?`;
      params.push(`%${filters.location}%`);
    }

    // Availability filter
    if (filters.availability) {
      query += ` AND fp.availability = ?`;
      params.push(filters.availability);
    }

    // Sorting
    const sortBy = filters.sortBy || 'average_rating';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY fp.${sortBy} ${sortOrder}`;

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [results] = await pool.query(query, params);

    // Get total count (simplified)
    const countQuery = query.split('ORDER BY')[0].replace('SELECT fp.*,', 'SELECT COUNT(*) as total FROM (SELECT fp.freelancer_id FROM');
    const [countResult] = await pool.query(countQuery + ') as subquery', params.slice(0, -2));
    const total = countResult[0].total;

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Error searching freelancers:', error);
    throw error;
  }
}

/**
 * Save search for later
 */
export async function saveSearch(userId, userType, searchData) {
  try {
    const [result] = await pool.query(`
      INSERT INTO saved_searches (user_id, user_type, search_name, search_query, filters, notify_on_match)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      userType,
      searchData.name,
      searchData.query || null,
      JSON.stringify(searchData.filters || {}),
      searchData.notifyOnMatch || false
    ]);

    return result.insertId;
  } catch (error) {
    console.error('Error saving search:', error);
    throw error;
  }
}

/**
 * Get saved searches
 */
export async function getSavedSearches(userId, userType) {
  try {
    const [searches] = await pool.query(`
      SELECT * FROM saved_searches
      WHERE user_id = ? AND user_type = ?
      ORDER BY created_at DESC
    `, [userId, userType]);

    return searches;
  } catch (error) {
    console.error('Error getting saved searches:', error);
    throw error;
  }
}

export default {
  searchProjects,
  searchFreelancers,
  saveSearch,
  getSavedSearches
};
