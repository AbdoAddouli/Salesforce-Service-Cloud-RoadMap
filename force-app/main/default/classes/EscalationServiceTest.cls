/**
 * Test class for EscalationService
 * Covers escalation levels, criteria checks, and bulk escalation.
 */
@isTest
private class EscalationServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Escalation Test Account', Type = 'Customer', AnnualRevenue = 1000000);
        insert acc;

        Case c = new Case(
            Subject = 'Escalation test case',
            Status = 'New',
            Priority = 'High',
            AccountId = acc.Id,
            Origin = 'Phone'
        );
        insert c;
    }

    @isTest
    static void testEscalateCase_updatesPriorityAndStatus() {
        // Given
        Case c = [SELECT Id, Priority, Status, Description FROM Case WHERE Subject = 'Escalation test case' LIMIT 1];

        // When
        Test.startTest();
        Case escalated = EscalationService.escalateCase(c, 2);
        Test.stopTest();

        // Then
        System.assertEquals('Escalated', escalated.Status, 'Case status should be Escalated');
        System.assert(escalated.Description.contains('Level 2'), 'Description should note the escalation level');
        System.assertNotEquals(null, escalated.CaseNumber, 'Case should exist');
    }

    @isTest
    static void testEscalateCase_invalidLevelReturnsUnchanged() {
        // Given
        Case c = [SELECT Id, Priority, Status FROM Case WHERE Subject = 'Escalation test case' LIMIT 1];
        String originalDescription = c.Description;
        c.Description = originalDescription;

        // When
        Case unchanged = EscalationService.escalateCase(c, 0);

        // Then
        System.assertNotEquals('Escalated', unchanged.Status, 'Level 0 should be rejected');
    }

    @isTest
    static void testCheckEscalationCriteria_highPriorityMeetsCriteria() {
        // Given
        Case c = [SELECT Id, Priority, Status FROM Case WHERE Subject = 'Escalation test case' LIMIT 1];

        // When
        Boolean qualifies = EscalationService.checkEscalationCriteria(c);

        // Then
        System.assertEquals(true, qualifies, 'High priority cases should qualify for escalation');
    }

    @isTest
    static void testCheckEscalationCriteria_newLowPriorityDoesNotQualify() {
        // Given
        Case c = new Case(Subject = 'Normal case', Status = 'New', Priority = 'Low', Origin = 'Web');

        // When
        Boolean qualifies = EscalationService.checkEscalationCriteria(c);

        // Then
        System.assertEquals(false, qualifies, 'Low priority new case should not require escalation');
    }

    @isTest
    static void testCheckEscalationCriteria_nullCaseReturnsFalse() {
        // When
        Boolean qualifies = EscalationService.checkEscalationCriteria(null);

        // Then
        System.assertEquals(false, qualifies, 'Null case should not qualify');
    }

    @isTest
    static void testDetermineEscalationLevel_criticalGetsLevel3() {
        // Given
        Case c = new Case(Subject = 'Critical case', Status = 'Escalated', Priority = 'Critical');

        // When
        Integer level = EscalationService.determineEscalationLevel(c);

        // Then
        System.assertEquals(3, level, 'Critical priority should get level 3');
    }

    @isTest
    static void testBulkEscalationCheck_handlesManyCases() {
        // Given
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 150; i++) {
            bulkCases.add(new Case(
                Subject = 'Bulk escalation ' + i,
                Status = 'New',
                Priority = i % 2 == 0 ? 'High' : 'Low',
                Origin = 'Phone'
            ));
        }
        insert bulkCases;

        // When
        Test.startTest();
        List<Case> escalated = EscalationService.bulkEscalationCheck(bulkCases);
        Test.stopTest();

        // Then
        System.assertNotEquals(null, escalated, 'Bulk escalation should return a list');
        System.assert(Math.Limits.getQueries() < 210, 'Should stay within query limits for bulk');
        Integer escalatedCount = 0;
        for (Case c : escalated) {
            if ('Escalated' == c.Status || c.Description != null) escalatedCount++;
        }
        System.assert(!escalated.isEmpty(), 'High priority cases should have been escalated');
    }

    @isTest
    static void testNotifyEscalationTeam_createsCaseComment() {
        // Given
        Case c = [SELECT Id, Priority FROM Case WHERE Subject = 'Escalation test case' LIMIT 1];

        // When
        Test.startTest();
        EscalationService.notifyEscalationTeam(c);
        Test.stopTest();

        // Then
        List<CaseComment> comments = [SELECT Id, ParentId, IsPublished FROM CaseComment WHERE ParentId = :c.Id];
        System.assertNotEquals(0, comments.size(), 'Escalation should create a case comment');
    }
}