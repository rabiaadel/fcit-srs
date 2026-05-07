// =============================================================================
// Metrics Middleware & Helpers
// [P2-FIX] Centralized metric recording helpers for controllers and services
// Import from here — not directly from server.js — to avoid circular deps
// =============================================================================
const { Counter, Histogram } = require('prom-client');

// Lazy-loaded to avoid double-registration if server.js already created them
let _loginAttemptsTotal;
let _enrollmentOpsTotal;
let _gradeEntriesTotal;
let _notificationsTotal;

function getMetrics() {
  if (!_loginAttemptsTotal) {
    try {
      _loginAttemptsTotal   = new Counter({ name:'fcit_srs_login_attempts_total',          help:'Login attempts by result and role',             labelNames:['result','role']            });
      _enrollmentOpsTotal   = new Counter({ name:'fcit_srs_enrollment_operations_total',    help:'Course enrollment operations',                  labelNames:['operation','result']       });
      _gradeEntriesTotal    = new Counter({ name:'fcit_srs_grade_entries_total',            help:'Grade entry operations',                        labelNames:['result']                   });
      _notificationsTotal   = new Counter({ name:'fcit_srs_notifications_dispatched_total', help:'Notifications dispatched',                      labelNames:['type']                     });
    } catch (e) {
      // Counters already registered by server.js — get them from the registry
      const { register } = require('prom-client');
      const metricMap = {};
      register.getMetricsAsArray().forEach(m => { metricMap[m.name] = m; });
      _loginAttemptsTotal   = metricMap['fcit_srs_login_attempts_total'];
      _enrollmentOpsTotal   = metricMap['fcit_srs_enrollment_operations_total'];
      _gradeEntriesTotal    = metricMap['fcit_srs_grade_entries_total'];
      _notificationsTotal   = metricMap['fcit_srs_notifications_dispatched_total'];
    }
  }
  return { _loginAttemptsTotal, _enrollmentOpsTotal, _gradeEntriesTotal, _notificationsTotal };
}

// Safe increment helpers — never throw, metrics should never break app flow
const recordLogin = (result, role = 'unknown') => {
  try { const { _loginAttemptsTotal: m } = getMetrics(); m?.inc({ result, role }); } catch {}
};

const recordEnrollment = (operation, result) => {
  try { const { _enrollmentOpsTotal: m } = getMetrics(); m?.inc({ operation, result }); } catch {}
};

const recordGradeEntry = (result) => {
  try { const { _gradeEntriesTotal: m } = getMetrics(); m?.inc({ result }); } catch {}
};

const recordNotification = (type) => {
  try { const { _notificationsTotal: m } = getMetrics(); m?.inc({ type }); } catch {}
};

module.exports = { recordLogin, recordEnrollment, recordGradeEntry, recordNotification };
