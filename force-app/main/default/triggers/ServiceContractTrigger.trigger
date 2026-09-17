/**
 * ServiceContractTrigger - Validates ServiceContract dates before insert.
 * A Service Contract in Service Cloud is linked to entitlements; its start
 * date must be on or before its end date for the contract to be valid.
 *
 * EXAM TOPIC: Service Contracts & Entitlements (Blueprint 16%)
 */
trigger ServiceContractTrigger on ServiceContract (before insert) {

    if (TriggerHandlerService.shouldRun('ServiceContractTrigger')) {
        List<String> errors = new List<String>();

        for (ServiceContract sc : Trigger.new) {
            if (sc.StartDate != null && sc.EndDate != null && sc.StartDate > sc.EndDate) {
                sc.addError('Start Date (' + sc.StartDate + ') cannot be after End Date (' + sc.EndDate + '). ' +
                    'Service contracts must have valid date ranges.');
            }

            if (String.isBlank(sc.Name)) {
                sc.Name = 'Service Contract - ' + System.today();
            }
        }
    }
}