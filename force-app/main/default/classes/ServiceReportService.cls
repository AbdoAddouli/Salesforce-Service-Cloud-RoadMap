/**
 * Service Cloud Consultant Learning Project - Service Report Service
 * ============================================================================
 * EXAM CONCEPT: Service Reports & Analytics (Blueprint Domain: 13%)
 *
 * This class demonstrates service reporting capabilities in Service Cloud.
 * Reports and dashboards are critical for measuring service performance,
 * understanding customer satisfaction, and identifying improvement areas.
 *
 * KEY REPORTING CONCEPTS:
 * 1. Standard vs Custom reports for service analytics
 * 2. Report types define which objects and relationships can be reported on
 * 3. Dashboards provide real-time visualizations of service performance
 * 4. Scheduled reports for recurring KPI monitoring
 * 5. Report folder sharing for team collaboration
 *
 * STANDARD SERVICE REPORTS INCLUDE:
 * - Cases: Volume, Aging (sla), Escalations, Top CPO, Support Cost
 * - Contacts: Contact list report, Contact Impact of Cases
 * - Accounts: Account list report, Account Impact of Cases
 * - Solutions: Solution Usage (views & deflections)
 *
 * EXAM TOPICS:
 * - Report types and their role in reporting
 * - Creating effective service dashboards
 * - Case Aging and SLA reports
 * - Scheduling reports and email delivery
 * - Report folder permissions and sharing
 * - Lightning reports and Lightning report builder
 * ============================================================================
 */
public with sharing class ServiceReportService {

    private static final String CHECKMARK = 'CHECK';
    private static final String CROSS = 'CROSS';

    /**
     * Generates a comprehensive service report for a given case.
     * The report includes case details, SLA status, related activity,
     * milestones, and knowledge articles used for resolution.
     *
     * This simulates the data aggregation that would be presented in a
     * custom case report or dashboard component.
     *
     * @param caseId The case to generate the report for
     * @return Map containing the report data
     */
    public static Map<String, Object> generateReport(Id caseId) {
        Map<String, Object> report = new Map<String, Object>();

        if (caseId == null) {
            return report;
        }

        Case c = [
            SELECT Id, CaseNumber, Subject, Status, Priority, Origin, Type,
                   Account.Name, Contact.Name, Owner.Name, CreatedDate,
                   ClosedDate, IsEscalated, EntitlementId
            FROM Case
            WHERE Id = :caseId
            LIMIT 1
        ];

        // Basic case info
        report.put('caseNumber', c.CaseNumber);
        report.put('subject', c.Subject);
        report.put('status', c.Status);
        report.put('priority', c.Priority);
        report.put('origin', c.Origin);
        report.put('type', c.Type);
        report.put('accountName', c.Account != null ? c.Account.Name : 'N/A');
        report.put('contactName', c.Contact != null ? c.Contact.Name : 'N/A');
        report.put('ownerName', c.Owner != null ? c.Owner.Name : 'N/A');
        report.put('createdDate', c.CreatedDate);
        report.put('closedDate', c.ClosedDate);
        report.put('isEscalated', c.IsEscalated);

        // Case aging calculation
        if (c.CreatedDate != null) {
            Long ageInHours = (System.now().getTime() - c.CreatedDate.getTime()) / 3600000;
            report.put('ageInHours', ageInHours);
            report.put('ageInDays', Math.floor(ageInHours / 24).intValue());
        }

        // SLA status
        Boolean slaCompliant = checkSlaCompliance(c);
        report.put('slaCompliant', slaCompliant);

        // Activity summary
        Integer taskCount = [SELECT COUNT() FROM Task WHERE WhatId = :c.Id];
        Integer eventCount = [SELECT COUNT() FROM Event WHERE WhatId = :c.Id];
        List<CaseComment> comments = [SELECT Id FROM CaseComment WHERE ParentId = :c.Id];
        report.put('taskCount', taskCount);
        report.put('eventCount', eventCount);
        report.put('commentCount', comments.size());

        // Milestone breakdown
        List<CaseMilestone> milestones = [
            SELECT MilestoneType.Name, StartDate, TargetDate, CompletionDate, IsCompleted, IsViolated
            FROM CaseMilestone
            WHERE CaseId = :c.Id
        ];
        report.put('milestones', milestones);

        // Knowledge articles attached
        List<CaseArticle> articles = [
            SELECT KnowledgeArticleVersion.Title, KnowledgeArticleVersion.Summary
            FROM CaseArticle
            WHERE CaseId = :c.Id
        ];
        report.put('articlesUsed', articles);
        report.put('articleCount', articles.size());

        return report;
    }

    /**
     * Sends an email report to the specified recipient.
     * In Service Cloud, reports can be emailed on a schedule. This method
     * demonstrates programmatic email delivery of report data.
     *
     * @param caseId The case to report on
     * @param email The recipient email address
     * @return True if the email was sent successfully
     */
    public static Boolean sendReportByEmail(Id caseId, String email) {
        if (caseId == null || String.isBlank(email) || !Pattern.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', email)) {
            return false;
        }

        Map<String, Object> report = generateReport(caseId);
        if (report.isEmpty()) {
            return false;
        }

        // Build email body
        String emailBody = 'Service Report for Case ' + report.get('caseNumber') + '\n\n';
        emailBody += 'Subject: ' + report.get('subject') + '\n';
        emailBody += 'Status: ' + report.get('status') + '\n';
        emailBody += 'Priority: ' + report.get('priority') + '\n';
        emailBody += 'Account: ' + report.get('accountName') + '\n';
        emailBody += 'Owner: ' + report.get('ownerName') + '\n';
        emailBody += 'SLA Compliant: ' + report.get('slaCompliant') + '\n';
        emailBody += 'Age (hours): ' + report.get('ageInHours') + '\n\n';
        emailBody += 'Generated: ' + System.now().format() + '\n';

        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.setToAddresses(new List<String>{ email });
        message.setSubject('Service Report - Case ' + report.get('caseNumber'));
        message.setPlainTextBody(emailBody);
        message.setSaveAsActivity(true);

        List<Messaging.SendEmailResult> results = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ message });

        if (!results.isEmpty()) {
            return results[0].isSuccess();
        }

        return false;
    }

    /**
     * Retrieves the list of available report templates.
     * In Salesforce, report types define the object relationships available
     * for reporting. Service Cloud standard report types include:
     * - Cases
     * - Cases with Assets
     * - Cases with Products
     * - Solutions (Knowledge) with Cases
     * - Accounts with Cases
     * - Contacts with Cases
     *
     * @return List of report template names
     */
    public static List<String> getReportTemplates() {
        List<String> templates = new List<String>{
            'Cases',
            'Cases with Assets',
            'Cases with Products',
            'Cases with Entitlements',
            'Accounts with Cases',
            'Contacts with Cases',
            'Knowledge Articles with Cases',
            'Service Contracts',
            'Case Milestones',
            'Case History'
        };

        return templates;
    }

    /**
     * Generates an aggregated SLA compliance report across all queues.
     * This is typically what a service manager would view on a dashboard.
     *
     * @return Map of queue names to compliance percentages
     */
    public static Map<String, Decimal> getQueueComplianceReport() {
        Map<String, Decimal> queueCompliance = new Map<String, Decimal>();
        Map<String, Integer> totalByOwner = new Map<String, Integer>();
        Map<String, Integer> onTimeByOwner = new Map<String, Integer>();

        List<CaseMilestone> milestones = [
            SELECT Id, IsViolated, Case.Owner.Name
            FROM CaseMilestone
            WHERE Case.Owner.Name != null
        ];

        for (CaseMilestone cm : milestones) {
            String ownerName = cm.Case.Owner.Name;
            Integer total = totalByOwner.containsKey(ownerName) ? totalByOwner.get(ownerName) : 0;
            totalByOwner.put(ownerName, total + 1);

            if (!cm.IsViolated) {
                Integer onTime = onTimeByOwner.containsKey(ownerName) ? onTimeByOwner.get(ownerName) : 0;
                onTimeByOwner.put(ownerName, onTime + 1);
            }
        }

        for (String ownerName : totalByOwner.keySet()) {
            Integer total = totalByOwner.get(ownerName);
            Integer onTime = onTimeByOwner.containsKey(ownerName) ? onTimeByOwner.get(ownerName) : 0;

            Decimal rate = total > 0
                ? (Decimal.valueOf(onTime) / Decimal.valueOf(total)) * 100
                : 0;
            queueCompliance.put(ownerName, rate.setScale(1));
        }

        return queueCompliance;
    }

    private static Boolean checkSlaCompliance(Case c) {
        if (c.EntitlementId == null) {
            return true; // No entitlement means no SLA to track
        }

        List<CaseMilestone> milestones = [
            SELECT IsViolated
            FROM CaseMilestone
            WHERE CaseId = :c.Id
        ];

        if (milestones.isEmpty()) {
            return true;
        }

        for (CaseMilestone milestone : milestones) {
            if (milestone.IsViolated) {
                return false;
            }
        }

        return true;
    }
}