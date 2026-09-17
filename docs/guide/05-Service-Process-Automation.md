# Service Process Automation

## Overview

Service process automation is the key to scaling customer support operations. By automating repetitive tasks, enforcing business rules, and streamlining workflows, organizations can handle higher case volumes while maintaining quality and consistency. This guide covers Flow Builder, Process Builder, Assignment Rules, Auto-Response Rules, and Apex-based automation for Service Cloud processes.

Automation in Service Cloud ranges from simple field updates to complex multi-step workflows involving multiple objects and external systems.

## Core Concepts

### Automation Tools Comparison

| Tool | Use Case | Complexity | Maintenance |
|------|----------|------------|-------------|
| Flow Builder | Multi-step processes | Medium-High | Low |
| Process Builder | Field updates, records | Low-Medium | Low |
| Assignment Rules | Case routing | Low | Low |
| Auto-Response Rules | Email replies | Low | Low |
| Workflow Rules | Time-dependent actions | Low | Medium |
| Apex Triggers | Complex business logic | High | High |
| Apex Scheduled | Batch processing | High | High |

### Flow Types for Service

| Flow Type | Use Case | Trigger |
|-----------|----------|---------|
| Record-Triggered Flow | Case lifecycle automation | Record create/update |
| Screen Flow | Agent-guided processes | User action |
| Scheduled Flow | Batch case updates | Time-based |
| Autolaunched Flow | Backend automation | Apex/Process |
| Platform Event Flow | External system integration | Event |

### Automation Design Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| Bulkification | Handle multiple records efficiently | Use collection variables |
| Error Handling | Graceful failure management | Fault paths, Try-Catch |
| Recursion Control | Prevent infinite loops | Recursive guard variables |
| Idempotency | Safe to run multiple times | Check before insert/update |
| Transaction Control | All-or-nothing execution | DML statements |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Flow Builder | Visual process automation | No-code automation |
| Assignment Rules | Automatic case routing | Faster resolution |
| Auto-Response Rules | Immediate email acknowledgment | Customer satisfaction |
| Escalation Rules | Time-based escalation | SLA compliance |
| Macros | Repeated task automation | Agent productivity |
| Quick Text | Standardized responses | Consistent communication |
| Case Queues | Work distribution | Balanced workload |
| Processes | Record-based automation | Business rule enforcement |

## Step-by-Step: Flow Builder for Service

### Step 1: Case Auto-Assignment Flow

```
// Flow: Case Auto-Assignment
// Type: Record-Triggered Flow
// Object: Case
// Trigger: Before Save

// Flow Elements:
// 1. Start: Case created or updated
// 2. Decision: Check case origin
//    - Phone → Route to Phone Queue
//    - Email → Route to Email Queue
//    - Web → Route to Web Queue
// 3. Assignment: Set queue based on origin
// 4. Update: Set case owner to queue
// 5. End: Flow complete

// Flow Logic:
// 1. Get case origin
// 2. Decision element checks origin value
// 3. Assignment sets appropriate queue ID
// 4. Update record sets owner field
```

### Step 2: Case Escalation Flow

```
// Flow: Case Auto-Escalation
// Type: Scheduled Flow
// Schedule: Every hour

// Flow Elements:
// 1. Start: Scheduled trigger
// 2. Get Records: Find cases approaching SLA breach
//    - Status = Working
//    - SLA breach within 1 hour
// 3. Loop: Process each case
// 4. Decision: Check current priority
//    - High → Escalate to Tier 2
//    - Critical → Escalate to Manager
// 5. Update Records: Update case status and owner
// 6. Send Email: Notify escalation manager
// 7. End: Flow complete

// Flow Logic:
// 1. Query cases with SLA milestones
// 2. Filter cases approaching breach
// 3. Escalate based on priority
// 4. Send notifications
```

### Step 3: Case Closure Flow

```
// Flow: Case Closure Automation
// Type: Record-Triggered Flow
// Object: Case
// Trigger: Before Save

// Flow Elements:
// 1. Start: Case status changed to Closed
// 2. Decision: Check closure reason
//    - Resolved → Send satisfaction survey
//    - Merged → Log merge details
//    - Spam → Archive and close
// 3. Actions based on closure type
// 4. Update: Set closure timestamp
// 5. Create: Task for follow-up
// 6. End: Flow complete

// Flow Logic:
// 1. Detect status change to Closed
// 2. Route based on closure reason
// 3. Execute appropriate actions
// 4. Create follow-up tasks
```

## Step-by-Step: Apex Automation

### Case Processing Service

```apex
// Apex Service Class for Case Automation
public class CaseAutomationService {
    
    // Process case assignments
    public static void processAssignments(List<Case> cases) {
        // Build queue map
        Map<String, Id> queueMap = getQueueMap();
        
        for (Case c : cases) {
            // Auto-assign based on origin
            if (c.Origin == 'Phone' && queueMap.containsKey('Phone Queue')) {
                c.OwnerId = queueMap.get('Phone Queue');
            } else if (c.Origin == 'Email' && queueMap.containsKey('Email Queue')) {
                c.OwnerId = queueMap.get('Email Queue');
            } else if (c.Origin == 'Web' && queueMap.containsKey('Web Queue')) {
                c.OwnerId = queueMap.get('Web Queue');
            }
            
            // Auto-set priority based on product
            if (c.Product__c == 'Enterprise Suite') {
                c.Priority = 'High';
            } else if (c.Product__c == 'Professional') {
                c.Priority = 'Normal';
            }
        }
    }
    
    // Process case escalation
    public static void processEscalation(List<Case> cases) {
        for (Case c : cases) {
            // Check if escalation is needed
            if (c.Status == 'Working' && c.Priority == 'Critical') {
                // Auto-escalate critical cases
                c.Status = 'Escalated';
                c.EscalationReason__c = 'Auto-escalated: Critical priority';
                c.EscalationDate__c = DateTime.now();
                
                // Send escalation email
                sendEscalationEmail(c);
            }
        }
    }
    
    // Process case closure
    public static void processClosure(List<Case> cases) {
        for (Case c : cases) {
            if (c.Status == 'Closed') {
                // Set closure timestamp
                c.ClosedDate = DateTime.now();
                
                // Calculate resolution time
                c.Resolution_Time__c = calculateBusinessHours(
                    c.CreatedDate, 
                    c.ClosedDate
                );
                
                // Create satisfaction survey task
                createSurveyTask(c);
            }
        }
    }
    
    // Helper methods
    private static Map<String, Id> getQueueMap() {
        Map<String, Id> queueMap = new Map<String, Id>();
        for (QueueSObject q : [
            SELECT QueueId, Queue.Name
            FROM QueueSObject
            WHERE SObjectType = 'Case'
        ]) {
            queueMap.put(q.Queue.Name, q.QueueId);
        }
        return queueMap;
    }
    
    private static Decimal calculateBusinessHours(DateTime start, DateTime end) {
        BusinessHours bh = [
            SELECT Id FROM BusinessHours
            WHERE IsDefault = true
            LIMIT 1
        ];
        
        return BusinessHours.diff(bh.Id, start, end) / 3600000.0; // Convert to hours
    }
    
    private static void createSurveyTask(Case c) {
        Task surveyTask = new Task(
            Subject = 'Send satisfaction survey',
            WhoId = c.ContactId,
            WhatId = c.Id,
            ActivityDate = Date.today().addDays(1),
            Priority = 'Normal',
            Status = 'Not Started',
            Description = 'Please send satisfaction survey for case: ' + c.CaseNumber
        );
        insert surveyTask;
    }
    
    private static void sendEscalationEmail(Case c) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setSubject('CRITICAL Case Escalated: ' + c.CaseNumber);
        email.setPlainTextBody(
            'A critical case has been escalated:\n\n' +
            'Case Number: ' + c.CaseNumber + '\n' +
            'Subject: ' + c.Subject + '\n' +
            'Account: ' + c.Account.Name + '\n' +
            'Contact: ' + c.Contact.Name + '\n' +
            'Escalation Reason: ' + c.EscalationReason__c
        );
        
        // Send to escalation queue members
        List<User> escalationManagers = [
            SELECT Email FROM User
            WHERE Profile.Name = 'Escalation Manager'
        ];
        
        List<String> emails = new List<String>();
        for (User u : escalationManagers) {
            emails.add(u.Email);
        }
        
        email.setToAddresses(emails);
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
    }
}
```

### Trigger Handler

```apex
// Trigger handler for case automation
public class CaseTriggerHandler {
    
    public static void handleBeforeInsert(List<Case> newCases) {
        CaseAutomationService.processAssignments(newCases);
        CaseAutomationService.processEscalation(newCases);
    }
    
    public static void handleBeforeUpdate(List<Case> newCases, Map<Id, Case> oldCases) {
        CaseAutomationService.processEscalation(newCases);
        CaseAutomationService.processClosure(newCases);
    }
}

// Trigger
trigger CaseTrigger on Case (before insert, before update) {
    if (Trigger.isInsert) {
        CaseTriggerHandler.handleBeforeInsert(Trigger.new);
    }
    if (Trigger.isUpdate) {
        CaseTriggerHandler.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
    }
}
```

## Step-by-Step: SOQL for Automation Monitoring

### Automation Execution Logs

```soql
-- Flow interview results
SELECT Id, FlowName, StartTime, EndTime,
       Status, NumberOfErrors
FROM FlowExecution
WHERE StartTime = TODAY
ORDER BY StartTime DESC
```

### Case Processing Metrics

```soql
-- Case automation effectiveness
SELECT 
    CASE 
        WHEN OwnerId IN (SELECT Id FROM Group WHERE Type = 'Queue') 
        THEN 'Auto-Assigned'
        ELSE 'Manually Assigned'
    END as AssignmentType,
    COUNT() as CaseCount,
    AVG(DATEDIFF(ClosedDate, CreatedDate)) as AvgResolutionDays
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY OwnerId
```

## Hands-On Tasks

1. **Build Assignment Flow**: Create a flow to auto-assign cases by origin
2. **Create Escalation Flow**: Build a scheduled flow for SLA breach prevention
3. **Implement Macros**: Create macros for common agent tasks
4. **Build Quick Text**: Create quick text templates for frequent responses
5. **Write Apex Trigger**: Implement case automation service
6. **Test Automation**: Verify all automation works in bulk scenarios
7. **Monitor Performance**: Create reports on automation effectiveness

## Self-Check Questions

1. When would you use Flow Builder vs. Apex triggers?
2. How do you handle bulk operations in automation?
3. What is the best way to test automation in Salesforce?
4. How do you monitor automation performance?
5. What are common automation pitfalls in Service Cloud?

## Common Exam Traps

- **Trap**: Assuming Flow Builder can handle all automation scenarios — some require Apex.
- **Trap**: Forgetting to bulkify automation for large data volumes.
- **Trap**: Not considering recursion limits in flow automation.
- **Trap**: Assuming auto-response rules fire on every case update.
- **Trap**: Overlooking that macros require specific permissions.

## Related

- **Phase**: 05 - Service Process Automation
- **Exam Domain**: Implementation Strategies (12%)
- **Previous Phase**: 04 - Entitlements, Milestones, and SLA
- **Next Phase**: 06 - Knowledge Management
- **Resources**: [Flow Builder Documentation](https://developer.salesforce.com/docs/atlas.en-us.flow.meta/)
