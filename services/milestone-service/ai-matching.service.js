// AI-Powered Freelancer Matching Service
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
 * Calculate match score between freelancer and project
 * Based on: skills match, experience, rating, success rate, availability
 */
export function calculateMatchScore(freelancer, project) {
  let score = 0;
  const weights = {
    skills: 40,
    experience: 20,
    rating: 20,
    successRate: 15,
    availability: 5
  };

  // 1. Skills Match (40 points)
  const projectSkills = Array.isArray(project.skills) ? project.skills : JSON.parse(project.skills || '[]');
  const freelancerSkills = Array.isArray(freelancer.skills) ? freelancer.skills : JSON.parse(freelancer.skills || '[]');
  
  const matchingSkills = projectSkills.filter(skill => 
    freelancerSkills.some(fSkill => fSkill.toLowerCase() === skill.toLowerCase())
  );
  
  const skillsMatchPercentage = projectSkills.length > 0 
    ? (matchingSkills.length / projectSkills.length) * 100 
    : 0;
  score += (skillsMatchPercentage / 100) * weights.skills;

  // 2. Experience (20 points)
  const experienceScore = Math.min(freelancer.experience_years / 10, 1) * weights.experience;
  score += experienceScore;

  // 3. Rating (20 points)
  const ratingScore = (freelancer.average_rating / 5) * weights.rating;
  score += ratingScore;

  // 4. Success Rate (15 points)
  const successScore = (freelancer.success_rate / 100) * weights.successRate;
  score += successScore;

  // 5. Availability (5 points)
  const availabilityScore = freelancer.availability === 'available' ? weights.availability : 0;
  score += availabilityScore;

  return {
    score: Math.round(score * 100) / 100,
    matchingSkills,
    breakdown: {
      skills: Math.round((skillsMatchPercentage / 100) * weights.skills * 100) / 100,
      experience: Math.round(experienceScore * 100) / 100,
      rating: Math.round(ratingScore * 100) / 100,
      successRate: Math.round(successScore * 100) / 100,
      availability: availabilityScore
    }
  };
}

/**
 * Get recommended freelancers for a project
 */
export async function getRecommendedFreelancers(projectId, limit = 10) {
  try {
    // Get project details
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      throw new Error('Project not found');
    }
    const project = projects[0];

    // Get all freelancers
    const [freelancers] = await pool.query(`
      SELECT * FROM freelancer_profiles 
      WHERE availability IN ('available', 'busy')
      ORDER BY average_rating DESC, success_rate DESC
    `);

    // Calculate match scores
    const recommendations = freelancers.map(freelancer => {
      const matchResult = calculateMatchScore(freelancer, project);
      return {
        freelancer_id: freelancer.freelancer_id,
        freelancer_name: freelancer.freelancer_name,
        freelancer_email: freelancer.freelancer_email,
        skills: freelancer.skills,
        experience_years: freelancer.experience_years,
        hourly_rate: freelancer.hourly_rate,
        location: freelancer.location,
        average_rating: freelancer.average_rating,
        success_rate: freelancer.success_rate,
        completed_projects: freelancer.completed_projects,
        availability: freelancer.availability,
        match_score: matchResult.score,
        matching_skills: matchResult.matchingSkills,
        score_breakdown: matchResult.breakdown
      };
    });

    // Sort by match score and return top matches
    recommendations.sort((a, b) => b.match_score - a.match_score);
    return recommendations.slice(0, limit);

  } catch (error) {
    console.error('Error getting recommended freelancers:', error);
    throw error;
  }
}

/**
 * Get recommended projects for a freelancer
 */
export async function getRecommendedProjects(freelancerId, limit = 10) {
  try {
    // Get freelancer profile
    const [freelancers] = await pool.query(
      'SELECT * FROM freelancer_profiles WHERE freelancer_id = ?',
      [freelancerId]
    );
    if (freelancers.length === 0) {
      throw new Error('Freelancer not found');
    }
    const freelancer = freelancers[0];

    // Get open projects
    const [projects] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as applications_count
      FROM projects p
      WHERE p.status = 'open'
      ORDER BY p.created_at DESC
    `);

    // Calculate match scores
    const recommendations = projects.map(project => {
      const matchResult = calculateMatchScore(freelancer, project);
      return {
        ...project,
        match_score: matchResult.score,
        matching_skills: matchResult.matchingSkills,
        score_breakdown: matchResult.breakdown
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.match_score - a.match_score);
    
    // Save recommendations to database
    for (const rec of recommendations.slice(0, limit)) {
      await pool.query(`
        INSERT INTO project_recommendations 
        (freelancer_id, project_id, match_score, matching_skills, reason)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          match_score = VALUES(match_score),
          matching_skills = VALUES(matching_skills),
          reason = VALUES(reason)
      `, [
        freelancerId,
        rec.id,
        rec.match_score,
        JSON.stringify(rec.matching_skills),
        `${rec.matching_skills.length} matching skills`
      ]);
    }

    return recommendations.slice(0, limit);

  } catch (error) {
    console.error('Error getting recommended projects:', error);
    throw error;
  }
}

export default {
  calculateMatchScore,
  getRecommendedFreelancers,
  getRecommendedProjects
};
