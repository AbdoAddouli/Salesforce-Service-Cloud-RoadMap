# Reports and Dashboards for Service

## Overview

Reports and dashboards are the eyes and ears of a Service Cloud operation. They transform raw case data into actionable insights that drive decisions about staffing, SLA compliance, process improvement, and customer satisfaction. This guide covers report types, reporting best practices, dashboard design, and the analytics patterns that matter most for service organizations.

Effective reporting enables support managers to identify bottlenecks, track agent performance, measure SLA compliance, and demonstrate the business value of the service organization.

## Core Concepts

### Report Types for Service

| Report Type | Objects | Use Case |
|-------------|---------|----------|
| Cases | Case | Case volume, status, priority |
| Cases with Assets | Case + Asset | Product-related issues |
| Cases with Entitlements | Case + Entitlement | SLA compliance |
| Case with Milestones | Case + CaseMilestone | Milestone tracking |
| Cases with Products | Case + Product | Product issue analysis |
| Cases with Accounts | Case + Account | Account-level analysis |
| Contact with Cases | Contact + Case | Customer service history |
| Custom Report Types | Custom objects | Organization-specific |

### Report Formats

| Format | Description | When to Use |
|--------|-------------|-------------|
| Tabular | Simple data listing | Export data |
| Summary | Grouped with subtotals | Aggregated analysis |
| Matrix | Row and column grouping | Cross-tabulation |
| Joined | Multiple report blocks | Side-by-side comparison |

### Dashboard Components

| Component | Description | Best Practice |
|-----------|-------------|---------------|
| Table | List of records | Detail reporting |
| Bar Chart | Category comparison | Simple trends |
| Line Chart | Time-series data | Trend analysis |
| Pie Chart | Distribution display | Composition analysis |
| Donut Chart | Distribution with total | Composition + total |
| Funnel | Stage conversion | Process analysis |
| Gauge | Single metric vs. target | KPI monitoring |
| Metric | Single number | At-a-glance performance |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Report Builder | Drag-and-drop reporting | Easy report creation |
| Report Folders | Organized report repository | Controlled access |
| Dashboard Builder | Visual dashboards | Insights at a glance |
| Dynamic Dashboards | User-based data visibility | Personalized insights |
| Einstein Analytics | Advanced analytics | Predictive insights |
| Report Subscriptions | Scheduled delivery | Automated reporting |
| Report Filters | Data segmentation | Targeted analysis |
| Report Types | Data model flexibility | Custom reporting |

## Step-by-Step: Service Reporting

### Step 1: Create Core Service Reports

```
// Report: Case Volume by Status
// Type: Cases
// Grouping: Status
// Filters:
// - CreatedDate = THIS_MONTH
// - Status != 'Closed'

// Report: Case Aging
// Type: Cases
// Grouping: Age (CreatedDate)
// Buckets: 0-24h, 24-48h, 48-72h, 72h+
// Filters:
// - Status IN ('New', 'Working')
// - CreatedDate = LAST_90_DAYS

// Report: SLA Compliance
// Type: Cases with Entitlements
// Grouping: Entitlement Type
// Columns:
// - Total Cases
// - Breaches (IsViolated = true)
// - Compliance Rate
// Filters:
// - EntitlementId != null
// - ClosedDate = THIS_QUARTER
```

```soql
-- Equivalent SOQL for case volume report
SELECT Status,
       COUNT() as CaseCount,
       SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) as HighPriority,
       SUM(CASE WHEN Priority = 'Critical' THEN 1 ELSE 0 END) as CriticalPriority
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY Status
ORDER BY CaseCount DESC
```

### Step 2: Build Service Dashboards

```
// Dashboard: Service Operations Dashboard
// Folder: Service Operations

// Components:
// Row 1:
// - Metric: Total Open Cases
// - Metric: SLA Compliance Rate
// - Metric: Average Resolution Time
// - Metric: CSAT Score

// Row 2:
// - Bar Chart: Cases by Status
// - Line Chart: Cases by Month
// - Pie Chart: Cases by Origin

// Row 3:
// - Table: Agent Performance
// - Funnel: Case Resolution Pipeline
// - Gauge: Backlog vs. Target
```

### Step 3: Configure Dynamic Dashboards

```
// Dynamic Dashboard Configuration
// Setup > Dashboards > Dashboard Properties

// Dashboard: Agent Performance Dashboard
// Running User: Viewer's manager
// Sharing: Visible to managers only

// Filters:
// - Team: Manager's team
// - Office: Viewer's office
// - Product: Manager's products

// Eye Icon: Enable Dashboard Viewer's Data
// - Each agent sees their own metrics
// - Managers see team metrics
```

### Step 4: Schedule Report Delivery

```
// Report Scheduling
// Report: Weekly Service Metrics
// Schedule: Every Monday at 8:00 AM
// Recipients: Support Manager, Service VP
// Format: Excel, CSV, PDF

// Report: Daily Case Alert
// Schedule: Daily at 6:00 AM
// Recipients: On-call supervisor
// Trigger: Only if breaches > threshold
```

## Step-by-Step: Advanced Analytics

### SOQL for Service Analytics

```soql
-- Case metrics by day of week
SELECT CALENDAR_DAY(CreatedDate) as Day,
       CALENDAR_MONTH(CreatedDate) as Month,
       DAY_IN_WEEK(CreatedDate) as DayOfWeek,
       COUNT() as CaseCount,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionDays
FROM Case
WHERE CreatedDate = THIS_YEAR
GROUP BY CALENDAR_DAY(CreatedDate), 
         CALENDAR_MONTH(CreatedDate),
         DAY_IN_WEEK(CreatedDate)
ORDER BY DayOfWeek, Day
```

```soql
-- SLA breach trend analysis
SELECT CALENDAR_MONTH(ClosedDate) as Month,
       Entitlement.Type as EntitlementType,
       SUM(CASE WHEN Is_Violated__c = true THEN 1 ELSE 0 END) as Breaches,
       COUNT() as TotalCases,
       (SUM(CASE WHEN Is_Violated__c = true THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(), 0)) * 100 as BreachRate
FROM Case
WHERE ClosedDate = THIS_YEAR
AND EntitlementId != null
GROUP BY CALENDAR_MONTH(ClosedDate), Entitlement.Type
ORDER BY Month, EntitlementType
```

```soql
-- Knowledge article usage metrics
SELECT Id, Title, ArticleNumber,
       ArticleTotalViewCount,
       ArticleCaseCount,
       Article_FCR_Count__c,
       (Article_FCR_Count__c / NULLIF(ArticleTotalViewCount, 0)) * 100 as FCRDeflectionRate
FROM Knowledge__kav
WHERE PublishStatus = 'Online'
ORDER BY ArticleTotalViewCount DESC
LIMIT 10
```

### Apex for Custom Analytics

```apex
// Apex: Custom SLA analytics
public class SLAAnalyticsService {
    
    public static Map<String, EntitlementAnalytics> getEntitlementAnalytics() {
        Map<String, EntitlementAnalytics> results = new Map<String, EntitlementAnalytics>();
        
        // Query entitlements with cases
        List<Entitlement> entitlements = [
            SELECT Id, Name, Type, Status,
                   Account.Name,
                   (SELECT Id, Status, Priority, IsViolated__c,
                           CreatedDate, ClosedDate
                    FROM Cases
                    WHERE CreatedDate = LAST_N_DAYS:90)
            FROM Entitlement
            WHERE Status = 'Active'
        ];
        
        for (Entitlement e : entitlements) {
            EntitlementAnalytics analytics = new EntitlementAnalytics();
            analytics.entitlementName = e.Name;
            analytics.accountName = e.Account.Name;
            analytics.type = e.Type;
            
            for (Case c : e.Cases) {
                analytics.totalCases++;
                
                if (c.IsViolated__c == true) {
                    analytics.breaches++;
                }
                
                if (c.Status == 'Closed' && c.ClosedDate != null) {
                    analytics.resolvedCases++;
                    Decimal resolution = Decimal.valueOf(
                        Date.valueOf(c.ClosedDate.dateGMT()).daysBetween(
                            Date.valueOf(c.CreatedDate.dateGMT())
                        )
                    );
                    analytics.totalResolutionDays += resolution;
                }
            }
            
            analytics.complianceRate = analytics.totalCases > 0 ?
                ((analytics.totalCases - analytics.breaches) / 
                 analytics.totalCases) * 100 : 0;
            
            analytics.avgResolutionDays = analytics.resolvedCases > 0 ?
                analytics.totalResolutionDays / analytics.resolvedCases : 0;
            
            results.put(e.Name, analytics);
        }
        
        return results;
    }
    
    public class EntitlementAnalytics {
        public String entitlementName;
        public String accountName;
        public String type;
        public Integer totalCases = 0;
        public Integer breaches = 0;
        public Integer resolvedCases = 0;
        public Decimal complianceRate = 0;
        public Decimal avgResolutionDays = 0;
        public Decimal totalResolutionDays = 0;
    }
}
```

## Hands-On Tasks

1. **Create Report Folders**: Organize service reports by team and function
2. **Build Case Reports**: Create volume, aging, and SLA compliance reports
3. **Design Service Dashboard**: Build an operations dashboard with KPIs
4. **Configure Dynamic Dashboard**: Set up viewer-based data visibility
5. **Schedule Report Delivery**: Configure automated report subscriptions
6. **Build Advanced Analytics**: Create Einstein analytics for predictive insights
7. **Share Reports**: Set up report folders and sharing rules

## Self-Check Questions

1. What are the core report types for service reporting?
2. How do summary and matrix reports differ?
3. What is a dynamic dashboard and when would you use it?
4. How do you track SLA compliance in reports?
5. What are the best practices for dashboard design?

## Common Exam Traps

- **Trap**: Assuming all dashboards are visible to all users — running user matters.
- **Trap**: Not using dynamic dashboards for the report sharing model.
- **Trap**: Overlooking report type selection for relationship-based reporting.
- **Trap**: Forgetting that dashboards refresh on a schedule, not real-time.
- **Trap**: Not considering report folder permissions.

## Related

- **Phase**: 12 - Reports and Dashboards for Service
- **Exam Domain**: Contact Center Analytics (13%)
- **Previous Phase**: 11 - Case Management Best Practices
- **Next Phase**: 13 - Certification Prep
- **Resources**: [Reports and Dashboards Documentation](https://help.salesforce.com/s/articleView?id=sf.reports_overview.htm&type=5)