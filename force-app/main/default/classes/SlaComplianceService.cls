/**
 * Service Cloud Consultant Learning Project - SLA Compliance Service
 * ============================================================================
 * EXAM CONCEPT: SLA Management & Compliance Reporting (Blueprint Domain: 16%)
 *
 * This class demonstrates how to track and measure Service Level Agreement (SLA)
 * compliance in a Service Cloud implementation. SLAs define the expected response
 * and resolution times for support cases.
 *
 * KEY LEARNING POINTS:
 * 1. SLA metrics are driven by entitlements and milestones
 * 2. Business hours affect SLA calculations (holidays, weekends excluded)
 * 3. Compliance rates are key KPIs for service organizations
 * 4. Reports and dashboards are critical for SLA monitoring
 * 5. Custom objects can be used to track granular SLA metrics
 *
 * RELATED EXAM TOPICS:
 * - Entitlement processes and milestone timeframes
 * - Business hours configuration
 * - SLA reporting and dashboards
 * - Managing Entitlements on Cases
 * - Milestone Tracker functionality
 * ============================================================================
 */
public with sharing class SlaComplianceService {

    private static final Integer TARGET_COMPLIANCE_RATE = 95;

    /**
     * Calculates the SLA compliance rate for a given entitlement.
     * Compliance rate = (completed milestones on time / total milestones) * 100
     *
     * This is one of the most important KPIs in Service Cloud. Organizations
     * typically target 95%+ compliance rates.
     *
     * @param entitlementId The entitlement to calculate compliance for
     * @return Decimal representing compliance percentage (0-100)
     */
    public static Decimal calculateComplianceRate(Id entitlementId) {
        if (entitlementId == null) {
            return 0;
        }

        List<Case> cases = [
            SELECT Id FROM Case WHERE EntitlementId = :entitlementId
        ];

        if (cases.isEmpty()) {
            return 0;
        }

        Set<Id> caseIds = new Map<Id, Case>(cases).keySet();

        List<CaseMilestone> milestones = [
            SELECT Id, IsCompleted, IsViolated, CompletionDate, TargetDate
            FROM CaseMilestone
            WHERE CaseId IN :caseIds
        ];

        if (milestones.isEmpty()) {
            return 0;
        }

        Integer totalMilestones = milestones.size();
        Integer onTimeCompletions = 0;

        for (CaseMilestone milestone : milestones) {
            if (milestone.IsCompleted && milestone.CompletionDate != null) {
                if (milestone.CompletionDate <= milestone.TargetDate) {
                    onTimeCompletions++;
                }
            }
        }

        Decimal complianceRate = (Decimal.valueOf(onTimeCompletions) / Decimal.valueOf(totalMilestones)) * 100;
        return complianceRate.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Retrieves all milestones that have been breached (violated).
     * This is essential for real-time SLA monitoring and can feed into
     * dashboards, alerts, and escalation processes.
     *
     * @return List of breached CaseMilestone records with case details
     */
    public static List<CaseMilestone> getOverdueMilestones() {
        List<CaseMilestone> overdueMilestones = [
            SELECT Id, CaseId, Case.CaseNumber, Case.Subject, Case.Priority,
                   Case.OwnerId, MilestoneType.Name, TargetDate, TimeRemaining
            FROM CaseMilestone
            WHERE IsViolated = true
            AND IsCompleted = false
            ORDER BY TargetDate ASC
        ];

        return overdueMilestones;
    }

    /**
     * Generates a comprehensive SLA compliance report.
     * In Service Cloud, reports and dashboards are critical for monitoring
     * service performance. This method generates report data that can be
     * displayed on a custom dashboard.
     *
     * The report includes:
     * - Total cases with entitlements
     * - Cases meeting SLA
     * - Cases breached SLA
     * - Compliance rate percentage
     * - Average time to resolve
     *
     * @return Map containing report metrics
     */
    public static Map<String, Object> generateComplianceReport() {
        Map<String, Object> report = new Map<String, Object>();

        // Get all active entitlements
        List<Entitlement> entitlements = [
            SELECT Id, Name, Type, Status,
                   (SELECT Id, Status FROM Cases)
            FROM Entitlement
            WHERE Status = 'Active'
        ];

        Integer totalCases = 0;
        Integer breachedCases = 0;

        for (Entitlement ent : entitlements) {
            for (Case c : ent.Cases) {
                totalCases++;
            }
        }

        // Count breached milestones
        List<AggregateResult> breachedResults = [
            SELECT COUNT(Id) breachedCount
            FROM CaseMilestone
            WHERE IsViolated = true
        ];

        if (!breachedResults.isEmpty()) {
            breachedCases = (Integer) breachedResults[0].get('breachedCount');
        }

        // Calculate overall compliance
        Decimal overallCompliance = totalCases > 0
            ? (Decimal.valueOf(totalCases - breachedCases) / Decimal.valueOf(totalCases)) * 100
            : 0;

        report.put('totalEntitlements', entitlements.size());
        report.put('totalCases', totalCases);
        report.put('breachedMilestones', breachedCases);
        report.put('overallComplianceRate', overallCompliance.setScale(2, RoundingMode.HALF_UP));
        report.put('targetComplianceRate', TARGET_COMPLIANCE_RATE);
        report.put('reportDate', System.now());
        report.put('meetsTarget', overallCompliance >= TARGET_COMPLIANCE_RATE);

        return report;
    }

    /**
     * Creates SLA_Compliance__c records for tracking detailed milestone metrics.
     * Custom objects are commonly used in Service Cloud to track metrics that
     * go beyond the standard CaseMilestone reporting capabilities.
     *
     * @param caseId The case to create compliance records for
     * @return List of created SLA_Compliance__c records
     */
    public static List<SLA_Compliance__c> createComplianceRecords(Id caseId) {
        List<SLA_Compliance__c> records = new List<SLA_Compliance__c>();

        if (caseId == null) {
            return records;
        }

        List<CaseMilestone> milestones = [
            SELECT Id, MilestoneType.Name, StartDate, TargetDate,
                   CompletionDate, IsCompleted, IsViolated
            FROM CaseMilestone
            WHERE CaseId = :caseId
        ];

        for (CaseMilestone milestone : milestones) {
            SLA_Compliance__c record = new SLA_Compliance__c();
            record.Case__c = caseId;
            record.Milestone_Name__c = milestone.MilestoneType.Name;
            record.Is_Breached__c = milestone.IsViolated;

            if (milestone.IsCompleted && milestone.CompletionDate != null && milestone.StartDate != null) {
                Long timeToComplete = milestone.CompletionDate.getTime() - milestone.StartDate.getTime();
                record.Time_to_Complete__c = timeToComplete / 60000; // Convert to minutes
                record.Status__c = milestone.IsViolated ? 'Breached' : 'Met';
            } else {
                record.Status__c = milestone.IsCompleted ? 'Met' : 'In Progress';
            }

            records.add(record);
        }

        if (!records.isEmpty() && Schema.sObjectType.SLA_Compliance__c.isCreateable()) {
            insert records;
        }

        return records;
    }
}
