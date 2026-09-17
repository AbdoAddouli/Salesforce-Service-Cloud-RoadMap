/**
 * Test class for CaseProcessService
 * Covers case creation from email, merging, closing with survey, and status transitions.
 */
@isTest
private class CaseProcessServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Case Process Test Account', Type = 'Customer', AnnualRevenue = 2000000);
        insert acc;

        Entitlement ent = new Entitlement(
            Name = 'Process Entitlement',
            AccountId = acc.Id,
            Type = 'Standard Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;

        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < 3; i++) {
            cases.add(new Case(
                Subject = 'Process case ' + i,
                Status = 'New',
                Priority = 'Medium',
                AccountId = acc.Id,
                EntitlementId = ent.Id,
                Origin = 'Phone'
            ));
        }
        insert cases;
    }

    @isTest
    static void testCreateCaseFromEmail_happyPath() {
        // When
        Test.startTest();
        Case created = CaseProcessService.createCaseFromEmail('Password reset request', 'Customer cannot reset password.');
        Test.stopTest();

        // Then
        System.assertEquals('Password reset request', created.Subject, 'Subject should be preserved');
        System.assertEquals('Email', created.Type, 'Type should be Email');
        System.assertEquals('New', created.Status, 'New case should have New status');
        System.assertNotEquals(null, created.Id, 'Case should be persisted');
    }

    @isTest
    static void testCreateCaseFromEmail_throwsOnBlankInput() {
        // Given
        Boolean thrown = false;
        try {
            CaseProcessService.createCaseFromEmail('', '');
        } catch (IllegalArgumentException e) {
            thrown = true;
        }

        // Then
        System.assertEquals(true, thrown, 'Blank subject and body should throw');
    }

    @isTest
    static void testCreateCaseFromEmail_blankSubjectUsesFallback() {
        // When
        Case created = CaseProcessService.createCaseFromEmail(null, 'Body only email');

        // Then
        System.assertNotEquals(null, created.Subject, 'Subject should fall back to default');
        System.assertEquals('Body only email', created.Description, 'Body should be preserved as description');
    }

    @isTest
    static void testMergeCases_marksDuplicates() {
        // Given
        Case primary = [SELECT Id, CaseNumber, Subject FROM Case WHERE Subject = 'Process case 0' LIMIT 1];
        Case dup1 = [SELECT Id, Status FROM Case WHERE Subject = 'Process case 1' LIMIT 1];
        Case dup2 = [SELECT Id, Status FROM Case WHERE Subject = 'Process case 2' LIMIT 1];

        // When
        Test.startTest();
        Case merged = CaseProcessService.mergeCases(primary.Id, new List<Id>{ dup1.Id, dup2.Id });
        Test.stopTest();

        // Then
        System.assertEquals(primary.Id, merged.Id, 'Primary case should be returned');
        List<Case> duplicates = [SELECT Id, Status FROM Case WHERE Id IN (:dup1.Id, :dup2.Id)];
        for (Case dup : duplicates) {
            System.assertEquals('Duplicate', dup.Status, 'Duplicate should be marked Duplicate');
        }
    }

    @isTest
    static void testMergeCases_throwsOnEmptyDuplicates() {
        // Given
        Case primary = [SELECT Id FROM Case WHERE Subject = 'Process case 0' LIMIT 1];

        Boolean thrown = false;
        try {
            CaseProcessService.mergeCases(primary.Id, new List<Id>());
        } catch (IllegalArgumentException e) {
            thrown = true;
        }

        System.assertEquals(true, thrown, 'Empty duplicate list should throw');
    }

    @isTest
    static void testCloseCaseWithSurvey_setsClosedStatus() {
        // Given
        Case c = [SELECT Id, Status FROM Case WHERE Subject = 'Process case 1' LIMIT 1];

        // When
        Test.startTest();
        Case closed = CaseProcessService.closeCaseWithSurvey(c.Id);
        Test.stopTest();

        // Then
        System.assertEquals('Closed', closed.Status, 'Case should be closed');
        System.assertNotEquals(null, closed.ClosedDate, 'Closed date should be set');
    }

    @isTest
    static void testCloseCaseWithSurvey_createsSurveyTask() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Process case 2' LIMIT 1];

        // When
        Test.startTest();
        CaseProcessService.closeCaseWithSurvey(c.Id);
        Test.stopTest();

        // Then
        List<Task> tasks = [SELECT Id, Subject FROM Task WHERE WhatId = :c.Id];
        System.assertNotEquals(0, tasks.size(), 'Closing should create a survey task');
    }

    @isTest
    static void testGetNextStatus_validTransition() {
        // When
        String next = CaseProcessService.getNextStatus('Working');

        // Then
        System.assertEquals('Pending', next, 'Working should transition to Pending');
    }

    @isTest
    static void testGetNextStatus_blankInputReturnsNew() {
        // When
        String next = CaseProcessService.getNextStatus('');

        // Then
        System.assertEquals('New', next, 'Blank status should default to New');
    }

    @isTest
    static void testInitializeEntitlementOnCases_assignsEntitlement() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Case Process Test Account' LIMIT 1];

        List<Case> newCases = new List<Case>();
        for (Integer i = 0; i < 80; i++) {
            newCases.add(new Case(
                Subject = 'Entitlement attach case ' + i,
                Status = 'New',
                AccountId = acc.Id,
                Origin = 'Web'
            ));
        }

        Entitlement ent = [SELECT Id FROM Entitlement LIMIT 1];

        // When
        Test.startTest();
        CaseProcessService.initializeEntitlementOnCases(newCases);
        Test.stopTest();

        // Then
        for (Case c : newCases) {
            System.assertEquals(ent.Id, c.EntitlementId, 'Cases for account should get active entitlement');
        }
    }
}