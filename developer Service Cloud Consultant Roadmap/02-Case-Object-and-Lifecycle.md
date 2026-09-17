# Case Object and Lifecycle

## Overview

The Case object is the cornerstone of Service Cloud. It represents a customer issue, question, or request that needs resolution. Understanding the Case lifecycle — from creation through closure — is fundamental to designing effective service processes. This guide covers the Case object's fields, relationships, lifecycle stages, automation tools, and best practices for managing high-volume case operations.

Every customer interaction that requires investigation or follow-up becomes a Case. The lifecycle of a Case defines how quickly and effectively your organization resolves customer issues.

## Core Concepts

### Case Object Fields

| Field | API Name | Type | Description |
|-------|----------|------|-------------|
| Case Number | CaseNumber | Auto-Number | Unique identifier |
| Subject | Subject | Text | Brief description of the issue |
| Status | Status | Picklist | Current state of the case |
| Priority | Priority | Picklist | Urgency level (Low, Normal, High, Critical) |
| Origin | Origin | Picklist | How the case was created (Phone, Email, Web) |
| Contact | ContactId | Lookup | The person reporting the issue |
| Account | AccountId | Lookup | The associated organization |
| Owner | OwnerId | Lookup | Queue or user responsible |
| Product | Product__c | Custom Picklist | Related product or service |
| Entitlement | EntitlementId | Lookup | SLA agreement |
| Milestone | (via CaseMilestones) | Relationship | SLA milestones |

### Case Lifecycle States

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌─────────┐
│  NEW     │───>│ WORKING  │───>│  RESOLVED   │───>│ CLOSED  │
└─────────┘    └──────────┘    └─────────────┘    └─────────┘
     │              │                │
     │              │                │
     ▼              ▼                ▼
┌──────────┐  ┌──────────┐    ┌─────────────┐
│ ESCALATED│  │ WAITING  │    │  REOPENED   │
└──────────┘  └──────────┘    └─────────────┘
```

### Case Assignment Rules

Assignment rules automatically route cases to the correct queue or user based on criteria:

| Rule Element | Purpose | Example |
|--------------|---------|---------|
| Rule Entry | Define matching criteria | Priority = 'High' AND Product = 'Enterprise' |
| Criteria | Field conditions | Status != 'Closed' AND Origin = 'Phone' |
| Assignment | Target queue or user | Tier 2 Support Queue |
| Email Alert | Notify stakeholders | Send to support manager |

### Escalation Rules

Escalation rules automatically escalate cases based on time or conditions:

```apex
// Escalation Rule Configuration Example
// Time-based: Escalate if not resolved within 4 hours
// Condition-based: Escalate if Priority = Critical

// Rule Entry 1: Time-Based
// Criteria: Age > 4 hours AND Status = 'Working'
// Action: Reassign to Escalation Queue

// Rule Entry 2: Priority-Based
// Criteria: Priority = 'Critical' AND Status = 'New'
// Action: Reassign to Emergency Response Queue
// Notify: Support Manager via Email
```

### Case Comment and Feed Tracking

| Feature | Internal Notes | External Comments |
|---------|---------------|-------------------|
| Visibility | Internal users only | Customer-facing |
| Field | Internal Comments (Hidden) | Comments |
| Use Case | Agent notes, team updates | Customer responses |
| Tracking | Feed tracking available | Email notifications |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Auto-Response Rules | Automatic email replies | Immediate acknowledgment |
| Escalation Rules | Time/condition-based escalation | SLA compliance |
| Assignment Rules | Automatic routing | Faster resolution |
| Validation Rules | Data quality enforcement | Consistent case data |
| Process Builder/Flow | Automated field updates | Reduced manual work |
| Case Teams | Multi-user collaboration | Cross-functional resolution |
| Case Merge | Duplicate case handling | Cleaner data |

## Step-by-Step: Case Lifecycle Configuration

### Step 1: Define Case Status Values

```apex
// Custom Status Values with Categories
// Setup > Customize > Cases > Fields > Status

// Status Picklist Values:
// New (Category: Open) - Initial state
// Working (Category: Open) - Agent assigned
// Escalated (Category: Open) - Higher tier
// Waiting on Customer (Category: Pending) - Awaiting response
// Customer Responded (Category: Pending) - Response received
// Resolved (Category: Closed) - Issue addressed
// Closed (Category: Closed) - Final state
```

### Step 2: Configure Auto-Response Rules

```apex
// Auto-Response Rule Configuration
// Setup > Customize > Cases > Auto-Response Rules

// Rule: Welcome Email
// Criteria: All incoming cases
// Response Template: "Case Created - Auto Response"
// Include: Case Number, Expected Response Time
```

### Step 3: Build Case Assignment Rules

```apex
// Assignment Rule Configuration
// Setup > Customize > Cases > Assignment Rules

// Rule 1: Product-Based Routing
// Entry 1: Product = 'Enterprise Suite' → Enterprise Support Queue
// Entry 2: Product = 'Professional' → Professional Support Queue
// Entry 3: Default → General Support Queue

// Rule 2: Priority Escalation
// Entry 1: Priority = 'Critical' → Emergency Queue
// Entry 2: Priority = 'High' → Priority Support Queue
```

### Step 4: Implement Case Teams

```apex
// Case Team Roles
// Setup > Customize > Cases > Case Teams

// Roles:
// - Case Owner (Default)
// - Technical Support
// - Product Specialist
// - Account Manager
// - Escalation Manager

// Default Team Members
// Based on Product or Account attributes
```

## Step-by-Step: Case Data Management

### SOQL for Case Analytics

```soql
-- Case aging analysis
SELECT Id, CaseNumber, Subject, Status, Priority,
       CreatedDate, 
       DAY_ONLY(CreatedDate) as CreatedDay,
       LastModifiedDate,
       ClosedDate,
       CASE 
           WHEN ClosedDate != null 
           THEN ClosedDate - CreatedDate
           ELSE NOW() - CreatedDate
       END as AgeInDays
FROM Case
WHERE CreatedDate = LAST_N_DAYS:90
ORDER BY CreatedDate DESC
```

### Case Resolution Time Calculation

```soql
-- Average resolution time by priority
SELECT Priority, 
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgDays,
       COUNT() as CaseCount
FROM Case
WHERE Status = 'Closed'
AND ClosedDate = THIS_QUARTER
GROUP BY Priority
ORDER BY Priority
```

### Case Reopen Rate Analysis

```soql
-- Cases reopened after resolution
SELECT Id, CaseNumber, Status, 
       ResolvedDate, ClosedDate,
       CASE 
           WHEN ResolvedDate != ClosedDate 
           THEN 'Reopened'
           ELSE 'Never Reopened'
       END as ReopenStatus
FROM Case
WHERE ClosedDate = THIS_MONTH
AND Status = 'Closed'
```

## Apex for Case Management

### Case Trigger with Business Logic

```apex
trigger CaseTrigger on Case (before insert, before update) {
    // Auto-populate fields on case creation
    if (Trigger.isInsert) {
        for (Case c : Trigger.new) {
            // Auto-set priority based on product
            if (c.Product__c == 'Enterprise Suite') {
                c.Priority = 'High';
            }
            
            // Auto-assign entitlement
            if (c.AccountId != null) {
                c.EntitlementId = CaseService.getEntitlementForAccount(c.AccountId);
            }
        }
    }
    
    // Validate status transitions on update
    if (Trigger.isUpdate) {
        for (Case c : Trigger.new) {
            Case oldCase = Trigger.oldMap.get(c.Id);
            
            // Prevent reopening closed cases
            if (oldCase.Status == 'Closed' && c.Status != 'Closed') {
                c.addError('Cannot reopen a closed case. Create a new case instead.');
            }
            
            // Require resolution notes when closing
            if (c.Status == 'Closed' && oldCase.Status != 'Closed') {
                if (String.isBlank(c.CaseResolutionNotes__c)) {
                    c.addError('Resolution notes are required to close a case.');
                }
            }
        }
    }
}
```

### Batch Case Processing

```apex
// Batch class for case cleanup
public class CaseCleanupBatch implements Database.Batchable<SObject> {
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            [SELECT Id, Status, CreatedDate, ClosedDate
             FROM Case
             WHERE Status != 'Closed'
             AND CreatedDate < LAST_N_DAYS:180]
        );
    }
    
    public void execute(Database.BatchableContext bc, List<Case> cases) {
        List<Case> casesToUpdate = new List<Case>();
        
        for (Case c : cases) {
            // Auto-close cases older than 6 months
            c.Status = 'Closed';
            c.ClosureReason__c = 'Auto-closed due to age';
            casesToUpdate.add(c);
        }
        
        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate;
        }
    }
    
    public void finish(Database.BatchableContext bc) {
        // Send notification
        AsyncApexJob job = [SELECT Id, Status, JobItemsProcessed
                           FROM AsyncApexJob
                           WHERE Id = :bc.getJobId()];
        
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setSubject('Case Cleanup Batch Completed');
        email.setPlainTextBody('Cases processed: ' + job.JobItemsProcessed);
        email.setHtmlBody('Cases processed: ' + job.JobItemsProcessed);
        
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
    }
}
```

### Case Merge Utility

```apex
public class CaseMergeUtility {
    
    public static void mergeDuplicateCases(Id primaryCaseId, List<Id> duplicateCaseIds) {
        // Get primary case
        Case primaryCase = [
            SELECT Id, CaseNumber, Subject, Status, Priority,
                   ContactId, AccountId
            FROM Case
            WHERE Id = :primaryCaseId
        ];
        
        // Merge duplicate cases
        for (Id duplicateId : duplicateCaseIds) {
            Case duplicate = [
                SELECT Id, Status, CaseNumber,
                       (SELECT Id, CommentBody, CreatedDate
                        FROM CaseComments)
                FROM Case
                WHERE Id = :duplicateId
            ];
            
            // Add comment to primary case about merge
            CaseComment mergeNote = new CaseComment(
                ParentId = primaryCaseId,
                CommentBody = 'Merged from case ' + duplicate.CaseNumber + 
                             ' on ' + DateTime.now().format(),
                IsPublished = false
            );
            insert mergeNote;
            
            // Close duplicate case
            duplicate.Status = 'Closed';
            duplicate.ClosureReason__c = 'Merged into ' + primaryCase.CaseNumber;
            update duplicate;
        }
    }
}
```

## Hands-On Tasks

1. **Configure Status Values**: Create 6 status values with proper categories
2. **Build Assignment Rules**: Set up rules based on Product and Priority fields
3. **Create Auto-Response**: Configure an auto-response email template
4. **Implement Escalation**: Set up time-based escalation for high-priority cases
5. **Write SOQL**: Query cases with resolution time calculations
6. **Build Apex Trigger**: Create a trigger that validates status transitions
7. **Test Batch Processing**: Write and test a batch class for case cleanup

## Self-Check Questions

1. What are the standard fields on the Case object?
2. How do assignment rules differ from escalation rules?
3. What is the difference between case resolution and case closure?
4. When would you use case teams vs. case comments?
5. How do you prevent unauthorized case status changes?

## Common Exam Traps

- **Trap**: Confusing assignment rules with escalation rules — assignment routes cases, escalation escalates them.
- **Trap**: Forgetting that auto-response rules fire on case creation, not on every update.
- **Trap**: Assuming case comments are always visible to customers — they can be internal-only.
- **Trap**: Overlooking that merging cases requires careful handling of related records.
- **Trap**: Not considering bulkification when writing case triggers.

## Related

- **Phase**: 02 - Case Object and Lifecycle
- **Exam Domain**: Case Management (13%)
- **Previous Phase**: 01 - Service Cloud Concepts and Architecture
- **Next Phase**: 03 - Data Model for Service
- **Resources**: [Case Management Documentation](https://help.salesforce.com/s/articleView?id=sf.cases_about.htm&type=5)
