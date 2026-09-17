// Entitlement, milestone & SLA compliance demo — Phase 4
// Run: sf apex run --file scripts/apex/sla-compliance.apex
Account acc = new Account(Name = 'SCC SLA Demo');
insert acc;

ServiceContract sc = new ServiceContract(
    Name = 'Premier Hardware Support',
    AccountId = acc.Id,
    StartDate = Date.today(),
    EndDate = Date.today().addMonths(12)
);
insert sc;

sc.Status = 'Activated';
update sc;

Entitlement ent = EntitlementMilestoneService.createEntitlement(acc.Id, 'Premium Support');
System.debug('Entitlement created: ' + ent.Id);

Case c = new Case(
    AccountId = acc.Id,
    EntitlementId = ent.Id,
    Subject = 'Broken gate motor',
    Priority = 'High',
    Origin = 'Phone',
    Status = 'Working',
    SLA_Reminder_Sent__c = false
);
insert c;

// Wait — milestones are auto-created by EntitlementTrigger on case creation.
List<CaseMilestone> ms = [SELECT Id, Name, TargetDate, MilestoneTypeId, MilestoneType.Name, IsCompleted
                          FROM CaseMilestone WHERE CaseId = :c.Id];
System.debug('Milestones for case: ' + ms.size());

// Compliance metrics
Decimal rate = SlaComplianceService.calculateComplianceRate(ent.Id);
System.debug('SLA compliance rate: ' + rate + '%');

List<CaseMilestone> over = SlaComplianceService.getOverdueMilestones();
System.debug('Overdue milestones org-wide: ' + over.size());