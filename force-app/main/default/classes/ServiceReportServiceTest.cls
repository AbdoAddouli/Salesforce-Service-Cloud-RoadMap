/**
 * Test class for ServiceReportService
 * Covers report generation, email delivery validation, and template listing.
 */
@isTest
private class ServiceReportServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Report Test Account', Type = 'Customer', AnnualRevenue = 1000000);
        insert acc;

        Entitlement ent = new Entitlement(
            Name = 'Report Entitlement',
            AccountId = acc.Id,
            Type = 'Standard Support',
            StartDate = System.today(),
            EndDate = System.today().addYears(1),
            Status = 'Active'
        );
        insert ent;

        Case c = new Case(
            Subject = 'Report test case',
            Status = 'Working',
            Priority = 'High',
            AccountId = acc.Id,
            EntitlementId = ent.Id,
            Origin = 'Email'
        );
        insert c;

        CaseComment comment = new CaseComment(
            ParentId = c.Id,
            CommentBody = 'Investigating the reported issue.',
            IsPublished = true
        );
        insert comment;
    }

    @isTest
    static void testGenerateReport_happyPath() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Report test case' LIMIT 1];

        // When
        Map<String, Object> report = ServiceReportService.generateReport(c.Id);

        // Then
        System.assert(report.containsKey('caseNumber'), 'Report should include case number');
        System.assert(report.containsKey('subject'), 'Report should include subject');
        System.assertEquals('Report test case', report.get('subject'), 'Subject should match');
        System.assert(report.containsKey('createdDate'), 'Report should include created date');
        System.assert(report.containsKey('ageInHours'), 'Report should include aging');
        System.assert(report.containsKey('slaCompliant'), 'Report should include SLA status');
    }

    @isTest
    static void testGenerateReport_nullCaseReturnsEmpty() {
        // When
        Map<String, Object> report = ServiceReportService.generateReport(null);

        // Then
        System.assertEquals(0, report.size(), 'Null case should return empty report');
    }

    @isTest
    static void testGenerateReport_countsComments() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Report test case' LIMIT 1];

        // When
        Map<String, Object> report = ServiceReportService.generateReport(c.Id);

        // Then
        System.assert((Integer) report.get('commentCount') >= 1, 'Report should count the case comment');
    }

    @isTest
    static void testSendReportByEmail_invalidEmailRejected() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Report test case' LIMIT 1];

        // When
        Boolean sent = ServiceReportService.sendReportByEmail(c.Id, 'not-an-email');

        // Then
        System.assertEquals(false, sent, 'Invalid email should be rejected');
    }

    @isTest
    static void testSendReportByEmail_nullCaseRejected() {
        // When
        Boolean sent = ServiceReportService.sendReportByEmail(null, 'test@example.com');

        // Then
        System.assertEquals(false, sent, 'Null case should be rejected');
    }

    @isTest
    static void testSendReportByEmail_validEmailSends() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Report test case' LIMIT 1];

        // When
        Test.startTest();
        Boolean sent = ServiceReportService.sendReportByEmail(c.Id, 'manager@example.com');
        Test.stopTest();

        // Then
        System.assertNotEquals(null, sent, 'SendEmailResult should be handled without error');
    }

    @isTest
    static void testGetReportTemplates_returnsList() {
        // When
        List<String> templates = ServiceReportService.getReportTemplates();

        // Then
        System.assert(!templates.isEmpty(), 'Should return standard report templates');
        System.assert(templates.contains('Cases'), 'Cases should be a standard template');
    }

    @isTest
    static void testGetQueueComplianceReport_returnsMap() {
        // When
        Test.startTest();
        Map<String, Decimal> compliance = ServiceReportService.getQueueComplianceReport();
        Test.stopTest();

        // Then
        System.assertNotEquals(null, compliance, 'Compliance map should never be null');
    }
}