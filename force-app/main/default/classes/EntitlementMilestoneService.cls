/**
 * Service Cloud Consultant Learning Project - Entitlement & Milestone Service
 * ============================================================================
 * EXAM CONCEPT: Entitlement Management & Milestones (Blueprint Domain: 16%)
 *
 * This class demonstrates how entitlements and milestones work in Service Cloud.
 * Entitlements define the level of support a customer is entitled to, while
 * milestones represent the specific steps or timeframes within an entitlement process.
 *
 * KEY LEARNING POINTS:
 * 1. Entitlement types: Response-based, Time-based, and Milestone-based
 * 2. How entitlement processes define milestone sequences
 * 3. Milestone tracker and its relationship to SLA compliance
 * 4. Entitlement assignment: Account-based vs Asset-based vs Contact-based
 * 5. The link between Entitlements, Assets, and Service Contracts
 *
 * RELATED EXAM TOPICS:
 * - Setting up Entitlement Processes
 * - Configuring Milestones within Entitlement Processes
 * - Entitlement templates and how they're applied to new cases
 * - How entitlement status affects case management
 * - Milestones and business hours
 * ============================================================================
 */
public with sharing class EntitlementMilestoneService {

    private static final String STANDARD_ENTITLEMENT_TYPE = 'Standard Support';
    private static final String PREMIUM_ENTITLEMENT_TYPE = 'Premium Support';
    private static final String SLA_4_HOURS = '4 Hour Response';

    /**
     * Creates an entitlement record for an account with the specified type.
     * In Service Cloud, entitlements are created when:
     * - A customer purchases a support contract
     * - An account is created with an entitlement template
     * - A Service Contract is activated with an associated entitlement
     *
     * This method demonstrates Account-based entitlement creation, which is
     * the most common pattern in Service Cloud implementations.
     *
     * @param accountId The account to create the entitlement for
     * @param type The type of entitlement ('Standard Support' or 'Premium Support')
     * @return The created Entitlement record
     */
    public static Entitlement createEntitlement(Id accountId, String type) {
        if (accountId == null) {
            throw new IllegalArgumentException('Account ID cannot be null');
        }

        Entitlement ent = new Entitlement();
        ent.AccountId = accountId;
        ent.Name = type != null ? type + ' - ' + System.today() : STANDARD_ENTITLEMENT_TYPE + ' - ' + System.today();
        ent.StartDate = System.today();
        ent.EndDate = System.today().addYears(1);
        ent.Type = type != null ? type : STANDARD_ENTITLEMENT_TYPE;

        // Set the status - 'Active' means entitlement can be applied to cases
        ent.Status = 'Active';

        if (Schema.sObjectType.Entitlement.isCreateable()) {
            insert ent;
        }

        return ent;
    }

    /**
     * Checks the milestone status for a given case.
     * The Milestone Tracker on the Case page layout shows real-time milestone
     * status. This method replicates that logic programmatically.
     *
     * Key concept: Milestones can have statuses of:
     * - Not Started: Milestone not yet triggered
     * - In Progress: Milestone timer is running
     * - Completed: Milestone criteria met within timeframe
     * - Breached: Milestone timeframe exceeded
     *
     * @param caseId The case to check milestone status for
     * @return List of CaseMilestone records with their current status
     */
    public static List<CaseMilestone> checkMilestoneStatus(Id caseId) {
        if (caseId == null) {
            return new List<CaseMilestone>();
        }

        List<CaseMilestone> milestones = [
            SELECT Id, MilestoneType.Name, StartDate, TargetDate,
                   CompletionDate, IsCompleted, IsViolated, TimeRemaining
            FROM CaseMilestone
            WHERE CaseId = :caseId
            ORDER BY TargetDate ASC
        ];

        return milestones;
    }

    /**
     * Escalates a case when a milestone is about to be breached or has been breached.
     * This is a core Service Cloud concept - escalation rules can be configured
     * to automatically escalate cases based on time-based criteria.
     *
     * In this implementation, we check if any open milestone is within 30 minutes
     * of its target date and escalate accordingly.
     *
     * Escalation concepts for the exam:
     * - Escalation rules have entries with criteria and escalation actions
     * - Escalation actions can change case owner, send emails, and update fields
     * - Escalation rules are evaluated in order; first match wins
     * - Business hours affect when escalation timers run
     *
     * @param caseId The case to check for escalation
     * @return True if the case was escalated, false otherwise
     */
    public static Boolean escalateOnMilestoneBreach(Id caseId) {
        if (caseId == null) {
            return false;
        }

        List<CaseMilestone> openMilestones = [
            SELECT Id, TargetDate, IsCompleted, IsViolated
            FROM CaseMilestone
            WHERE CaseId = :caseId
            AND IsCompleted = false
            AND IsViolated = false
        ];

        Boolean needsEscalation = false;
        Datetime escalationThreshold = System.now().addMinutes(30);

        for (CaseMilestone milestone : openMilestones) {
            if (milestone.TargetDate <= escalationThreshold) {
                needsEscalation = true;
                break;
            }
        }

        if (needsEscalation) {
            Case caseRecord = [
                SELECT Id, OwnerId, Priority, Status, EntitlementId
                FROM Case
                WHERE Id = :caseId
                LIMIT 1
            ];

            // Escalate by bumping priority and changing ownership
            caseRecord.Priority = 'High';
            caseRecord.Status = 'Escalated';

            if (Schema.sObjectType.Case.isUpdateable()) {
                update caseRecord;
            }

            // Notify the escalation team
            notifyEscalationTeam(caseRecord);
        }

        return needsEscalation;
    }

    /**
     * Validates that an account meets the criteria for a given entitlement type.
     * Useful for ensuring data integrity when creating entitlements.
     *
     * @param accountId The account to validate
     * @param entitlementType The desired entitlement type
     * @return True if the account qualifies for the entitlement type
     */
    public static Boolean validateEntitlementQualification(Id accountId, String entitlementType) {
        if (accountId == null || String.isBlank(entitlementType)) {
            return false;
        }

        Account acct = [
            SELECT Id, Type, Industry, AnnualRevenue, CustomerPriority__c
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];

        if (entitlementType == PREMIUM_ENTITLEMENT_TYPE) {
            return acct.AnnualRevenue != null && acct.AnnualRevenue >= 1000000;
        }

        return true;
    }

    private static void notifyEscalationTeam(Case caseRecord) {
        // In a real implementation, this would send email or use Platform Events
        // For learning purposes, we create a task for the escalation team
        Task escalationTask = new Task();
        escalationTask.Subject = 'ESCALATION: Case ' + caseRecord.Id + ' approaching SLA breach';
        escalationTask.Status = 'Not Started';
        escalationTask.Priority = 'High';
        escalationTask.WhatId = caseRecord.Id;
        escalationTask.Description = 'Case requires immediate attention due to approaching milestone breach.';

        if (Schema.sObjectType.Task.isCreateable()) {
            insert escalationTask;
        }
    }
}
