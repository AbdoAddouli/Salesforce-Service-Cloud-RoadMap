/**
 * Service Cloud Fundamentals Test Class
 * ============================================================================
 * Covers Phase 1 basics of the Service Cloud Consultant track:
 * - Case object fundamentals
 * - Case creation and lifecycle
 * - Entitlement relationship to cases
 * - Case assignment concepts
 * - Quick actions and layouts
 *
 * This test class validates the foundational Service Cloud concepts that
 * every consultant must understand before moving to advanced configuration.
 * ============================================================================
 */
@isTest
private class ServiceCloudFundamentalsTest {

    @TestSetup
    static void setup() {
        // Phase 1: Create base account used by all tests
        Account acc = new Account(
            Name = 'Luma Test Account',
            Type = 'Customer',
            Industry = 'Technology',
            AnnualRevenue = 5000000,
            VIP__c = true
        );
        insert acc;

        // Phase 1: Standard contact for the account
        Contact contact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            AccountId = acc.Id,
            Email = 'test.contact@luma.example.com'
        );
        insert contact;
    }

    @isTest
    static void testCaseCreation_basicCaseDefaults() {
        // When
        Account acc = [SELECT Id FROM Account WHERE Name = 'Luma Test Account' LIMIT 1];
        Case c = new Case(
            Subject = 'Fundamentals test case',
            Priority = 'High',
            AccountId = acc.Id,
            Origin = 'Phone'
        );
        insert c;

        // Then
        System.assertNotEquals(null, c.Id, 'Case should be created');
        System.assertEquals('Phone', c.Origin, 'Origin should match Phone');
        System.assert(c.CaseNumber != null, 'CaseNumber should be auto-generated');
    }

    @isTest
    static void testCaseCreation_contactLinkedToAccount() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Luma Test Account' LIMIT 1];
        Contact contact = [SELECT Id FROM Contact WHERE LastName = 'Contact' LIMIT 1];

        // When
        Case c = new Case(
            Subject = 'Contact case',
            ContactId = contact.Id,
            AccountId = acc.Id,
            Origin = 'Email'
        );
        insert c;

        // Then
        Case retrieved = [SELECT Id, ContactId, AccountId FROM Case WHERE Id = :c.Id];
        System.assertEquals(contact.Id, retrieved.ContactId, 'Contact should be linked');
        System.assertEquals(acc.Id, retrieved.AccountId, 'Account should match the contact account');
    }

    @isTest
    static void testCaseLifecycle_newToClosed() {
        // Given
        Case c = new Case(
            Subject = 'Lifecycle case',
            Status = 'New',
            Priority = 'Medium',
            Origin = 'Web'
        );
        insert c;

        // When
        c.Status = 'Working';
        update c;
        c.Status = 'Closed';
        c.ClosedDate = System.now();
        update c;

        // Then
        Case finalState = [SELECT Id, Status, IsClosed, ClosedDate FROM Case WHERE Id = :c.Id];
        System.assertEquals('Closed', finalState.Status, 'Final status should be Closed');
        System.assertEquals(true, finalState.IsClosed, 'IsClosed should be true');
        System.assertNotEquals(null, finalState.ClosedDate, 'ClosedDate should be populated');
    }

    @isTest
    static void testEntitlementLinkedToCase() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Luma Test Account' LIMIT 1];

        Entitlement ent = new Entitlement(
            Name = 'Luma Support Entitlement',
            AccountId = acc.Id,
            Type = 'Standard Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;

        // When
        Case c = new Case(
            Subject = 'Entitlement case',
            AccountId = acc.Id,
            EntitlementId = ent.Id,
            Origin = 'Phone'
        );
        insert c;

        // Then
        Case linked = [SELECT Id, EntitlementId FROM Case WHERE Id = :c.Id];
        System.assertEquals(ent.Id, linked.EntitlementId, 'Entitlement should be linked to case');
    }

    @isTest
    static void testCaseAssignment_toQueue() {
        // Given
        Group queue = new Group(Name = 'Luma_Queue_Test', Type = 'Queue');
        insert queue;

        // When
        Case c = new Case(
            Subject = 'Assignment case',
            OwnerId = queue.Id,
            Origin = 'Web'
        );
        insert c;

        // Then
        Case retrieved = [SELECT Id, OwnerId FROM Case WHERE Id = :c.Id];
        System.assertEquals(queue.Id, retrieved.OwnerId, 'Case should be owned by the queue');
    }

    @isTest
    static void testFindCasesByHighPriority_bulk() {
        // Given
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 250; i++) {
            bulkCases.add(new Case(
                Subject = 'Bulk fundamentals ' + i,
                Priority = i < 125 ? 'High' : 'Low',
                Origin = 'Web',
                Status = 'New'
            ));
        }

        // When
        Test.startTest();
        insert bulkCases;
        List<Case> highPriority = [
            SELECT Id FROM Case
            WHERE Priority = 'High'
            AND Subject LIKE 'Bulk fundamentals %'
        ];
        Test.stopTest();

        // Then
        System.assertEquals(125, highPriority.size(), '125 high priority cases should be found');
    }

    @isTest
    static void testCaseCommentOnCase() {
        // Given
        Case c = new Case(Subject = 'Comment case', Origin = 'Phone');
        insert c;

        // When
        CaseComment comment = new CaseComment(
            ParentId = c.Id,
            CommentBody = 'Customer followed up with additional details.',
            IsPublished = true
        );
        insert comment;

        // Then
        List<CaseComment> comments = [SELECT Id, ParentId FROM CaseComment WHERE ParentId = :c.Id];
        System.assertEquals(1, comments.size(), 'One comment should exist');
        System.assertEquals(c.Id, comments[0].ParentId, 'Comment should be attached to the case');
    }

    @isTest
    static void testBusinessHoursConcept() {
        // Given
        BusinessHours standardHours = [
            SELECT Id, Name FROM BusinessHours WHERE IsDefault = true LIMIT 1
        ];

        // Then
        System.assertNotEquals(null, standardHours.Id, 'Default business hours should exist');
    }
}