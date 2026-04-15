// Payment Service
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
 * Create payment when work is approved
 */
export async function createPayment(submissionId, paymentData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get submission details
    const [submissions] = await connection.query(`
      SELECT ws.*, a.freelancer_id, a.milestone_id, m.budget, m.currency
      FROM work_submissions ws
      JOIN applications a ON ws.application_id = a.id
      JOIN milestones m ON a.milestone_id = m.id
      WHERE ws.id = ?
    `, [submissionId]);

    if (submissions.length === 0) {
      throw new Error('Submission not found');
    }

    const submission = submissions[0];

    // Create payment record
    const [result] = await connection.query(`
      INSERT INTO payments (
        submission_id, application_id, milestone_id, freelancer_id, company_id,
        amount, currency, payment_method, payment_status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      submissionId,
      submission.application_id,
      submission.milestone_id,
      submission.freelancer_id,
      paymentData.company_id,
      paymentData.amount || submission.budget,
      paymentData.currency || submission.currency,
      paymentData.payment_method || 'bank_transfer',
      'pending',
      paymentData.transaction_id || null
    ]);

    await connection.commit();
    return result.insertId;

  } catch (error) {
    await connection.rollback();
    console.error('Error creating payment:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Process payment (simulate payment processing)
 */
export async function processPayment(paymentId) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update payment status
    await connection.query(`
      UPDATE payments 
      SET payment_status = 'processing', updated_at = NOW()
      WHERE id = ?
    `, [paymentId]);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark as completed
    await connection.query(`
      UPDATE payments 
      SET payment_status = 'completed', payment_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [paymentId]);

    // Update freelancer profile stats
    const [payments] = await connection.query(`
      SELECT freelancer_id, amount FROM payments WHERE id = ?
    `, [paymentId]);

    if (payments.length > 0) {
      const payment = payments[0];
      await connection.query(`
        UPDATE freelancer_profiles 
        SET completed_projects = completed_projects + 1,
            total_projects = total_projects + 1
        WHERE freelancer_id = ?
      `, [payment.freelancer_id]);
    }

    await connection.commit();
    return { success: true, message: 'Payment processed successfully' };

  } catch (error) {
    await connection.rollback();
    console.error('Error processing payment:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get payment history for freelancer
 */
export async function getFreelancerPayments(freelancerId) {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, 
        m.title as milestone_title,
        pr.project_title,
        ws.title as submission_title
      FROM payments p
      JOIN milestones m ON p.milestone_id = m.id
      JOIN projects pr ON m.project_id = pr.id
      JOIN work_submissions ws ON p.submission_id = ws.id
      WHERE p.freelancer_id = ?
      ORDER BY p.created_at DESC
    `, [freelancerId]);

    return payments;
  } catch (error) {
    console.error('Error getting freelancer payments:', error);
    throw error;
  }
}

/**
 * Get payment history for company
 */
export async function getCompanyPayments(companyId) {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, 
        m.title as milestone_title,
        pr.project_title,
        ws.title as submission_title,
        fp.freelancer_name
      FROM payments p
      JOIN milestones m ON p.milestone_id = m.id
      JOIN projects pr ON m.project_id = pr.id
      JOIN work_submissions ws ON p.submission_id = ws.id
      JOIN freelancer_profiles fp ON p.freelancer_id = fp.freelancer_id
      WHERE p.company_id = ?
      ORDER BY p.created_at DESC
    `, [companyId]);

    return payments;
  } catch (error) {
    console.error('Error getting company payments:', error);
    throw error;
  }
}

export default {
  createPayment,
  processPayment,
  getFreelancerPayments,
  getCompanyPayments
};
