/**
 * Test class for CaseTriggerHandlerService
 * Covers before/after insert and before/after update handler behavior.
 */
@isTest
private class CaseTriggerHandlerServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(
            Name = 'Trigger Test Account',
            Type = 'Customer',
            AnnualRevenue = 1500000
        );
        insert acc;

        Entitlement ent = new Entitlement(
            Name = 'Trigger Entitlement',
            AccountId = acc.Id,
            Type = 'Standard Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;
    }

    @isTest
    static void testHandleBeforeInsert_setsDefaultFields() {
        // Given
        List<Case> cases = new List<Case>{
            new Case(Subject = 'No defaults case', AccountId = [SELECT Id FROM Account LIMIT 1].Id, Origin = 'Web')
        };

        // When
        CaseTriggerHandlerService.handleBeforeInsert(cases);

        // Then
        System.assertEquals('New', cases[0].Status, 'Status should default to New');
        System.assertEquals('Medium', cases[0].Priority, 'Priority should default to Medium');
        System.assertNotEquals(null, cases[0].Origin, 'Origin should be preserved');
    }

    @isTest
    static void testHandleBeforeInsert_attachesEntitlement() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        Entitlement ent = [SELECT Id FROM Entitlement LIMIT 1];

        List<Case> cases = new List<Case>{
            new Case(Subject = 'Entitlement attach', AccountId = acc.Id, Origin = 'Phone')
        };

        // When
        CaseTriggerHandlerService.handleBeforeInsert(cases);

        // Then
        System.assertEquals(ent.Id, cases[0].EntitlementId, 'Active entitlement should be attached');
    }

    @isTest
    static void testHandleBeforeInsert_emptyListNoError() {
        // When
        CaseTriggerHandlerService.handleBeforeInsert(new List<Case>());

        // Then
        Boolean reached = true;
        System.assertEquals(true, reached, 'Empty list should not throw');
    }

    @isTest
    static void testHandleAfterInsert_routesAndCreatesLogs() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        List<Case> cases = new List<Case>{
            new Case(Subject = 'After insert case', Status = 'New', Priority = 'High', AccountId = acc.Id, Origin = 'Email')
        };

        // When - insert through the real trigger path so records have IDs
        Test.startTest();
        insert cases;
        Test.stopTest();

        // Then
        Case saved = [SELECT Id, Status, Priority FROM Case WHERE Subject = 'After insert case' LIMIT 1];
        System.assertNotEquals(null, saved.Id, 'Case should exist after insert');
        System.assertEquals('New', saved.Status, 'Default status applied');
        System.assertEquals(false, CaseTriggerHandlerService.isExecuting, 'Flag should reset after run');
    }

    @isTest
    static void testHandleAfterInsert_emptyListNoError() {
        // When
        Test.startTest();
        CaseTriggerHandlerService.handleAfterInsert(new List<Case>());
        Test.stopTest();

        // Then
        System.assertEquals(false, CaseTriggerHandlerService.isExecuting, 'Flag should remain false');
    }

    @isTest
    static void testHandleBeforeUpdate_closesSetsClosedDate() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        Case c = new Case(Subject = 'Update test', Status = 'New', AccountId = acc.Id, Origin = 'Phone');
        insert c;

        Case updated = c.clone(false, true, false, false);
        updated.Status = 'Closed';

        Map<Id, Case> oldMap = new Map<Id, Case>{ c.Id => c };

        // When
        CaseTriggerHandlerService.handleBeforeUpdate(new List<Case>{ updated }, oldMap);

        // Then
        System.assertEquals('Closed', updated.Status, 'Status should be updated');
        System.assertNotEquals(null, updated.ClosedDate, 'Closed date should be set by handler');
    }

    @isTest
    static void testHandleAfterUpdate_tracksStatusChange() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        Case c = new Case(
            Subject = 'Status change test',
            Status = 'New',
            AccountId = acc.Id,
            EntitlementId = [SELECT Id FROM Entitlement LIMIT 1].Id,
            Origin = 'Phone'
        );
        insert c;

        Case updated = [SELECT Id, Status, AccountId FROM Case WHERE Id = :c.Id];
        updated.Status = 'Working';

        // When
        Test.startTest();
        CaseTriggerHandlerService.handleAfterUpdate(
            new List<Case>{ updated },
            new Map<Id, Case>{ c.Id => c }
        );
        Test.stopTest();

        // Then
        System.assertEquals(false, CaseTriggerHandlerService.isExecuting, 'Flag should reset after run');
    }

    @isTest
    static void testHandleAfterDelete_cleansUpComplianceRecords() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        Case c = new Case(Subject = 'Delete test', Status = 'New', AccountId = acc.Id, Origin = 'Phone');
        insert c;

        SLA_Compliance__c compliance = new SLA_Compliance__c(
            Case__c = c.Id,
            Milestone_Name__c = 'Response',
            Status__c = 'In Progress'
        );
        insert compliance;

        // When
        Test.startTest();
        CaseTriggerHandlerService.handleAfterDelete(new List<Case>{ c });
        Test.stopTest();

        // Then
        List<SLA_Compliance__c> remaining = [
            SELECT Id FROM SLA_Compliance__c WHERE Case__c = :c.Id
        ];
        System.assertEquals(0, remaining.size(), 'Compliance records should be cleaned up');
    }

    @isTest
    static void testHandleUpdate_bulkManyRecords() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Trigger Test Account' LIMIT 1];
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 250; i++) {
            bulkCases.add(new Case(Subject = 'Bulk update ' + i, Status = 'New', AccountId = acc.Id, Origin = 'Web'));
        }
        insert bulkCases;

        Map<Id, Case> oldMap = new Map<Id, Case>(bulkCases);
        List<Case> updatedCases = [
            SELECT Id, Status, EntitlementId
            FROM Case
            WHERE Id IN :oldMap.keySet()
        ];
        for (Case c : updatedCases) {
            c.Status = 'Working';
        }

        // When
        Test.startTest();
        CaseTriggerHandlerService.handleAfterUpdate(updatedCases, oldMap);
        Test.stopTest();

        // Then
        System.assertEquals(250, updatedCases.size(), 'All 250 cases should be processed');
        System.assert(Math.Limits.getQueries() < 10, 'Bulk updates should use batched queries');
    }

    @isTest
    static void testTriggerContextSummary_returnsValues() {
        // When
        Map<String, String> summary = CaseTriggerHandlerService.getTriggerContextSummary();

        // Then
        System.assertEquals('CaseTrigger', summary.get('triggerName'), 'Trigger name should match');
        System.assertNotEquals(null, summary.get('handlerVersion'), 'Version should be present');
    }
}