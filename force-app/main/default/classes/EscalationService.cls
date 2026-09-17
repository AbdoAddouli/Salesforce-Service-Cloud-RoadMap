/**
 * Service Cloud Consultant Learning Project - Escalation Service
 * ============================================================================
 * EXAM CONCEPT: Escalation Rules & Case Management (Blueprint Domain: 16%)
 *
 * This class demonstrates how to implement escalation logic programmatically.
 * In Service Cloud, escalation rules automatically escalate cases when certain
 * criteria are met (usually time-based). This service implements the programmatic
 * equivalent for complex escalation scenarios.
 *
 * KEY LEARNING POINTS:
 * 1. Escalation rules evaluate entries in order; first match wins
 * 2. Escalation levels: auto-escalate through successive levels
 * 3. Business hours affect escalation timing
 * 4. Escalation actions: email alerts, field updates, task creation
 * 5. Difference between escalation rules and assignment rules
 *
 * EXAM DISTINCTION:
 * - Assignment Rules: Route new cases to the right queue/user
 * - Escalation Rules: Move existing cases to higher-level support when SLAs are at risk
 *
 * RELATED EXAM TOPICS:
 * - Configuring escalation rules with multiple levels
 * - Setting escalation timeframes in business hours
 * - Defining escalation actions (email, field update, task)
 * - Auto-escalation vs manual escalation
 * - Escalation rule evaluation order
 * ============================================================================
 */
public with sharing class EscalationService {

    private static final Integer MAX_ESCALATION_LEVEL = 5;
    private static final String ESCALATION_PREFIX = 'ESCALATED - ';

    /**
     * Escalates a case to the specified escalation level.
     * At each level, the case owner, priority, and status are updated.
     * In real implementations, different queues or users are assigned at each level.
     *
     * Escalation levels typically follow this pattern:
     * Level 1: Team Lead / Senior Agent
     * Level 2: Support Manager
     * Level 3: Director of Support
     * Level 4: VP Support / Engineering
     * Level 5: Executive Escalation
     *
     * @param c The case to escalate
     * @param level The escalation level (1-5)
     * @return The updated case record
     */
    public static Case escalateCase(Case c, Integer level) {
        if (c == null || level == null || level < 1 || level > MAX_ESCALATION_LEVEL) {
            return c;
        }

        // Update priority based on escalation level
        switch on level {
            when 1 {
                c.Priority = 'High';
            }
            when 2 {
                c.Priority = 'High';
            }
            when 3 {
                c.Priority = 'Critical';
            }
            when 4, 5 {
                c.Priority = 'Critical';
            }
        }

        // Update status to reflect escalation
        c.Status = 'Escalated';

        // Add escalation level to description for tracking
        String escalationNote = ESCALATION_PREFIX + 'Level ' + level + ' - ' + System.now().format();
        if (String.isBlank(c.Description)) {
            c.Description = escalationNote;
        } else {
            c.Description = escalationNote + '\n\n' + c.Description;
        }

        if (Schema.sObjectType.Case.isUpdateable()) {
            update c;
        }

        // Create escalation task for tracking
        createEscalationTask(c, level);

        // Notify escalation team
        notifyEscalationTeam(c);

        return c;
    }

    /**
     * Checks whether a case meets the criteria for escalation.
     * This replicates the entry criteria evaluation that happens in standard
     * Escalation Rules. Criteria can include:
     * - Case priority
     * - Case status
     * - Time since case creation
     * - Case type or category
     * - Whether the case is associated with an entitlement
     *
     * @param c The case to evaluate
     * @return True if the case meets escalation criteria
     */
    public static Boolean checkEscalationCriteria(Case c) {
        if (c == null) {
            return false;
        }

        // Criteria 1: High or Critical priority
        if (c.Priority == 'High' || c.Priority == 'Critical') {
            return true;
        }

        // Criteria 2: Status not updated in 24 hours (open cases)
        if (c.Status != 'Closed' && c.Status != 'Resolved') {
            if (c.LastModifiedDate != null) {
                Long hoursSinceUpdate = (System.now().getTime() - c.LastModifiedDate.getTime()) / 3600000;
                if (hoursSinceUpdate >= 24) {
                    return true;
                }
            }
        }

        // Criteria 3: SLA is about to breach (handled by EntitlementMilestoneService)
        if (c.EntitlementId != null) {
            List<CaseMilestone> openMilestones = [
                SELECT TargetDate
                FROM CaseMilestone
                WHERE CaseId = :c.Id
                AND IsCompleted = false
                AND IsViolated = false
                LIMIT 1
            ];

            if (!openMilestones.isEmpty()) {
                Datetime threshold = System.now().addMinutes(60);
                if (openMilestones[0].TargetDate <= threshold) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Sends notification to the escalation team when a case is escalated.
     * In Service Cloud, email alerts are a standard component of escalation rules.
     *
     * @param c The escalated case
     */
    public static void notifyEscalationTeam(Case c) {
        if (c == null) {
            return;
        }

        // Create a case comment for audit trail
        CaseComment comment = new CaseComment();
        comment.ParentId = c.Id;
        comment.CommentBody = 'Case has been escalated. Priority: ' + c.Priority +
                              '. Requires immediate attention from the escalation team.';
        comment.IsPublished = true;

        if (Schema.sObjectType.CaseComment.isCreateable()) {
            insert comment;
        }
    }

    /**
     * Bulk process to check and escalate multiple cases.
     * Critical for maintaining SLA compliance across the organization.
     *
     * @param cases List of cases to evaluate for escalation
     * @return List of cases that were escalated
     */
    public static List<Case> bulkEscalationCheck(List<Case> cases) {
        List<Case> escalatedCases = new List<Case>();

        if (cases == null || cases.isEmpty()) {
            return escalatedCases;
        }

        for (Case c : cases) {
            if (checkEscalationCriteria(c)) {
                escalatedCases.add(escalateCase(c, determineEscalationLevel(c)));
            }
        }

        return escalatedCases;
    }

    /**
     * Determines the appropriate escalation level based on case attributes.
     *
     * @param c The case to evaluate
     * @return The recommended escalation level
     */
    public static Integer determineEscalationLevel(Case c) {
        if (c == null) {
            return 1;
        }

        if (c.Priority == 'Critical') {
            return 3;
        }

        if (c.EntitlementId != null) {
            return 2;
        }

        return 1;
    }

    private static void createEscalationTask(Case c, Integer level) {
        Task t = new Task();
        t.Subject = 'Escalation Level ' + level + ' - Case: ' + c.CaseNumber;
        t.Status = 'Not Started';
        t.Priority = level >= 3 ? 'High' : 'Normal';
        t.WhatId = c.Id;
        t.Description = 'This case has been escalated to Level ' + level +
                         '. Immediate review required.';

        if (Schema.sObjectType.Task.isCreateable()) {
            insert t;
        }
    }
}
