// Case lifecycle demo — Phase 2 / CaseTrigger + CaseProcessService
// Run: sf apex run --file scripts/apex/case-lifecycle.apex
Account acc = new Account(Name = 'SCC Lifecycle Demo');
insert acc;

Contact con = new Contact(FirstName = 'Dana', LastName = 'Demos', AccountId = acc.Id);
insert con;

Case c = new Case(
    AccountId = acc.Id,
    ContactId = con.Id,
    Subject = 'Cannot receive order updates',
    Priority = 'High',
    Origin = 'Email',
    Status = 'New'
);
insert c;

Case inserted = [SELECT Id, Subject, Status, Priority, CaseNumber FROM Case WHERE Id = :c.Id];
System.debug('Case created: ' + inserted.CaseNumber + ' (' + inserted.Status + ')');

// Merge two duplicates via the service layer
Case dup = new Case(
    AccountId = acc.Id,
    ContactId = con.Id,
    Subject = 'Same issue via web form',
    Origin = 'Web',
    Status = 'New'
);
insert dup;

String mergedId = CaseProcessService.mergeCases(c.Id, new List<Id>{ dup.Id });
System.debug('Merged into: ' + mergedId);

// Route by priority through the service layer
CaseRoutingService.routeByPriority(new List<Case>{ inserted });
System.debug('Routing complete — case is ' + inserted.Priority + ', see Service_Routing_Log__c.');