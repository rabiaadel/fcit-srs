// =============================================================================
// Notification Service
// Central event-driven notification dispatcher — aligned to DB schema
// notifications table: id(UUID), user_id(UUID), title, message, is_read, link, created_at
// =============================================================================
const { query, withTransaction } = require('../config/database');
const logger = require('../utils/logger');
const { recordNotification } = require('../middleware/metrics');

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE: insert one notification row
// ─────────────────────────────────────────────────────────────────────────────
async function _insert(client_or_query, userId, title, message, link = null, type = 'system') {
  const fn = client_or_query?.query
    ? (sql, p) => client_or_query.query(sql, p)   // transaction client
    : query;                                        // pool query
  try {
    await fn(
      'INSERT INTO notifications (user_id, title, message, link, type) VALUES ($1, $2, $3, $4, $5)',
      [userId, title, message, link, type]
    );
  } catch (err) {
    if (err.code === '42703') {
      // migration_v3 has not run yet — type column does not exist; insert without it
      await fn(
        'INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)',
        [userId, title, message, link]
      );
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE: bulk-notify a role (or all roles when targetRole is null)
// ─────────────────────────────────────────────────────────────────────────────
async function _notifyRole(client, targetRole, title, message, link = null, type = 'system') {
  const fn = client?.query ? (s, p) => client.query(s, p) : query;
  
  try {
    let sql, params;
    if (targetRole) {
      sql = 'INSERT INTO notifications (user_id, title, message, link, type) SELECT id, $1, $2, $3, $4 FROM users WHERE role = $5 AND is_active = TRUE';
      params = [title, message, link, type, targetRole];
    } else {
      sql = 'INSERT INTO notifications (user_id, title, message, link, type) SELECT id, $1, $2, $3, $4 FROM users WHERE is_active = TRUE';
      params = [title, message, link, type];
    }
    await fn(sql, params);
  } catch (err) {
    if (err.code === '42703') {
      let fallbackSql, fallbackParams;
      if (targetRole) {
        fallbackSql = 'INSERT INTO notifications (user_id, title, message, link) SELECT id, $1, $2, $3 FROM users WHERE role = $4 AND is_active = TRUE';
        fallbackParams = [title, message, link, targetRole];
      } else {
        fallbackSql = 'INSERT INTO notifications (user_id, title, message, link) SELECT id, $1, $2, $3 FROM users WHERE is_active = TRUE';
        fallbackParams = [title, message, link];
      }
      await fn(fallbackSql, fallbackParams);
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGERS — called by backend services on business events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [B2-FIX] Notify student after course registration
 */
async function onCourseRegistered(client, studentUserId, courseCode, courseName, semesterLabel) {
  await _insert(
    client, studentUserId,
    `Registered: ${courseCode}`,
    `You have been successfully registered for "${courseName}" in ${semesterLabel}.`,
    '/student/schedule',
    'enrollment'
  );
  recordNotification('course_registered');
}

/**
 * [B2-FIX] Notify student after course drop
 */
async function onCourseDropped(client, studentUserId, courseCode, courseName) {
  await _insert(
    client, studentUserId,
    `Course Dropped: ${courseCode}`,
    `You have dropped "${courseName}". No W grade has been recorded.`,
    '/student/schedule',
    'enrollment'
  );
}

/**
 * [B2-FIX] Notify student after course withdrawal (W grade recorded)
 */
async function onCourseWithdrawn(client, studentUserId, courseCode, courseName) {
  await _insert(
    client, studentUserId,
    `Withdrawn: ${courseCode}`,
    `You have been withdrawn from "${courseName}". A W grade has been recorded on your transcript.`,
    '/student/transcript',
    'enrollment'
  );
}

/**
 * [B2-FIX] Notify student after grade entry / update
 */
async function onGradeEntered(client, studentUserId, courseCode, totalGrade, letterGrade, semesterLabel) {
  const msg = totalGrade !== null
    ? `Your grade for ${courseCode} (${semesterLabel}) has been recorded: ${letterGrade} (${totalGrade}%).`
    : `Grades have been updated for ${courseCode} in ${semesterLabel}.`;

  await _insert(
    client, studentUserId,
    `Grade Posted: ${courseCode}`,
    msg,
    '/student/transcript',
    'grade'
  );
}

/**
 * [B2-FIX] Notify student when academic warning is issued
 */
async function onAcademicWarning(client, studentUserId, cgpa, semesterLabel, consecutiveWarnings) {
  const urgency = consecutiveWarnings >= 3 ? 'URGENT: ' : '';
  await _insert(
    client, studentUserId,
    `${urgency}Academic Warning Issued`,
    `Your CGPA (${parseFloat(cgpa).toFixed(3)}) has fallen below 2.0 in ${semesterLabel}. This is warning #${consecutiveWarnings}. Four consecutive warnings result in dismissal.`,
    '/student/graduation',
    'warning'
  );
}

/**
 * [B2-FIX] Notify student upon academic dismissal
 */
async function onDismissal(client, studentUserId, reasons) {
  await _insert(
    client, studentUserId,
    'Academic Dismissal Notice',
    `You have been academically dismissed. Reason(s): ${reasons.join('; ')}. Please contact the registrar's office for further information.`,
    null,
    'dismissal'
  );
}

/**
 * [B2-FIX] Notify doctor when a new course is assigned to them
 */
async function onCourseAssigned(doctorUserId, courseCode, courseName, semesterLabel) {
  await _insert(
    null, doctorUserId,
    'تخصيص مقرر جديد',
    `You have been assigned to teach "${courseName}" in ${semesterLabel}.`,
    '/doctor',
    'schedule_assigned'
  );
}

/**
 * [B2-FIX] Notify doctor when grade entry deadline is approaching
 */
async function onGradeDeadlineReminder(doctorUserId, courseCode, semesterLabel, deadline) {
  await _insert(
    null, doctorUserId,
    `Grade Entry Reminder: ${courseCode}`,
    `Grades for ${courseCode} in ${semesterLabel} must be entered by ${deadline}. Students with missing grades will receive an Incomplete (I).`,
    '/doctor',
    'system'
  );
}

/**
 * [B2-FIX] Notify relevant users when a new announcement is published
 */
async function onAnnouncementPublished(announcementId, title, targetRole) {
  // Bulk notify in background — non-blocking via setImmediate
  setImmediate(async () => {
    try {
      await _notifyRole(
        null, targetRole,
        `Announcement: ${title}`,
        'A new announcement has been posted. Click to view.',
        '/student/notifications',
        'announcement'
      );
    } catch (err) {
      logger.error('Failed to dispatch announcement notifications', { announcementId, error: err.message });
    }
  });
}

/**
 * [B2-FIX] Notify students when registration opens
 */
async function onRegistrationOpened(semesterLabel) {
  setImmediate(async () => {
    try {
      await _notifyRole(
        null, 'student',
        `Registration Open: ${semesterLabel}`,
        `Course registration for ${semesterLabel} is now open. Log in to register before the deadline.`,
        '/student/courses',
        'semester_event'
      );
    } catch (err) {
      logger.error('Failed to dispatch registration-open notifications', { error: err.message });
    }
  });
}

/**
 * [B2-FIX] Notify students when grading period begins (grades will be posted)
 */
async function onGradingPeriodStarted(semesterLabel) {
  setImmediate(async () => {
    try {
      await _notifyRole(
        null, 'student',
        `Grading Period: ${semesterLabel}`,
        `The grading period for ${semesterLabel} has begun. Final grades will be posted shortly.`,
        '/student/transcript',
        'semester_event'
      );
    } catch (err) {
      logger.error('Failed to dispatch grading-period notifications', { error: err.message });
    }
  });
}

/**
 * [B2-FIX] Notify students when semester is closed and final grades are locked
 */
async function onSemesterClosed(semesterLabel) {
  setImmediate(async () => {
    try {
      await _notifyRole(
        null, 'student',
        `Semester Finalized: ${semesterLabel}`,
        `${semesterLabel} has been finalized. Your final grades and updated CGPA are now available in your transcript.`,
        '/student/transcript',
        'semester_event'
      );
    } catch (err) {
      logger.error('Failed to dispatch semester-closed notifications', { error: err.message });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: mark all notifications read for a user (convenience)
// ─────────────────────────────────────────────────────────────────────────────
async function markAllRead(userId) {
  await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: purge old read notifications (run on schedule or triggered)
// ─────────────────────────────────────────────────────────────────────────────
async function purgeOldNotifications(daysOld = 90) {
  const result = await query(
    'DELETE FROM notifications WHERE is_read = TRUE AND created_at < NOW() - INTERVAL \'1 day\' * $1',
    [daysOld]
  );
  logger.info('Purged old notifications', { rows: result.rowCount });
  return result.rowCount;
}

module.exports = {
  onCourseRegistered,
  onCourseDropped,
  onCourseWithdrawn,
  onGradeEntered,
  onAcademicWarning,
  onDismissal,
  onCourseAssigned,
  onGradeDeadlineReminder,
  onAnnouncementPublished,
  onRegistrationOpened,
  onGradingPeriodStarted,
  onSemesterClosed,
  markAllRead,
  purgeOldNotifications,
};
