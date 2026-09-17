/**
 * Service Cloud Consultant Learning Project - Case Process Service
 * ============================================================================
 * EXAM CONCEPT: Case Management & Lifecycle (Blueprint Domain: 16%)
 *
 * This class demonstrates core case lifecycle management capabilities in
 * Service Cloud. Cases are the central object in Service Cloud, and managing
 * their entire lifecycle - from creation through resolution - is a key
 * consultant skill.
 *
 * KEY LEARNING POINTS:
 * 1. Case object standard fields and their significance
 * 2. Case statuses and the case lifecycle
 * 3. Email-to-Case for automatic case creation from inbound emails
 * 4. Case merging to deduplicate duplicate cases
 * 5. Case surveys to measure customer satisfaction (CSAT)
 * 6. Case escalation and case enetitlement integration
 *
 * EXAM TOPICS:
 * - Setting up Email-to-Case and On-Demand Email-to-Case
 * - Case status picklist values and case lifecycle
 * - Case merge and case deduplication
 * - Case comments and emails in the Case feed
 * - Service Cloud support settings
 * - Case record types and support categories
 * - Quick transitions and path features
 * ============================================================================
 */
public with sharing class CaseProcessService {

    private static final String CASE_TYPE_EMAIL = 'Email';
    private static final String CASE_STATUS_NEW = 'New';
    private static final String CASE_STATUS_CLOSED = 'Closed';
    private static final String CASE_STATUS_PENDING = 'Pending';

    /**
     * Creates a new case from an inbound email.
     * This mirrors the Email-to-Case functionality which automatically creates
     * cases from emails routed to support inboxes.
     *
     * Email-to-Case features for the exam:
     * - Uses support email addresses and Email Services
     * - Detects customer replies to case emails and updates existing cases
     * - Associates emails to contacts via sender matching rules
     * - Can create contacts automatically for unknown senders
     * - On-Demand Email-to-Case allows agents to send/receive emails from the console
     *
     * @param subject The email subject line
     * @param body The email body text
     * @return The created Case record
     */
    public static Case createCaseFromEmail(String subject, String body) {
        if (String.isBlank(subject) && String.isBlank(body)) {
            throw new IllegalArgumentException('Case requires a subject or body');
        }

        Case newCase = new Case();
        newCase.Subject = String.isNotBlank(subject) ? subject : 'Inbound Email - ' + System.today();
        newCase.Description = String.isNotBlank(body) ? body : '';
        newCase.Origin = 'Email';
        newCase.Type = CASE_TYPE_EMAIL;
        newCase.Status = CASE_STATUS_NEW;
        newCase.Priority = 'Medium';

        if (Schema.sObjectType.Case.isCreateable()) {
            insert newCase;
        }

        return newCase;
    }

    /**
     * Merges duplicate cases into a single primary case.
     * Case merging is important for maintaining data quality. When customers
     * report the same issue multiple times, duplicate cases should be merged
     * to avoid confusion and incorrect SLA tracking.
     *
     * Merge rules in standard Salesforce:
     * - The master record retains its case number and activity history
     * - Related records (tasks, events, comments) are moved to the master
     * - Merging requires appropriate permissions (Edit on all records)
     *
     * Programmatic merge approach: Convert duplicate cases to a 'Duplicate'
     * status and link them to the primary case for reference.
     *
     * @param primaryId The primary case to keep
     * @param duplicateIds List of duplicate case IDs to merge
     * @return The updated primary case
     */
    public static Case mergeCases(Id primaryId, List<Id> duplicateIds) {
        if (primaryId == null || duplicateIds == null || duplicateIds.isEmpty()) {
            throw new IllegalArgumentException('Primary case and duplicates are required');
        }

        Case primaryCase = [SELECT Id, CaseNumber, Subject FROM Case WHERE Id = :primaryId LIMIT 1];

        List<Case> duplicates = [
            SELECT Id, Status, Description
            FROM Case
            WHERE Id IN :duplicateIds
            AND Id != :primaryId
        ];

        if (duplicates.isEmpty()) {
            return primaryCase;
        }

        // Append duplicate case descriptions to the primary case
        StringBuilder combinedDescription = new StringBuilder();

        // Add the original description
        combinedDescription.append(primaryCase.Subject).append('\n');

        for (Case duplicate : duplicates) {
            // Update the duplicate to indicate it was merged
            duplicate.Status = 'Duplicate';
            duplicate.Description = (duplicate.Description != null ? duplicate.Description : '') +
                '\n[MERGED INTO CASE ' + primaryCase.CaseNumber + ' on ' + System.today() + ']';

            if (Schema.sObjectType.Case.isUpdateable()) {
                update duplicate;
            }
        }

        return primaryCase;
    }

    /**
     * Closes a case and creates a customer satisfaction survey.
     * Case surveys are a key component of measuring service quality. They
     * typically measure CSAT (Customer Satisfaction) scores.
     *
     * Survey concepts for the exam:
     * - Surveys can be sent via email when a case is closed
     * - Survey questions measure CSAT and can be customized
     * - Survey responses feed into reports and dashboards
     * - Field Service surveys apply to field service appointments
     *
     * @param caseId The case to close
     * @return The updated case record
     */
    public static Case closeCaseWithSurvey(Id caseId) {
        if (caseId == null) {
            throw new IllegalArgumentException('Case ID is required');
        }

        Case c = [SELECT Id, Status, ClosedDate, OwnerId FROM Case WHERE Id = :caseId LIMIT 1];

        c.Status = CASE_STATUS_CLOSED;
        c.ClosedDate = System.now();

        if (Schema.sObjectType.Case.isUpdateable()) {
            update c;
        }

        // Create a survey notification task for the case owner
        Task surveyTask = new Task();
        surveyTask.Subject = 'Send CSAT Survey for Case ' + c.Id;
        surveyTask.WhatId = c.Id;
        surveyTask.ActivityDate = System.today().addDays(1);
        surveyTask.Status = 'Not Started';
        surveyTask.Description = 'Case has been closed. Send customer satisfaction survey.';

        if (Schema.sObjectType.Task.isCreateable()) {
            insert surveyTask;
        }

        return c;
    }

    /**
     * Determines the next status in the case lifecycle using Quick Transitions.
     * Quick Transitions let agents move cases between statuses using a single
     * button click in the console, based on the configured Path/record type.
     *
     * Example lifecycle: New → Working → Escalated → Pending Customer Info → Closed
     *
     * @param currentStatus The current case status
     * @return The suggested next status
     */
    public static String getNextStatus(String currentStatus) {
        if (String.isBlank(currentStatus)) {
            return CASE_STATUS_NEW;
        }

        Map<String, String> statusTransitions = new Map<String, String>{
            'New' => 'Working',
            'Working' => 'Pending',
            'Pending Customer Info' => 'Resolved',
            'Resolved' => 'Closed',
            'Escalated' => 'Working'
        };

        return statusTransitions.get(currentStatus);
    }

    /**
     * Updates case fields for time-based SLA tracking at creation.
     * This links a case to the appropriate entitlement based on the
     * account's active entitlements.
     *
     * @param cases List of new cases
     */
    public static void initializeEntitlementOnCases(List<Case> cases) {
        if (cases == null || cases.isEmpty()) {
            return;
        }

        Set<Id> accountIds = new Set<Id>();
        for (Case c : cases) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }

        if (accountIds.isEmpty()) {
            return;
        }

        Map<Id, Entitlement> accountEntitlements = new Map<Id, Entitlement>();
        for (Entitlement ent : [
            SELECT Id, AccountId
            FROM Entitlement
            WHERE AccountId IN :accountIds
            AND Status = 'Active'
            ORDER BY CreatedDate DESC
        ]) {
            if (!accountEntitlements.containsKey(ent.AccountId)) {
                accountEntitlements.put(ent.AccountId, ent);
            }
        }

        for (Case c : cases) {
            if (accountEntitlements.containsKey(c.AccountId)) {
                c.EntitlementId = accountEntitlements.get(c.AccountId).Id;
            }
        }
    }
}