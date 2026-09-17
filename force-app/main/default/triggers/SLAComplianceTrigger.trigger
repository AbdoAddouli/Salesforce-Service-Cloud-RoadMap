/**
 * SLAComplianceTrigger - Recalculates SLA metrics when a CaseMilestone is
 * updated. Keeps the SLA_Compliance__c tracking records in sync with the
 * actual milestone state.
 *
 * EXAM TOPIC: SLA Management & Metrics (Blueprint 16%)
 */
trigger SLAComplianceTrigger on CaseMilestone (after update) {

    if (TriggerHandlerService.shouldRun('SLAComplianceTrigger')) {
        Set<Id> affectedCases = new Set<Id>();
        List<SLA_Compliance__c> recordsToUpsert = new List<SLA_Compliance__c>();

        for (CaseMilestone cm : Trigger.new) {
            affectedCases.add(cm.CaseId);
        }

        if (affectedCases.isEmpty()) {
            return;
        }

        // Build a current snapshot of milestone state per case
        Map<Id, List<CaseMilestone>> caseMilestones = new Map<Id, List<CaseMilestone>>();
        for (CaseMilestone cm : [
            SELECT Id, CaseId, IsViolated, IsCompleted, MilestoneType.Name
            FROM CaseMilestone
            WHERE CaseId IN :affectedCases
        ]) {
            if (!caseMilestones.containsKey(cm.CaseId)) {
                caseMilestones.put(cm.CaseId, new List<CaseMilestone>());
            }
            caseMilestones.get(cm.CaseId).add(cm);
        }

        // Remove stale records and re-create fresh snapshot records
        List<SLA_Compliance__c> existing = [
            SELECT Id FROM SLA_Compliance__c WHERE Case__c IN :affectedCases
        ];
        if (!existing.isEmpty() && Schema.sObjectType.SLA_Compliance__c.isDeletable()) {
            delete existing;
        }

        for (Id caseId : caseMilestones.keySet()) {
            for (CaseMilestone cm : caseMilestones.get(caseId)) {
                SLA_Compliance__c rec = new SLA_Compliance__c(
                    Case__c = caseId,
                    Milestone_Name__c = cm.MilestoneType.Name,
                    Is_Breached__c = cm.IsViolated,
                    Status__c = cm.IsCompleted
                        ? (cm.IsViolated ? 'Breached' : 'Met')
                        : 'In Progress'
                );
                recordsToUpsert.add(rec);
            }
        }

        if (!recordsToUpsert.isEmpty() && Schema.sObjectType.SLA_Compliance__c.isCreateable()) {
            insert recordsToUpsert;
        }
    }
}