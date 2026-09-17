/**
 * Test class for SlaComplianceService
 * Covers compliance rate calculation, overdue milestones, and reporting.
 */
@isTest
private class SlaComplianceServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'SLA Test Account', Type = 'Customer', AnnualRevenue = 3000000);
        insert acc;

        Entitlement ent = new Entitlement(
            Name = 'SLA Entitlement',
            AccountId = acc.Id,
            Type = 'Standard Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;

        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < 2; i++) {
            cases.add(new Case(
                Subject = 'SLA Case ' + i,
                Status = 'New',
                AccountId = acc.Id,
                EntitlementId = ent.Id,
                Priority = 'Medium'
            ));
        }
        insert cases;
    }

    @isTest
    static void testCalculateComplianceRate_noMilestonesReturnsZero() {
        // Given
        Entitlement ent = [SELECT Id FROM Entitlement LIMIT 1];

        // When
        Decimal rate = SlaComplianceService.calculateComplianceRate(ent.Id);

        // Then
        System.assertEquals(0, rate, 'No milestones should give 0% compliance');
    }

    @isTest
    static void testCalculateComplianceRate_nullEntitlement() {
        // When
        Decimal rate = SlaComplianceService.calculateComplianceRate(null);

        // Then
        System.assertEquals(0, rate, 'Null entitlement should give 0');
    }

    @isTest
    static void testGetOverdueMilestones_emptyWhenNoneViolated() {
        // When
        Test.startTest();
        List<CaseMilestone> overdue = SlaComplianceService.getOverdueMilestones();
        Test.stopTest();

        // Then
        System.assertNotNull(overdue, 'Result should never be null');
    }

    @isTest
    static void testGenerateComplianceReport_containsExpectedKeys() {
        // When
        Map<String, Object> report = SlaComplianceService.generateComplianceReport();

        // Then
        System.assert(report.containsKey('totalEntitlements'), 'Report should include total entitlements');
        System.assert(report.containsKey('totalCases'), 'Report should include total cases');
        System.assert(report.containsKey('breachedMilestones'), 'Report should include breached milestones');
        System.assert(report.containsKey('overallComplianceRate'), 'Report should include compliance rate');
        System.assert(report.containsKey('targetComplianceRate'), 'Report should include target rate');
        System.assert(report.containsKey('reportDate'), 'Report should include date');
        System.assert(report.containsKey('meetsTarget'), 'Report should include target flag');
    }

    @isTest
    static void testGenerateComplianceReport_targetIs95() {
        // When
        Map<String, Object> report = SlaComplianceService.generateComplianceReport();

        // Then
        System.assertEquals(95, report.get('targetComplianceRate'),
            'Target compliance rate should be the standard 95% benchmark');
    }

    @isTest
    static void testCreateComplianceRecords_handlesCaseWithNoMilestones() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'SLA Case 0' LIMIT 1];

        // When
        Test.startTest();
        List<SLA_Compliance__c> records = SlaComplianceService.createComplianceRecords(c.Id);
        Test.stopTest();

        // Then
        System.assertEquals(0, records.size(), 'No milestones means no compliance records');
    }

    @isTest
    static void testCreateComplianceRecords_nullCaseId() {
        // When
        List<SLA_Compliance__c> records = SlaComplianceService.createComplianceRecords(null);

        // Then
        System.assertEquals(0, records.size(), 'Null case should produce no records');
    }
}