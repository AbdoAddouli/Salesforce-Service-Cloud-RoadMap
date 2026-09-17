/**
 * MilestoneTrigger - Tracks milestone completion on update.
 * When a CaseMilestone is completed, we update related compliance records so
 * SLA analytics remain accurate.
 *
 * EXAM TOPIC: Milestones within Entitlement Processes (Blueprint 16%)
 */
trigger MilestoneTrigger on CaseMilestone (after update) {

    if (TriggerHandlerService.shouldRun('MilestoneTrigger')) {
        Set<Id> caseIds = new Set<Id>();

        for (Integer i = 0; i < Trigger.new.size(); i++) {
            CaseMilestone cm = Trigger.new[i];
            CaseMilestone oldCm = Trigger.old[i];

            if (cm.IsCompleted && !oldCm.IsCompleted) {
                caseIds.add(cm.CaseId);
            }
        }

        if (!caseIds.isEmpty()) {
            // Refresh compliance records for the affected cases (single batched query)
            List<SLA_Compliance__c> inProgress = [
                SELECT Id, Status__c
                FROM SLA_Compliance__c
                WHERE Case__c IN :caseIds
                AND Status__c = 'In Progress'
            ];

            for (SLA_Compliance__c rec : inProgress) {
                rec.Status__c = 'Met';
            }

            if (!inProgress.isEmpty() && Schema.sObjectType.SLA_Compliance__c.isUpdateable()) {
                update inProgress;
            }
        }
    }
}