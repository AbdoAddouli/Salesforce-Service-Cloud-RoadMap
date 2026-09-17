# Practical Exercises and Mini-Projects

## Overview

Theory alone does not prepare you for the Service Cloud Consultant certification — hands-on practice does. This guide contains 9 focused exercises (14.1 through 14.9), 3 mini-projects (MP1-MP3), and a capstone project (CAP) that progressively build your Service Cloud implementation skills in a real sandbox.

Complete all exercises in order. Each one builds on the previous. By the end, you will have built a complete Service Cloud solution covering the data model, SLA management, automation, channels, knowledge, console, and analytics.

## How to Use This Guide

| Section | Exercise IDs | Time | Skills Built |
|---------|-------------|------|--------------|
| Exercise Set 1 | 14.1 - 14.3 | 3-4 hours | Data model, cases, SLA |
| Exercise Set 2 | 14.4 - 14.6 | 3-4 hours | Automation, knowledge, console |
| Exercise Set 3 | 14.7 - 14.9 | 3-4 hours | Channels, analytics, bots |
| Mini-Projects | MP1 - MP3 | 6-8 hours | Integrated solutions |
| Capstone | CAP | 8-10 hours | Complete implementation |

## Prerequisites

Before starting these exercises, you need:

1. A Salesforce Developer Edition or Trailhead Playground org
2. Service Cloud enabled
3. Salesforce Admin or System Administrator permission set
4. Knowledge feature enabled (if available in your edition)
5. Access to Setup > Customize / Object Manager

## Exercise 14.1: Design the Service Data Model

### Objective
Design and create the custom objects and fields needed for a service implementation for a fictional company (e.g., "Northwind Support" that sells hardware and software products).

### Tasks

1. Create two custom objects:
   - **Product_Line__c** (lookup/established parent for product groupings)
   - **Service_Region__c** (geographic territory)

2. Add these custom fields to the Case object:
   - `Product_Line__c` (Lookup to Product_Line__c)
   - `Service_Region__c` (Lookup to Service_Region__c)
   - `Severity__c` (Picklist: Low, Medium, High, Critical)
   - `Resolution_Time_Hours__c` (Number, precision 8, scale 2)
   - `Escalated_Date__c` (DateTime)
   - `Resolution_Notes__c` (Long Text, 32,768 characters)

3. Configure field-level security to hide `Resolution_Notes__c` from the standard user profile.

4. Write SOQL to verify your schema:

```soql
-- Retrieve all fields on Case
SELECT Id, CaseNumber, Subject, Status, Priority,
       Product_Line__c, Service_Region__c,
       Severity__c, Escalated_Date__c
FROM Case
LIMIT 10

-- Verify object relationships
SELECT Id, Name, 
       (SELECT Id FROM Cases)
FROM Product_Line__c
ORDER BY Name
```

### Success Criteria

- [ ] Both custom objects created with the required fields
- [ ] Case has all 6 custom fields
- [ ] Resolution_Notes__c not visible to standard user
- [ ] SOQL queries return results without errors

### Deliverables

- A markdown file (or text) describing your data model with field definitions
- Evidence of completed custom objects (recorded screenshot or SOQL output)

## Exercise 14.2: Configure Case Lifecycle

### Objective
Configure a complete case lifecycle with statuses, record types, assignment, and auto-response rules.

### Tasks

1. Define the case status picklist values:

| Status | Category | Description |
|--------|----------|-------------|
| New | Open | Initial state |
| Working | Open | Agent investigating |
| Escalated | Open | Higher tier engagement |
| Waiting on Customer | Pending | Awaiting customer response |
| Customer Responded | Pending | Customer provided info |
| Resolved | Closed | Issue addressed |
| Closed | Closed | Final state |

2. Create two record types:
   - **Technical_Support**: For technical issues
   - **Billing**: For billing and account inquiries

3. Configure assignment rules:
   - Technical issues → Technical Support Queue
   - Billing issues → Billing Support Queue

4. Configure an auto-response rule that sends an email template acknowledging case creation.

5. Create a validation rule that prevents closing a case without a Resolution_Notes__c value.

### Success Criteria

- [ ] Status values configured with categories
- [ ] Record types with page layouts assigned
- [ ] Assignment rules route by record type
- [ ] Auto-response rule fires on case creation
- [ ] Validation rule blocks closure without notes

### Deliverables

- Recorded configuration paths (screenshots or text trace)
- Test case created via Web-to-Case demonstrating auto-response and assignment

## Exercise 14.3: Implement Entitlements and SLA

### Objective
Build a complete SLA solution with entitlements, business hours, milestones, and compliance reports.

### Tasks

1. Configure business hours:
   - "Standard Support Hours": Mon-Fri 9:00 AM - 5:00 PM (your timezone)
   - Create a holiday schedule with at least 3 holidays

2. Create entitlement types:
   - **Standard**: First response 4 hours, Resolution 2 business days
   - **Premium**: First response 1 hour, Resolution 8 business hours

3. Create an entitlement process with milestones:
   - First Response milestone
   - Time to Resolve milestone

4. Create entitlements for at least 2 accounts (one with Standard, one with Premium).

5. Create a flow or Apex trigger that auto-assigns the entitlement to new cases based on account tier.

```apex
// Apex: Auto-assign entitlement helper
public class EntitlementHelper {
    public static void assignEntitlement(List<Case> cases) {
        Set<Id> accountIds = new Set<Id>();
        for (Case c : cases) {
            if (c.AccountId != null) accountIds.add(c.AccountId);
        }
        
        Map<Id, Entitlement> entitlementMap = new Map<Id, Entitlement>();
        for (Entitlement e : [
            SELECT Id, AccountId, ServiceContractId, Type
            FROM Entitlement
            WHERE AccountId IN :accountIds
            AND Status = 'Active'
            AND StartDate <= TODAY AND EndDate >= TODAY
        ]) {
            entitlementMap.put(e.AccountId, e);
        }
        
        for (Case c : cases) {
            if (c.EntitlementId == null && c.AccountId != null
                && entitlementMap.containsKey(c.AccountId)) {
                c.EntitlementId = entitlementMap.get(c.AccountId).Id;
            }
        }
    }
}
```

### Success Criteria

- [ ] Business hours and holiday schedule configured
- [ ] Entitlement types with proper SLAs
- [ ] Entitlement process with milestones
- [ ] Cases auto-receive entitlements
- [ ] SLA compliance report built

### Deliverables

- Recorded business hours configuration
- Screenshot of milestone tracking on a test case
- SLA compliance report output

## Exercise 14.4: Build Service Process Automation

### Objective
Automate case handling with Flows, assignment rules, macros, and quick text.

### Tasks

1. Create a **Record-Triggered Flow** that:
   - Sets Priority = High when Severity__c = Critical
   - Auto-assigns the Escalated queue when priority changes to High

2. Create two macros:
   - **Escalate Case**: Updates status to Escalated, adds comment, reassigns
   - **Close Case**: Sets status to Closed, fills resolution notes, sends email

3. Create three quick text entries:
   - Greeting template
   - Resolution confirmation template
   - Follow-up request template

4. Create a **Scheduled Flow** that runs daily and escalates any case in "Working" status for more than 3 business days.

### Success Criteria

- [ ] Flows created and activated
- [ ] Macros available in the console
- [ ] Quick text entries usable in the feed
- [ ] Scheduled flow triggers correctly

### Deliverables

- Flow definitions (recorded in markdown or text)
- Macro instruction steps
- Verification that automation runs on test data

## Exercise 14.5: Configure Knowledge Management

### Objective
Set up Salesforce Knowledge with article types, data categories, and article workflows.

### Tasks

1. Enable Knowledge in your org.

2. Create at least 2 article types (e.g., "How-To" and "Troubleshooting").

3. Create a data category group "Support" with categories:
   - Installation
   - Configuration
   - Billing
   - Performance

4. Author and publish at least 3 articles (one per article type plus one FAQ).

5. Assign data categories to articles.

6. Create a report showing article views and case deflection.

```soql
-- Knowledge article analytics
SELECT Id, Title, ArticleNumber,
       ArticleTotalViewCount, ArticleCaseCount,
       Knowledge_DataCategory_Display_Names__c
FROM Knowledge__kav
WHERE PublishStatus = 'Online'
ORDER BY ArticleTotalViewCount DESC
LIMIT 10
```

### Success Criteria

- [ ] Knowledge enabled with article types
- [ ] Data categories created and assigned
- [ ] 3+ published articles
- [ ] Article analytics report built

### Deliverables

- Screenshot of the article authoring UI
- Published article output
- Analytics report data

## Exercise 14.6: Configure the Lightning Service Console

### Objective
Build an agent-optimized Service Console with highlight panel, utility bar, and productivity tools.

### Tasks

1. Create a Service Console app in the App Manager.

2. Configure the console layout:
   - Workspace tabs enabled
   - Split view enabled
   - Utility bar with: History, Notes, Email, Knowledge, Omni-Channel

3. Configure the Case highlight panel with key fields:
   - Row 1: Case Number, Status, Priority, Origin
   - Row 2: Contact, Account, Entitlement

4. Assign the compact layout for Case.

5. Create a custom console component (Visualforce or Lightning) that displays the case's open milestone status.

### Success Criteria

- [ ] Service Console app created
- [ ] Highlight panel configured
- [ ] Utility bar with 5+ items
- [ ] Custom component functioning

### Deliverables

- Screenshot of the configured console
- Component code (Visualforce or Lightning)
- Verification of split view behavior

## Exercise 14.7: Configure Omni-Channel Routing

### Objective
Implement skills-based work routing with Omni-Channel.

### Tasks

1. Enable Omni-Channel in your org.

2. Create presence configurations:
   - "Support Presence" with capacity 8
   - "Chat Only" with capacity 4

3. Create at least 5 skills (product expertise, language, etc.).

4. Create a routing configuration:
   - Queue: Technical Support Queue
   - Work types: Case, Chat
   - Skills: English, Technical Support

5. Assign skills to 2+ test users.

6. Verify routing by sending a case to the configured queue.

### Success Criteria

- [ ] Omni-Channel enabled
- [ ] Presence configurations created
- [ ] Skills created and assigned
- [ ] Routing configuration active
- [ ] Test case routes via Omni-Channel

### Deliverables

- Screenshot of routing configuration
- Omni-Channel status panel showing agent availability
- Proof of work item routing

## Exercise 14.8: Build Service Analytics Dashboards

### Objective
Create reports and dashboards that track case volume, SLA compliance, and agent performance.

### Tasks

1. Build three reports:
   - **Case Volume by Status and Priority** (Summary report)
   - **SLA Compliance by Entitlement Type** (Summary report)
   - **Agent Performance** (Summary report with resolution time)

2. Create a dashboard "Service Operations" with:
   - Metric: Total Open Cases
   - Bar chart: Cases by Channel (Origin)
   - Line chart: Cases over time
   - Funnel: Resolution pipeline
   - Table: Agent performance

3. Set up dynamic dashboard permissions for managers to see their teams' data.

4. Schedule the weekly metrics report via email subscription.

### Success Criteria

- [ ] Three reports created correctly
- [ ] Dashboard with 5+ components
- [ ] Dashboard sharing configured
- [ ] Report subscription scheduled

### Deliverables

- Report definitions (report types, filters, group-bys)
- Dashboard layout diagram
- Screenshots of each dashboard component

## Exercise 14.9: Build an Einstein Bot

### Objective
Deploy an Einstein Bot that handles common inquiries and escalates to a human.

### Tasks

1. Enable Einstein Bots in your org (if available in your edition).

2. Create a bot with these dialogs:
   - **Greeting**: Handles "hi", "hello", "help"
   - **FAQ**: Answers 3 common questions from knowledge base
   - **Case Creation**: Collects subject, description, contact email → creates case
   - **Escalation**: Routes to an agent queue

3. Create an Apex invocable action for case creation (or use a standard action).

4. Set the bot's fallback dialog to escalate to a human agent.

5. Test the bot in a sandbox chat environment.

### Success Criteria

- [ ] Bot created with 4 dialogs
- [ ] Case creation action working
- [ ] Escalation to human works
- [ ] Bot tested end-to-end

### Deliverables

- Bot dialog diagram
- Invocable action Apex code
- Transcript of a completed test conversation

## Mini-Project MP1: Multichannel Intake Hub

### Objective
Build a unified case intake system that accepts cases from email, web, chat, and API.

### Tasks

1. Configure Email-to-Case or On-Demand Email-to-Case with a support address.

2. Set up Web-to-Case with auto-response emails.

3. Integrate Live Agent Chat or Einstein Messaging chat button.

4. Create a custom REST API endpoint (Apex REST) to accept case creation from external systems.

5. Configure assignment rules and priorities so all channels route to the correct queues.

6. Build a dashboard showing case volume by channel.

```apex
// Apex REST: Case creation endpoint
@RestResource(urlMapping='/cases/*')
global with sharing class CaseAPI {
    
    @HttpPost
    global static Id createCase(
        String subject, String description,
        String contactEmail, String origin,
        String priority
    ) {
        Contact contact = findContact(contactEmail);
        
        Case c = new Case(
            Subject = subject,
            Description = description,
            Origin = origin != null ? origin : 'API',
            Priority = priority != null ? priority : 'Normal',
            Status = 'New'
        );
        
        if (contact != null) {
            c.ContactId = contact.Id;
            c.AccountId = contact.AccountId;
        }
        
        insert c;
        return c.Id;
    }
    
    @HttpGet
    global static List<Case> getCases() {
        return [
            SELECT Id, CaseNumber, Subject, Status, Priority, Origin
            FROM Case
            WHERE CreatedDate = TODAY
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];
    }
    
    private static Contact findContact(String email) {
        if (String.isBlank(email)) return null;
        List<Contact> contacts = [
            SELECT Id, AccountId FROM Contact
            WHERE Email = :email LIMIT 1
        ];
        return contacts.isEmpty() ? null : contacts[0];
    }
}
```

### Success Criteria

- [ ] Email intake configured
- [ ] Web-to-Case live with auto-response
- [ ] Chat or messaging channel active
- [ ] REST endpoint tested (Workbench or curl)
- [ ] Channel volume dashboard

## Mini-Project MP2: SLA Enforcement Engine

### Objective
Build an SLA compliance system using entitlements, milestones, flow automation, and analytics.

### Tasks

1. Configure business hours for a 24x7 operation and a business-hours operation.

2. Create entitlement types with different SLA tiers.

3. Build entitlement processes with milestone actions (entry, success, violation).

4. Create a Flow that auto-escalates cases approaching SLA breach.

5. Create milestone breach email alerts.

6. Build an analytics dashboard tracking:
   - Compliance rate by entitlement type
   - Milestone violations by team
   - Average time to first response

7. Test a scenario where a milestone breaches and verify the violation action fires.

### Success Criteria

- [ ] Multiple entitlement tiers
- [ ] Auto-escalation flow working
- [ ] Breach notifications firing
- [ ] Compliance dashboard built

## Mini-Project MP3: Knowledge-Powered Self-Service

### Objective
Build a knowledge base with self-service portal and bot article recommendations.

### Tasks

1. Configure Knowledge with article types and data categories.

2. Publish 10 articles across categories.

3. Set up a simplified Experience Cloud (Community) site or portal page showing published articles.

4. Configure search optimization: synonyms, article recommendations.

5. Integrate Einstein Bot to recommend articles based on the conversation.

6. Track deflection: reports showing cases avoided due to article views.

### Success Criteria

- [ ] 10 published articles across 4+ categories
- [ ] Portal or self-service page working
- [ ] Bot recommends articles
- [ ] Deflection analytics report

## Capstone Project (CAP): Complete Service Cloud Implementation

### Objective
Implement a complete Service Cloud solution for a fictional company in your sandbox, integrating everything learned in exercises 14.1-14.9 and mini-projects MP1-MP3.

### Company Scenario

**Acme Computers Inc.** sells enterprise IT hardware and software. They need:

1. **Multichannel intake**: Email, web form, and API-based cases
2. **Tiered support**: Standard (4h response), Premium (1h response)
3. **SLA enforcement**: Milestones for first response and resolution
4. **Knowledge base**: 10+ articles with categories
5. **Agent console**: Optimized workspace with macros and quick text
6. **Omni-Channel routing**: Skills-based to technical and billing queues
7. **Automation**: Flow for escalation, auto-assignment, breach alerts
8. **Analytics**: Dashboard with case, SLA, agent, and deflection metrics

### Required Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | Data Model | Custom objects, fields, relationships documented |
| 2 | Configuration | Record types, statuses, assignments, auto-responses |
| 3 | SLA | Business hours, entitlements, milestones, processes |
| 4 | Automation | Flows, macros, quick text, triggers |
| 5 | Knowledge | Article types, categories, 10+ articles |
| 6 | Console | Service Console app with utilities |
| 7 | Channels | Web-to-Case, Email-to-Case, chat, REST API |
| 8 | Routing | Omni-Channel with skills and presence |
| 9 | Analytics | Reports + dashboards for all KPIs |
| 10 | Documentation | Implementation summary document |

### Submission

Create a single document (markdown) that includes:
- Architecture diagram
- Configuration traceability (requirement → implementation)
- Test results for each major feature
- Screenshots or output of dashboards
- Lessons learned

## Time Management

| Exercise | Estimated Time | Actual Time |
|----------|---------------|-------------|
| 14.1 | 45 min | |
| 14.2 | 45 min | |
| 14.3 | 60 min | |
| 14.4 | 60 min | |
| 14.5 | 60 min | |
| 14.6 | 60 min | |
| 14.7 | 45 min | |
| 14.8 | 60 min | |
| 14.9 | 60 min | |
| MP1 | 2-3 hours | |
| MP2 | 2-3 hours | |
| MP3 | 2-3 hours | |
| CAP | 8-10 hours | |

## Fundamental Errors to Avoid

| Error | Consequence | How to Avoid |
|-------|-------------|--------------|
| Skipping business hours | Wrong SLA calculations | Always configure business hours first |
| Forgetting entitlements on cases | No SLA tracking | Auto-assign from account |
| Not bulkifying Apex | Governor limit failures | Use collections and maps |
| Too many record types | Admin overhead | Keep a small number |
| Ignoring sharing rules | Broken visibility | Test with minimum-access users |
| No error handling | Silent failures | Use Flow fault paths and try/catch |

## Related

- **Phase**: 14 - Practical Exercises and Mini-Projects
- **Exam Domain**: All (hands-on validation)
- **Previous Phase**: 13 - Certification Prep
- **Next Phase**: 15 - Answers and Results
- **Exercises**: 14.1 - 14.9, MP1 - MP3, CAP
- **Time Investment**: 20-30 hours total