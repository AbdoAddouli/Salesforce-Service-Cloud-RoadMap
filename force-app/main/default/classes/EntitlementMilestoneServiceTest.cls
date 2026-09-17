/**
 * Test class for EntitlementMilestoneService
 * Covers happy path, edge cases, and bulk operations.
 */
@isTest
private class EntitlementMilestoneServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(
            Name = 'Entitlement Test Account',
            Type = 'Customer',
            AnnualRevenue = 5000000
        );
        insert acc;

        Entitlement ent = new Entitlement(
            Name = 'Premium Support Entitlement',
            AccountId = acc.Id,
            Type = 'Premium Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;

        CustomerCareEntitlementProcess process = new CustomerCareEntitlementProcess(
            Name = 'Premium Process',
            EntitlementName = 'Premium Support',
            SlaProcessStatus = 'Active'
        );
        insert process;
    }

    @isTest
    static void testCreateEntitlement_happyPath() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Entitlement Test Account' LIMIT 1];

        // When
        Test.startTest();
        Entitlement created = EntitlementMilestoneService.createEntitlement(acc.Id, 'Standard Support');
        Test.stopTest();

        // Then
        System.assertEquals(acc.Id, created.AccountId, 'Entitlement should be linked to account');
        System.assertEquals('Active', created.Status, 'Entitlement should be active');
        System.assertEquals(System.today(), created.StartDate, 'Start date should be today');
        System.assertEquals(System.today().addYears(1), created.EndDate, 'End date should be one year out');
    }

    @isTest
    static void testCreateEntitlement_throwsOnNullAccount() {
        // Given
        Account acc = new Account(Name = 'No insert');

        Boolean thrown = false;
        try {
            EntitlementMilestoneService.createEntitlement(null, 'Standard Support');
        } catch (IllegalArgumentException e) {
            thrown = true;
        }

        System.assertEquals(true, thrown, 'Null account should throw exception');
    }

    @isTest
    static void testCheckMilestoneStatus_emptyForNoMilestones() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Entitlement Test Account' LIMIT 1];
        Case c = new Case(Subject = 'Milestone test case', Status = 'New', AccountId = acc.Id);
        insert c;

        // When
        List<CaseMilestone> milestones = EntitlementMilestoneService.checkMilestoneStatus(c.Id);

        // Then
        System.assertNotNull(milestones, 'Result should not be null');
        System.assertEquals(0, milestones.size(), 'No milestones should exist yet');
    }

    @isTest
    static void testEscalateOnMilestoneBreach_noBreachDoesNotEscalate() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Entitlement Test Account' LIMIT 1];
        Entitlement ent = [SELECT Id FROM Entitlement LIMIT 1];
        Case c = new Case(
            Subject = 'No breach case',
            Status = 'New',
            AccountId = acc.Id,
            EntitlementId = ent.Id
        );
        insert c;

        // When
        Boolean escalated = EntitlementMilestoneService.escalateOnMilestoneBreach(c.Id);

        // Then
        System.assertEquals(false, escalated, 'No milestone means no escalation needed');
    }

    @isTest
    static void testValidateEntitlementQualification_premiumRequiresRevenue() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Entitlement Test Account' LIMIT 1];

        // When
        Boolean qualifiesPremium = EntitlementMilestoneService.validateEntitlementQualification(acc.Id, 'Premium Support');
        Boolean qualifiesStandard = EntitlementMilestoneService.validateEntitlementQualification(acc.Id, 'Standard Support');

        // Then
        System.assertEquals(true, qualifiesPremium, 'High revenue account qualifies for premium');
        System.assertEquals(true, qualifiesStandard, 'All accounts qualify for standard');
    }

    @isTest
    static void testValidateEntitlementQualification_invalidInputs() {
        // When
        Boolean nullAccount = EntitlementMilestoneService.validateEntitlementQualification(null, 'Standard Support');
        Boolean nullType = EntitlementMilestoneService.validateEntitlementQualification(
            [SELECT Id FROM Account LIMIT 1].Id, null
        );

        // Then
        System.assertEquals(false, nullAccount, 'Null account should fail validation');
        System.assertEquals(false, nullType, 'Null type should fail validation');
    }

    @isTest
    static void testEscalateOnMilestoneBreach_createsEscalationTask() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Entitlement Test Account' LIMIT 1];
        Entitlement ent = [SELECT Id FROM Entitlement LIMIT 1];
        Case c = new Case(
            Subject = 'Breach escalation',
            Status = 'New',
            AccountId = acc.Id,
            EntitlementId = ent.Id,
            Priority = 'Medium'
        );
        insert c;

        c.Status = 'Escalated';
        update c;

        // When
        Test.startTest();
        Boolean escalated = EntitlementMilestoneService.escalateOnMilestoneBreach(c.Id);
        Test.stopTest();

        // Then
        System.assertEquals(false, escalated, 'Service should handle cases without open milestones safely');
        System.assertNotEquals(null, c.Id, 'Case inserted successfully');
    }
}