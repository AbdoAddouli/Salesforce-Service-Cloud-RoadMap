/**
 * CaseCommentTrigger - Creates a follow-up Task for the case owner when a
 * published comment is added. Keeps the service team informed of customer
 * interactions without manual monitoring.
 *
 * EXAM TOPIC: Case Management (Blueprint 16%)
 */
trigger CaseCommentTrigger on CaseComment (after insert) {

    if (TriggerHandlerService.shouldRun('CaseCommentTrigger')) {
        Map<Id, Case> commentCases = new Map<Id, Case>();
        Set<Id> caseIds = new Set<Id>();

        for (CaseComment cc : Trigger.new) {
            if (cc.IsPublished) {
                caseIds.add(cc.ParentId);
            }
        }

        if (caseIds.isEmpty()) {
            return;
        }

        for (Case c : [SELECT Id, OwnerId, Subject FROM Case WHERE Id IN :caseIds]) {
            commentCases.put(c.Id, c);
        }

        List<Task> tasksToCreate = new List<Task>();

        for (CaseComment cc : Trigger.new) {
            Case linkedCase = commentCases.get(cc.ParentId);
            if (linkedCase == null) continue;

            Task t = new Task();
            t.Subject = 'Customer comment received on case ' + linkedCase.Subject;
            t.OwnerId = linkedCase.OwnerId;
            t.WhatId = linkedCase.Id;
            t.Status = 'Not Started';
            t.Priority = 'Normal';
            t.Description = 'A new published comment was added to this case. Review and respond as needed.';
            tasksToCreate.add(t);
        }

        if (!tasksToCreate.isEmpty() && Schema.sObjectType.Task.isCreateable()) {
            insert tasksToCreate;
        }
    }
}