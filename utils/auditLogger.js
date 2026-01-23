import AuditLog from "../models/auditLogModel.js";

/**
 * Generic audit logger
 * @param {Object} params
 * @param {"ASSET"|"USER"|"REQUEST"|"MAINTENANCE"} params.entityType
 * @param {String} params.entityId
 * @param {String} params.action
 * @param {String} [params.performedBy]
 * @param {Object} [params.details]
 */
export const logAudit = async ({
  entityType,
  entityId,
  action,
  performedBy,
  details = {},
}) => {
  try {
    await AuditLog.create({
      entityType,
      entityId,
      action,
      performedBy,
      details,
    });
  } catch (err) {
    // IMPORTANT: never break the main flow
    console.error("Audit log failed:", err.message);
  }
};
