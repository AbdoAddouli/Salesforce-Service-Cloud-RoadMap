# Answers and Results

## Overview

This guide provides detailed answers, expected results, and evaluation criteria for all exercises (14.1-14.9), mini-projects (MP1-MP3), and the capstone project (CAP) from Phase 14. Use this guide to validate your implementation, verify your understanding, and calibrate your readiness for the certification exam.

Compare your results against the expected outcomes described below. Note any discrepancies and investigate the root causes — this is the fastest way to deepen your understanding.

## Exercise 14.1: Design the Service Data Model

### Expected Results

#### Custom Objects

| Object | API Name | Record Type | Key Fields |
|--------|----------|-------------|------------|
| Product_Line__c | Product_Line__c | Custom | Name (standard), Product_Family__c (picklist) |
| Service_Region__c | Service_Region__c | Custom | Name (standard), Region_Code__c (external ID) |

#### Case Custom Fields

| Field | Type | Details |
|-------|------|---------|
| Product_Line__c | Lookup | References Product_Line__c |
| Service_Region__c | Lookup | References Service_Region__c |
| Severity__c | Picklist | Low, Medium, High, Critical |
| Resolution_Time_Hours__c | Number | Precision 8, Scale 2 |
| Escalated_Date__c | DateTime | Null by default |
| Resolution_Notes__c | Long Text | 32,768 characters |

### Validation Queries

```soql
-- Should return the custom fields you created
SELECT Id, CaseNumber, Product_Line__c, Severity__c,
       Resolution_Time_Hours__c
FROM Case
WHERE CreatedDate = TODAY
LIMIT 5

-- Should return your Product Line records
SELECT Id, Name, (SELECT Id FROM Cases__r)
FROM Product_Line__c
ORDER BY CreatedDate DESC
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Field not visible in layout | Field-level security not set | Set FLS on all relevant profiles |
| Relationship error | Wrong object reference | Verify lookup points to correct object |
| Cannot delete object | Records exist | Delete child records first |

## Exercise 14.2: Configure Case Lifecycle

### Expected Results

#### Status Picklist

| Status | Category | Valid Next Statuses |
|--------|----------|-------------------|
| New | Open | Working, Escalated, Waiting on Customer |
| Working | Open | Escalated, Waiting on Customer, Resolved |
| Escalated | Open | Working, Resolved, Closed |
| Waiting on Customer | Pending | Customer Responded, Working, Closed |
| Customer Responded | Pending | Working, Closed |
| Resolved | Closed | Closed |
| Closed | Closed | (terminal, no transitions) |

#### Record Types

| Record Type | Business Process | Page Layout |
|-------------|-----------------|-------------|
| Technical_Support | Case Support Process | Technical Support Layout |
| Billing | Case Support Process | Billing Layout |

### Validation Test

Create a case via Web-to-Case. Verify:

1. Customer receives an auto-response email
2. Case is created with Origin = "Web"
3. Case is assigned to the correct queue based on record type
4. Closing the case without Resolution_Notes__c produces a validation error

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Auto-response not sent | Rule inactive or criteria mismatch | Check rule active flag and criteria |
| Wrong queue assignment | Rule order incorrect | Reorder rules by sort order |
| Validation rule blocks everything | Formula too broad | Add record type or profile filters |

## Exercise 14.3: Implement Entitlements and SLA

### Expected Results

#### Business Hours

| Setting | Value |
|---------|-------|
| Business Hours Name | Standard Support Hours |
| Days | Monday - Friday |
| Start Time | 9:00 AM |
| End Time | 5:00 PM |
| Weekends | Closed |
| Holidays | 3+ configured |

#### Entitlement Types

| Type | First Response | Resolution |
|------|---------------|------------|
| Standard | 4 business hours | 2 business days |
| Premium | 1 business hour | 8 business hours |

### Validation Queries

```soql
-- Verify entitlements linked to accounts
SELECT Id, Name, Account.Name, Type,
       StartDate, EndDate, Status
FROM Entitlement
WHERE AccountId != null
AND Status = 'Active'

-- Verify cases receiving milestones
SELECT Id, CaseNumber, Entitlement.Name,
       Entitlement.Type,
       (SELECT Id, MilestoneType.Name, TargetDate,
               TimeRemainingInMinutes
        FROM CaseMilestones
        WHERE IsCompleted = false)
FROM Case
WHERE EntitlementId != null
LIMIT 20
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| No milestones on case | Entitlement process not linked | Attach entitlement process to entitlement |
| SLA too fast/slow | Wrong business hours | Verify business hours and timezone |
| Entitlement expired | Date range wrong | Check StartDate/EndDate |
| No compliance data | Cases lack entitlements | Verify auto-assignment logic |

## Exercise 14.4: Build Service Process Automation

### Expected Results

#### Flow: Case Severity Auto-Priority

| Input | Expected Output |
|-------|----------------|
| Severity__c = Critical | Priority = High, assigned to Escalated queue |
| Severity__c = High | Priority = High, assigned to normal queue |
| Severity__c = Medium/Low | Priority = Normal, no change |

#### Macro: Escalate Case

| Step | Action |
|------|--------|
| 1 | Set Status = Escalated |
| 2 | Add comment "Escalated to Tier 2" |
| 3 | Reassign to Tier 2 queue |
| 4 | Send escalation email |

#### Quick Text Entries

| Name | Content Type |
|------|--------------|
| Greeting | General |
| Resolution Confirmation | Case Closure |
| Follow-up Request | Follow Up |

### Validation Tests

1. Update a case with Severity = Critical and verify Priority changes
2. Execute the Escalate macro and verify all four steps complete
3. Use quick text in the case feed and verify the text inserts appropriately
4. Verify the scheduled flow escalates a case stuck in Working

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Flow doesn't fire | Trigger criteria too narrow | Check trigger condition |
| Macro fails halfway | Missing field permission | Grant FLS for macro fields |
| Scheduled flow misses records | Filter excludes them | Verify record access from running user |
| Quick text doesn't appear | Wrong category or permission | Verify quick text access |

## Exercise 14.5: Configure Knowledge Management

### Expected Results

| Deliverable | Expected Value |
|-------------|----------------|
| Article Types | 2+ (How-To, Troubleshooting) |
| Data Category Groups | 1 (Support) |
| Data Categories | 4+ (Installation, Configuration, Billing, Performance) |
| Published Articles | 3+ (one per type, one FAQ) |
| Report | Article views with case deflection |

### Validation Query

```soql
-- Published articles with categories and views
SELECT Id, Title, ArticleNumber,
       ArticleTotalViewCount,
       PublishStatus,
       Language
FROM Knowledge__kav
WHERE PublishStatus = 'Online'
ORDER BY ArticleTotalViewCount DESC

-- Articles by data category
SELECT DataCategoryGroupName, DataCategoryName,
       COUNT() ArticleCount
FROM KnowledgeArticleItem
GROUP BY DataCategoryGroupName, DataCategoryName
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Article not searchable | Published but unassigned to category | Assign data category |
| Can't publish article | Missing profile permission | Grant Knowledge permission |
| Article shows in wrong language | Language mismatch | Set article language correctly |
| Deflection data empty | No CaseArticle relationships | Test with case → article linking |

## Exercise 14.6: Configure the Lightning Service Console

### Expected Results

| Console Element | Expected Configuration |
|-----------------|----------------------|
| App Name | Service Console |
| Navigation Style | Workspace Tabs |
| Split View | Enabled, detailed list |
| Utility Bar Items | History, Notes, Send Email, Knowledge, Omni-Channel |
| Highlight Panel Row 1 | Case Number, Status, Priority, Origin |
| Highlight Panel Row 2 | Contact, Account, Entitlement |
| Custom Component | Open milestone status display |

### Validation Tests

1. Log in as an agent and verify the Service Console loads
2. Open a case in workspace tab — verify highlight panel shows correct fields
3. Use split view to compare case with related contact
4. Verify utility items are accessible from the bottom bar
5. Confirm the custom component renders the milestone status

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Split view not showing lists | Split view setting disabled | Enable in console layout |
| Utility bar empty | Items not added | Add utility items to app |
| Component blank | LWC/CMP permissions | Assign component to profiles |
| Layout wrong | Wrong page layout | Assign correct layout per profile |

## Exercise 14.7: Configure Omni-Channel Routing

### Expected Results

| Configuration | Expected Value |
|---------------|----------------|
| Omni-Channel enabled | Service Cloud feature |
| Presence Configuration | Support (capacity 8), Chat Only (capacity 4) |
| Skills Created | 5+ (product, language) |
| Routing Configuration | Technical Support Queue + skills |
| Skills Assigned | 2+ test users |

### Validation Test

1. Log in as an agent with Technical Support skill
2. Set presence to "Available"
3. Create a case routed to the Technical Support Queue
4. Verify the case appears in the agent's Omni-Channel queue
5. Accept the work item and verify the case opens in workspace

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| No work delivered | Skills don't match | Verify skills match routing requirements |
| Agent sees nothing | Presence not Available | Set presence to Available with capacity |
| Routing not active | Config deactivated | Ensure configuration active flag |
| Queue not listed | Queue not added | Add queue to routing configuration |

## Exercise 14.8: Build Service Analytics Dashboards

### Expected Results

#### Reports

| Report | Type | Group By | Key Columns |
|--------|------|----------|-------------|
| Case Volume by Status | Case | Status | Count, Priority breakdown |
| SLA Compliance | Case with Entitlement | Entitlement Type | Compliance %, breaches |
| Agent Performance | Case | Owner | Avg resolution, count, escalations |

#### Dashboard Components

| Component | Chart Type | Data Source |
|-----------|-----------|-------------|
| Total Open Cases | Metric | Case volume report |
| Cases by Channel | Bar | Cases filtered by Origin |
| Cases Over Time | Line | Cases by month |
| Resolution Pipeline | Funnel | Status distribution |
| Agent Performance | Table | Agent report |

### Validation Query

```soql
-- Expected report data pattern
SELECT Entitlement.Type,
       COUNT() TotalCases,
       SUM(CASE WHEN Milestone_Violated__c = true THEN 1 ELSE 0 END) Breaches,
       ROUND((COUNT() - SUM(CASE WHEN Milestone_Violated__c = true THEN 1 ELSE 0 END)) / COUNT() * 100, 1) CompliancePct
FROM Case
WHERE EntitlementId != null
AND ClosedDate = THIS_MONTH
GROUP BY Entitlement.Type
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Zero data in report | Report filters exclude data | Broaden date range/record types |
| Dashboard blank for users | Running user vs. sharing | Set running user with broader access |
| Funnel order wrong | Report grouping | Order funnel by status flow |
| Scheduled report missing | Subscription inactive | Verify subscription status |

## Exercise 14.9: Build an Einstein Bot

### Expected Results

| Dialog | Trigger Words | Behavior |
|--------|---------------|----------|
| Greeting | hi, hello, help | Welcome message, menu options |
| FAQ | question keywords | Lookup knowledge articles |
| Case Creation | support, problem, issue | Collect subject, description, email → create case |
| Escalation | agent, human, operator | Route to agent queue |

### Validation

1. Initiate a test chat and say "hi" — bot should respond with greeting
2. Ask a stored FAQ question — bot should present a matching article
3. Describe a problem — bot should collect case info and create the case
4. Ask for a human — bot should transfer to an agent queue

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Bot doesn't respond | Bot deactivated | Activate bot |
| Wrong dialog triggers | Keyword conflict | Reorder dialogs, use specific keywords |
| Case not created | Invocable action error | Check Apex class error logs |
| Transfer fails | Queue not configured | Add Omni-Channel queue |

## Mini-Project MP1: Multichannel Intake Hub

### Expected Results

| Channel | Configuration | Behavior |
|---------|---------------|----------|
| Email-to-Case | Support@acme.com | Email creates Case with Origin=Email |
| Web-to-Case | HTML form | Case with Origin=Web + auto-response |
| Chat/Messaging | Chat button | Conversation creates case on handoff |
| REST API | /cases endpoint | External systems create Cases |

### Validation Queries

```soql
-- Verify channel distribution
SELECT Origin, COUNT() ChannelCount
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY Origin
ORDER BY ChannelCount DESC
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Email cases not appearing | Email service address not verified | Verify email address ownership |
| REST API 401 | Authentication issue | Use Connected App OAuth |
| Chat not routing | Messaging enabled but no config | Add routing + publish button |
| Auto-response not sent | Template missing | Create email template + rule |

## Mini-Project MP2: SLA Enforcement Engine

### Expected Results

| Component | Expected Value |
|-----------|----------------|
| Business Hours | 24x7 and business-hours profiles |
| Entitlement Tiers | Standard, Premium, Enterprise |
| Milestones | First Response + Resolution |
| Violation Actions | Escalation + email alert |
| Auto-Escalation Flow | Escalates within 1 hour of SLA breach |
| Compliance Dashboard | Rate by type, violations by team |

### Validation Test

1. Create a Premium case at 8:58 AM (1 hour from lunch)
2. Verify first response milestone starts
3. Do not respond until after lunch
4. Verify the case escalates and alert fires

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Violation not firing | Milestone not linked | Attach milestone to entitlement process |
| Email not sent | Workflow/flow email inactive | Verify email delivery settings |
| Wrong violation time | Wrong business hours | Confirm timezone and schedule |
| Flow escalates too early | Business hours mismatch | Recalculate with correct hours |

## Mini-Project MP3: Knowledge-Powered Self-Service

### Expected Results

| Deliverable | Expected Value |
|-------------|----------------|
| Articles | 10+ published across 4+ categories |
| Portal | Self-service page with article list & search |
| Bot Integration | Bot recommends articles from conversation keyword |
| Deflection Report | % of article views resulting in no case |

### Validation Query

```soql
-- Deflection analysis: cases vs article views
SELECT ArticleTotalViewCount, ArticleCaseCount,
       (ArticleTotalViewCount - ArticleCaseCount) as DeflectedViews
FROM Knowledge__kav
WHERE PublishStatus = 'Online'
```

### Common Errors and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Portal shows no articles | Article visibility | Enable knowledge sharing |
| Bot doesn't recommend | Keyword mismatch | Broaden bot dialog keywords |
| Deflection report empty | No article tracking | Confirm viewing events tracked |

## Capstone Project (CAP): Evaluation Rubric

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Data Model | 15% | Objects, fields, relationships correctly configured |
| Configuration | 10% | Record types, statuses, assignments correct |
| SLA | 15% | Business hours, entitlements, milestones accurate |
| Automation | 15% | Flows/triggers fire correctly on test data |
| Knowledge | 10% | 10+ articles, categories assigned |
| Console | 10% | Optimized layout, utility bar, highlight panel |
| Channels | 10% | Web, Email, Chat, API all functional |
| Analytics | 10% | Dashboards show correct, current data |
| Documentation | 5% | Clear traceability from requirements to implementation |

### Scoring Guide

| Score | Level | Meaning |
|-------|-------|---------|
| 90-100% | Expert | Ready for certification |
| 75-89% | Proficient | One more review round needed |
| 60-74% | Developing | Revisit weak domains |
| <60% | Beginner | Repeat exercises in weak areas |

### Self-Assessment Checklist

- [ ] Can you explain your data model to a colleague without notes?
- [ ] Does every requirement in the scenario have a corresponding implementation?
- [ ] Have you tested every feature with real data (not just setup verification)?
- [ ] Are your dashboards showing the intended KPIs with current data?
- [ ] Have you documented the configuration for handoff to support?
- [ ] Can you demo the entire solution in 10 minutes?
- [ ] Do you know what you'd do differently next time?

## Time Tracking Summary

| Deliverable | Target Time | Actual | Score |
|-------------|-------------|--------|-------|
| 14.1 | 45 min | | |
| 14.2 | 45 min | | |
| 14.3 | 60 min | | |
| 14.4 | 60 min | | |
| 14.5 | 60 min | | |
| 14.6 | 60 min | | |
| 14.7 | 45 min | | |
| 14.8 | 60 min | | |
| 14.9 | 60 min | | |
| MP1 | 2-3 hours | | |
| MP2 | 2-3 hours | | |
| MP3 | 2-3 hours | | |
| CAP | 8-10 hours | | |

## Related

- **Phase**: 15 - Answers and Results
- **Exam Domain**: All (validation)
- **Previous Phase**: 14 - Practical Exercises and Mini-Projects
- **Next Phase**: 16 - Real-World Use Cases
- **Exercises Covered**: 14.1 - 14.9, MP1 - MP3, CAP