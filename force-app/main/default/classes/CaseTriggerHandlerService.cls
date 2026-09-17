/**
 * Service Cloud Consultant Learning Project - Trigger Handler Service
 * ============================================================================
 * EXAM CONCEPT: Trigger Framework & Best Practices (Blueprint Domain: 8%)
 *
 * This class implements a service-layer trigger handler pattern. Rather than
 * putting logic directly in the trigger, logic is delegated to a service class.
 * This is considered a Salesforce best practice because:
 *
 * 1. Most logic should reside in Apex classes, not triggers
 * 2. Service classes can be unit tested independently
 * 3. Logic can be reused by other callers (flows, REST APIs, etc.)
 * 4. Trigger logic is kept lean and declarative
 *
 * TRIGGER DESIGN PATTERN (single trigger per object):
 * - One trigger per object
 * - All logic in a handler service class
 * - TriggerContext utility to manage trigger variables
 *
 * EXAM TOPICS:
 * - Trigger context variables (Trigger.new, Trigger.old, Trigger.newMap, etc.)
 * - Bulk-safe triggers (handling 200+ records)
 * - Avoiding recursion with static flags
 * - Governor limits and best practices in triggers
 * - CRUD and FLS enforcement
 * - Order of execution
 * ============================================================================
 */
public inherited sharing class CaseTriggerHandlerService {

    /**
     * Static flag to prevent recursive trigger execution.
     * This is a common pattern to avoid infinite loops when trigger logic
     * performs DML which re-triggers the handler.
     */
    public static Boolean isExecuting = false;

    /**
     * Handles pre-insert logic for cases. This runs before the records are
     * saved to the database, so no IDs are available yet.
     *
     * Common pre-insert use cases:
     * - Set default field values (priority, status, SLA)
     * - Link cases to entitlements
     * - Set ownership/assignment
     *
     * @param cases List of new cases being inserted
     */
    public static void handleBeforeInsert(List<Case> cases) {
        if (cases == null || cases.isEmpty()) {
            return;
        }

        // Set default status if not provided
        for (Case c : cases) {
            if (String.isBlank(c.Status)) {
                c.Status = 'New';
            }

            if (String.isBlank(c.Priority)) {
                c.Priority = 'Medium';
            }

            if (String.isBlank(c.Origin)) {
                c.Origin = 'Phone';
            }
        }

        // Link cases to valid active entitlements
        CaseProcessService.initializeEntitlementOnCases(cases);
    }

    /**
     * Handles after-insert logic for cases. Runs after records are saved,
     * so record IDs are available.
     *
     * Common after-insert use cases:
     * - Route cases to queues or agents
     * - Create related records (tasks, cases comments)
     * - Send notifications
     *
     * @param cases List of newly inserted cases
     */
    public static void handleAfterInsert(List<Case> cases) {
        if (cases == null || cases.isEmpty()) {
            return;
        }

        isExecuting = true;

        try {
            // Route cases based on priority
            List<Case> routedCases = CaseRoutingService.routeByPriority(cases);

            if (!routedCases.isEmpty() && Schema.sObjectType.Case.isUpdateable()) {
                update routedCases;
            }

            // Auto-escalate if SLA criteria met
            for (Case c : cases) {
                if (EntitlementMilestoneService.escalateOnMilestoneBreach(c.Id)) {
                    continue;
                }
            }
        } finally {
            isExecuting = false;
        }
    }

    /**
     * Handles after-update logic for cases.
     *
     * @param newCases Map of updated cases (new version)
     * @param oldMap Map of original cases (old version)
     */
    public static void handleAfterUpdate(List<Case> newCases, Map<Id, Case> oldMap) {
        if (newCases == null || newCases.isEmpty() || oldMap == null) {
            return;
        }

        isExecuting = true;

        try {
            List<Case> newStatusCases = new List<Case>();
            Set<Id> caseIds = new Set<Id>();

            for (Case c : newCases) {
                Case old = oldMap.get(c.Id);
                if (old == null) continue;

                // Track status changes
                if (c.Status != old.Status) {
                    System.debug('Case ' + c.Id + ' changed status from ' + old.Status + ' to ' + c.Status);
                    newStatusCases.add(c);
                }

                if (c.IsClosed) {
                    caseIds.add(c.Id);
                }
            }

            // If the case was closed, check SLA compliance
            if (!caseIds.isEmpty()) {
                SlaComplianceService.createComplianceRecords(new List<Id>(caseIds).get(0));
            }
        } finally {
            isExecuting = false;
        }
    }

    /**
     * Handles before-update logic for cases.
     *
     * @param newCases List of updated cases
     * @param oldMap Map of original case values
     */
    public static void handleBeforeUpdate(List<Case> newCases, Map<Id, Case> oldMap) {
        if (newCases == null || newCases.isEmpty() || oldMap == null) {
            return;
        }

        for (Case c : newCases) {
            Case old = oldMap.get(c.Id);
            if (old == null) continue;

            // Set ClosedDate when closing a case
            if (c.Status == 'Closed' && c.ClosedDate == null) {
                c.ClosedDate = System.now();
            }

            // Re-open case should clear resolution fields
            if (old.Status == 'Closed' && c.Status != 'Closed' && c.IsClosed == false) {
                c.Resolution__c = null;
                c.Resolution_Summary__c = null;
            }
        }
    }

    /**
     * Handles after-delete logic (provided for completeness).
     *
     * @param oldCases List of deleted cases
     */
    public static void handleAfterDelete(List<Case> oldCases) {
        if (oldCases == null || oldCases.isEmpty()) {
            return;
        }

        // Clean up related tracking records when cases are deleted
        Set<Id> caseIds = new Map<Id, Case>(oldCases).keySet();

        List<SLA_Compliance__c> complianceRecords = [
            SELECT Id FROM SLA_Compliance__c WHERE Case__c IN :caseIds
        ];

        if (!complianceRecords.isEmpty() && Schema.sObjectType.SLA_Compliance__c.isDeletable()) {
            delete complianceRecords;
        }
    }

    /**
     * Provides a summary of trigger context values for debugging.
     *
     * @return Map of context variable names to values
     */
    public static Map<String, String> getTriggerContextSummary() {
        Map<String, String> summary = new Map<String, String>();
        summary.put('isExecuting', String.valueOf(isExecuting));
        summary.put('triggerName', 'CaseTrigger');
        summary.put('handlerVersion', '1.0.0');
        return summary;
    }
}