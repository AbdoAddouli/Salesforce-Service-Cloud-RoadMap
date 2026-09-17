/**
 * EntitlementTrigger - Sets a default status on new entitlements if missing.
 * Entitlements are the heart of Service Cloud SLA tracking; a valid status
 * ('Active') is required for the entitlement to be applied to cases.
 *
 * EXAM TOPIC: Entitlement Management (Blueprint 16%)
 */
trigger EntitlementTrigger on Entitlement (before insert, before update) {

    if (TriggerHandlerService.shouldRun('EntitlementTrigger')) {
        switch on Trigger.operationType {
            when BEFORE_INSERT, BEFORE_UPDATE {
                for (Entitlement ent : Trigger.new) {
                    if (String.isBlank(ent.Status)) {
                        ent.Status = 'Active';
                    }

                    if (ent.StartDate == null) {
                        ent.StartDate = System.today();
                    }

                    if (ent.EndDate == null) {
                        ent.EndDate = System.today().addYears(1);
                    }
                }
            }
        }
    }
}