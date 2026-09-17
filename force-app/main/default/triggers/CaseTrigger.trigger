/**
 * CaseTrigger - Delegates all Case lifecycle logic to CaseTriggerHandlerService.
 * Follows the "one trigger per object" best practice.
 *
 * EXAM TOPIC: Triggers and Order of Execution (Blueprint 8%)
 */
trigger CaseTrigger on Case (before insert, before update, after insert, after update) {

    if (TriggerHandlerService.shouldRun('CaseTrigger')) {
        switch on Trigger.operationType {
            when BEFORE_INSERT {
                CaseTriggerHandlerService.handleBeforeInsert(Trigger.new);
            }
            when BEFORE_UPDATE {
                CaseTriggerHandlerService.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
            }
            when AFTER_INSERT {
                CaseTriggerHandlerService.handleAfterInsert(Trigger.new);
            }
            when AFTER_UPDATE {
                CaseTriggerHandlerService.handleAfterUpdate(Trigger.new, Trigger.oldMap);
            }
        }
    }
}