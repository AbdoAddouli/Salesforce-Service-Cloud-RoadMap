# Entitlements, Milestones, and SLA

## Overview

Entitlements and Milestones are the backbone of Service Level Agreement (SLA) management in Service Cloud. They enable organizations to define, track, and enforce support commitments made to customers through contracts or standard support policies. This guide covers entitlement models, milestone configurations, business hours, and the technical implementation of SLA-driven case management.

Effective SLA management ensures customers receive the level of service they are entitled to, while providing visibility into compliance and performance metrics.

## Core Concepts

### Entitlement Model Overview

| Component | Description | Purpose |
|-----------|-------------|---------|
| Entitlement | Agreement defining support level | Tracks what support a customer receives |
| Milestone | Time-based SLA requirement | Defines response/resolution targets |
| MilestoneType | Template for milestones | Reusable milestone definitions |
| EntitlementType | Template for entitlements | Reusable entitlement definitions |
| BusinessHours | Operating hours | Calculates SLA timelines |
| CaseMilestone | Active milestone on case | Tracks SLA progress |

### Entitlement Types

| Type | Description | Use Case |
|------|-------------|----------|
| Simple Entitlement | Single SLA for all cases | Standard support |
| Multi-level Entitlement | Tiered SLAs based on conditions | Premium vs. standard support |
| Contract-based Entitlement | Linked to Service Contract | Contract-driven support |

### Milestone Types

| Milestone | Description | Typical Target |
|-----------|-------------|----------------|
| First Response | Time to first agent response | 1-4 hours |
| Time to Resolve | Total resolution time | 24-72 hours |
| Time to Escalate | Time before escalation | 2-8 hours |
| Custom Milestone | Organization-specific | Varies |

### Business Hours Configuration

| Setting | Description | Impact |
|---------|-------------|--------|
| Business Hours | Operating schedule | SLA calculation base |
| Holiday Schedule | Non-working days | SLA pause dates |
| Time Zone | Regional schedule | Accurate time tracking |
| Multi-currency | Currency-specific hours | Global SLA support |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Entitlement Management | Track customer support agreements | SLA visibility |
| Milestone Tracking | Monitor SLA deadlines | Proactive management |
| Business Hours | Time-based SLA calculation | Accurate tracking |
| Entitlement Versioning | Track SLA changes over time | Historical accuracy |
| Milestone Breach Alerts | Notifications for missed SLAs | Quick response |
| SLA Reports | Compliance and performance metrics | Data-driven decisions |

## Step-by-Step: Setting Up Entitlements

### Step 1: Configure Business Hours

```apex
// Business Hours Setup
// Setup > Company Settings > Business Hours

// Business Hours Configuration:
// Name: Standard Support Hours
// Time Zone: America/New_York
// Monday-Friday: 8:00 AM - 6:00 PM
// Saturday-Sunday: Closed

// Holiday Schedule:
// Name: Company Holidays 2024
// New Year's Day: January 1
// Independence Day: July 4
// Thanksgiving: Fourth Thursday in November
// Christmas: December 25
```

### Step 2: Create Entitlement Types

```apex
// Entitlement Type Configuration
// Setup > Customize > Entitlements > Entitlement Types

// Entitlement Type: Standard Support
// Name: Standard Support
// Description: Basic support for all customers
// SLA: First Response 24 hours, Resolution 72 hours

// Entitlement Type: Premium Support  
// Name: Premium Support
// Description: Enhanced support for premium customers
// SLA: First Response 4 hours, Resolution 24 hours

// Entitlement Type: Enterprise Support
// Name: Enterprise Support
// Description: Maximum support for enterprise customers
// SLA: First Response 1 hour, Resolution 8 hours
```

### Step 3: Create Milestone Types

```apex
// Milestone Type Configuration
// Setup > Customize > Entitlements > Milestone Types

// Milestone Type: First Response
// Name: First Response
// Description: Time to first agent response
// Duration: Based on entitlement type
// Business Hours: Standard Support Hours

// Milestone Type: Time to Resolve
// Name: Time to Resolve
// Description: Total time to resolve case
// Duration: Based on entitlement type
// Business Hours: Standard Support Hours

// Milestone Type: Time to Escalate
// Name: Time to Escalate
// Description: Time before case escalation
// Duration: 50% of Time to Resolve
// Business Hours: Standard Support Hours
```

### Step 4: Configure Entitlements

```apex
// Entitlement Configuration
// Setup > Customize > Entitlements > Entitlements

// Entitlement: Acme Standard Support
// Account: Acme Corporation
// Entitlement Type: Standard Support
// Start Date: January 1, 2024
// End Date: December 31, 2024
// Status: Active

// Milestones:
// First Response: 24 business hours
// Time to Resolve: 72 business hours
```

## Step-by-Step: SLA Implementation

### Step 1: Entitlement Assignment

```apex
// Apex: Auto-assign entitlements based on account
public class EntitlementAssignment {
    
    public static void assignEntitlements(List<Case> cases) {
        // Get account entitlements
        Set<Id> accountIds = new Set<Id>();
        for (Case c : cases) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }
        
        // Query active entitlements
        Map<Id, List<Entitlement>> accountEntitlements = new Map<Id, List<Entitlement>>();
        
        for (Entitlement e : [
            SELECT Id, Name, AccountId, Type, 
                   StartDate, EndDate, Status
            FROM Entitlement
            WHERE AccountId IN :accountIds
            AND Status = 'Active'
            AND StartDate <= TODAY
            AND EndDate >= TODAY
        ]) {
            if (!accountEntitlements.containsKey(e.AccountId)) {
                accountEntitlements.put(e.AccountId, new List<Entitlement>());
            }
            accountEntitlements.get(e.AccountId).add(e);
        }
        
        // Assign most specific entitlement
        for (Case c : cases) {
            if (c.EntitlementId == null && c.AccountId != null) {
                List<Entitlement> entitlements = accountEntitlements.get(c.AccountId);
                if (entitlements != null && !entitlements.isEmpty()) {
                    // Select entitlement based on priority
                    c.EntitlementId = selectBestEntitlement(entitlements, c);
                }
            }
        }
    }
    
    private static Id selectBestEntitlement(List<Entitlement> entitlements, Case c) {
        // Priority: Enterprise > Premium > Standard
        Map<String, Integer> priorityMap = new Map<String, Integer>{
            'Enterprise Support' => 3,
            'Premium Support' => 2,
            'Standard Support' => 1
        };
        
        Id bestEntitlementId = null;
        Integer highestPriority = 0;
        
        for (Entitlement e : entitlements) {
            Integer priority = priorityMap.get(e.Type) != null ? 
                              priorityMap.get(e.Type) : 0;
            if (priority > highestPriority) {
                highestPriority = priority;
                bestEntitlementId = e.Id;
            }
        }
        
        return bestEntitlementId;
    }
}
```

### Step 2: Milestone Management

```apex
// Apex: Manage case milestones
public class MilestoneManagement {
    
    public static void handleMilestoneUpdates(List<Case> cases, Map<Id, Case> oldCases) {
        for (Case c : cases) {
            Case oldCase = oldCases != null ? oldCases.get(c.Id) : null;
            
            // Handle status changes
            if (oldCase != null && c.Status != oldCase.Status) {
                handleStatusChange(c, oldCase);
            }
            
            // Handle first response
            if (c.Status == 'Working' && oldCase != null && oldCase.Status == 'New') {
                completeMilestone(c.Id, 'First Response');
            }
            
            // Handle case closure
            if (c.Status == 'Closed' && oldCase != null && oldCase.Status != 'Closed') {
                completeMilestone(c.Id, 'Time to Resolve');
            }
        }
    }
    
    private static void handleStatusChange(Case newCase, Case oldCase) {
        // Auto-escalate if approaching breach
        if (newCase.Status == 'Working' && isApproachingBreach(newCase)) {
            newCase.Status = 'Escalated';
            newCase.EscalationReason__c = 'Approaching SLA breach';
        }
    }
    
    private static Boolean isApproachingBreach(Case c) {
        // Check if any milestone is within 25% of target
        List<CaseMilestone> milestones = [
            SELECT Id, MilestoneType.Name, TargetDate, 
                   TimeRemainingInMinutes
            FROM CaseMilestone
            WHERE CaseId = :c.Id
            AND IsCompleted = false
        ];
        
        for (CaseMilestone m : milestones) {
            if (m.TimeRemainingInMinutes != null && 
                m.TimeRemainingInMinutes < 60) { // Less than 1 hour remaining
                return true;
            }
        }
        return false;
    }
    
    private static void completeMilestone(Id caseId, String milestoneName) {
        // Complete the milestone
        List<CaseMilestone> milestones = [
            SELECT Id, MilestoneType.Name
            FROM CaseMilestone
            WHERE CaseId = :caseId
            AND MilestoneType.Name = :milestoneName
            AND IsCompleted = false
        ];
        
        for (CaseMilestone m : milestones) {
            m.CompletionDate = DateTime.now();
        }
        
        if (!milestones.isEmpty()) {
            update milestones;
        }
    }
}
```

### Step 3: SLA Monitoring

```apex
// Apex: SLA monitoring and reporting
public class SLAMonitoring {
    
    public static Map<String, SLAComplianceResult> getSLACompliance() {
        Map<String, SLAComplianceResult> results = new Map<String, SLAComplianceResult>();
        
        // Query cases with milestones
        List<Case> cases = [
            SELECT Id, CaseNumber, Status, Priority,
                   Entitlement.Name, Entitlement.Type,
                   (SELECT Id, MilestoneType.Name, TargetDate,
                           CompletionDate, IsViolated
                    FROM CaseMilestones)
            FROM Case
            WHERE Status != 'Closed'
            AND EntitlementId != null
        ];
        
        // Calculate compliance
        for (Case c : cases) {
            String entitlementType = c.Entitlement.Type;
            
            if (!results.containsKey(entitlementType)) {
                results.put(entitlementType, new SLAComplianceResult());
            }
            
            SLAComplianceResult result = results.get(entitlementType);
            result.totalCases++;
            
            for (CaseMilestone m : c.CaseMilestones) {
                if (m.IsViolated) {
                    result.breaches++;
                } else if (m.CompletionDate != null) {
                    result.completedOnTime++;
                }
            }
        }
        
        // Calculate percentages
        for (SLAComplianceResult result : results.values()) {
            result.complianceRate = result.totalCases > 0 ? 
                ((result.totalCases - result.breaches) / result.totalCases) * 100 : 0;
        }
        
        return results;
    }
    
    public class SLAComplianceResult {
        public Integer totalCases = 0;
        public Integer breaches = 0;
        public Integer completedOnTime = 0;
        public Decimal complianceRate = 0;
    }
}
```

## Step-by-Step: SOQL for SLA Queries

### Active Milestones

```soql
-- Cases with active milestones approaching breach
SELECT Id, CaseNumber, Subject, Status,
       Entitlement.Name, Entitlement.Type,
       (SELECT Id, MilestoneType.Name, TargetDate,
               TimeRemainingInMinutes, IsViolated
        FROM CaseMilestones
        WHERE IsCompleted = false
        ORDER BY TargetDate ASC)
FROM Case
WHERE Status IN ('New', 'Working', 'Escalated')
AND EntitlementId != null
```

### SLA Compliance Report

```soql
-- SLA compliance by entitlement type
SELECT Entitlement.Type as EntitlementType,
       COUNT() as TotalCases,
       SUM(CASE WHEN IsViolated = true THEN 1 ELSE 0 END) as Breaches,
       (COUNT() - SUM(CASE WHEN IsViolated = true THEN 1 ELSE 0 END)) / COUNT() * 100 as ComplianceRate
FROM Case
WHERE ClosedDate = THIS_MONTH
AND EntitlementId != null
GROUP BY Entitlement.Type
ORDER BY ComplianceRate DESC
```

### Milestone Performance Analysis

```soql
-- Milestone completion time analysis
SELECT MilestoneType.Name as Milestone,
       AVG(CompletionDate - SlaStartDate) as AvgCompletionTime,
       MIN(CompletionDate - SlaStartDate) as MinCompletionTime,
       MAX(CompletionDate - SlaStartDate) as MaxCompletionTime,
       COUNT() as CompletedCount
FROM CaseMilestone
WHERE IsCompleted = true
AND CompletionDate = LAST_30_DAYS
GROUP BY MilestoneType.Name
ORDER BY AvgCompletionTime DESC
```

## Hands-On Tasks

1. **Configure Business Hours**: Set up business hours with holiday schedule
2. **Create Entitlement Types**: Define Standard, Premium, and Enterprise support
3. **Build Milestone Types**: Create First Response and Time to Resolve milestones
4. **Implement Auto-Assignment**: Build Apex to automatically assign entitlements
5. **Monitor SLA Compliance**: Create reports tracking SLA performance
6. **Test Breach Scenarios**: Simulate SLA breaches and verify notifications
7. **Build Dashboard**: Create SLA compliance dashboard with key metrics

## Self-Check Questions

1. What is the difference between an entitlement and a milestone?
2. How do business hours affect SLA calculations?
3. When would you use contract-based vs. simple entitlements?
4. How do you handle SLA breaches?
5. What metrics should you track for SLA compliance?

## Common Exam Traps

- **Trap**: Assuming entitlements automatically apply to all cases — they must be explicitly assigned.
- **Trap**: Forgetting that business hours affect SLA calculations — calendar hours may differ.
- **Trap**: Not considering time zones when configuring business hours.
- **Trap**: Assuming milestones pause when cases are in "Waiting on Customer" status.
- **Trap**: Overlooking that entitlement versioning is needed for historical accuracy.

## Related

- **Phase**: 04 - Entitlements, Milestones, and SLA
- **Exam Domain**: Service Cloud Solution Design (15%)
- **Previous Phase**: 03 - Data Model for Service
- **Next Phase**: 05 - Service Process Automation
- **Resources**: [Entitlement Management Documentation](https://help.salesforce.com/s/articleView?id=sf.entitlements_overview.htm&type=5)
