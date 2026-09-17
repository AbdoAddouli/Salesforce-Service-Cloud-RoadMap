# Omni-Channel and Omni-Supervisor

## Overview

Omni-Channel is Service Cloud's intelligent routing engine that distributes work items (cases, chats, and leads) to the most appropriate agent based on skills, capacity, and availability. Omni-Supervisor provides supervisors with real-time visibility into agent status, work queues, and routing patterns. This guide covers Omni-Channel configuration, presence management, skills-based routing, and supervisory oversight.

Omni-Channel transforms customer service by automatically matching work to the right agent at the right time. It eliminates the manual work of checking queues and ensures customers are always connected to qualified agents.

## Core Concepts

### Omni-Channel Architecture

| Component | Description | Purpose |
|-----------|-------------|---------|
| Omni-Channel | Work routing engine | Distributes work to agents |
| Presence | Agent work status | Tracks availability |
| Capacity | Work limits per agent | Prevents overload |
| Skills | Agent qualifications | Matches work to agents |
| Work Types | Configurable work categories | Defines routing rules |
| Routing Configuration | Queue + capacity + skills | Core routing logic |
| Omni-Supervisor | Supervisor workspace | Real-time monitoring |

### Presence Configurations

| Presence | Description | Capacity |
|----------|-------------|----------|
| Available | Ready to accept | Full capacity |
| Offline | Not accepting | Zero |
| Auxiliary | On break, training | Zero |
| Oncoming | Future work | Zero |
| Chat | Only chats | Chat-specific |

### Work Types

| Work Type | Description | Example |
|-----------|-------------|---------|
| Case | Case record work | Assign to case queue |
| Chat | Live chat requests | Route to chat agents |
| Lead | Lead record work | Assign to sale queue |
| Custom Work | Custom object routing | Custom record routing |

### Omni-Channel vs. Traditional Assignment

| Aspect | Omni-Channel | Assignment Rules |
|--------|--------------|------------------|
| Real-time | Yes | No |
| Skills-based | Yes | No |
| Capacity-based | Yes | No |
| Presence-aware | Yes | No |
| Cross-channel | Yes | No |
| Configuration | Complex | Simple |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Skills-Based Routing | Match work to qualified agents | Better resolution |
| Capacity Management | Control agent workload | Prevent burnout |
| Presence Management | Real-time availability | Accurate routing |
| Cross-Channel Routing | Unify all channels | Consistent service |
| Omni-Supervisor | Real-time monitoring | Operational oversight |
| Supervisor Filters | Segment views | Targeted monitoring |
| Conversation Routing | Guided customer journeys | Personalized service |

## Step-by-Step: Omni-Channel Setup

### Step 1: Enable Omni-Channel

```
// Omni-Channel Setup
// Setup > Search: Omni-Channel

// Enable Omni-Channel: ✅
// License: Service Cloud Plus or add-on
// Default Service Presence: Available
// Enable Unified Messaging: ✅ (for SMS/Messaging)
```

### Step 2: Create Presence Configurations

```apex
// Presence Configuration
// Setup > Omni-Channel > Presence Configurations

// Presence Configuration: Support Presence
// Status: Available
// Capacity: 8
// Offline Status: Offline
// Permission to select status: ✅

// Presence Configuration: Chat-Only Presence
// Status: Chat
// Capacity: 4
// Offline Status: Offline
// Permission to select status: ✅
```

### Step 3: Define Skills

```apex
// Skill Configuration
// Setup > Search: Skills

// Skills:
// 1. Product Support - Enterprise Suite
// 2. Product Support - Professional
// 3. Billing
// 4. Technical Support
// 5. Premium Account Support
// 6. French Speaking
// 7. Spanish Speaking
```

### Step 4: Configure Routing

```apex
// Routing Configuration
// Setup > Omni-Channel > Routing Configurations

// Routing Configuration: Support Routing
// Work Types: Case, Chat
// Queue: General Support Queue
// Routing Model: Most Available
// Capacity: 8
// Skills: All standard skills
// IsActive: ✅
```

### Step 5: Implement Skills-Based Routing

```apex
// Apex: Skills-based case routing
public class SkillsBasedRouting {
    
    public static Id getBestAgent(Id caseId) {
        // Get case and requirements
        Case c = [
            SELECT Id, Product__c, Case_Language__c,
                   Account.Support_Tier__c
            FROM Case
            WHERE Id = :caseId
        ];
        
        // Build skill requirements
        Map<String, Integer> requiredSkills = new Map<String, Integer>();
        
        if (c.Product__c != null) {
            requiredSkills.put(
                'Product Support - ' + c.Product__c, 1
            );
        }
        
        if (c.Case_Language__c != null && c.Case_Language__c != 'English') {
            requiredSkills.put(
                c.Case_Language__c + ' Speaking', 1
            );
        }
        
        if (c.Account.Support_Tier__c == 'Premium') {
            requiredSkills.put('Premium Account Support', 1);
        }
        
        // Find available agents with required skills
        List<PresenceServiceWorkItem> results = new List<PresenceServiceWorkItem>();
        
        // Query eligible agents
        List<Id> agentIds = new List<Id>();
        for (SkillRequirement sr : [
            SELECT SkillId
            FROM SkillRequirement
            WHERE SkillId IN :getSkillIds(requiredSkills.keySet())
        ]) {
            agentIds.add(sr.SkillId);
        }
        
        // Find most available agent
        // (Simplified - actual logic uses Omni-Channel API)
        
        return null;
    }
    
    private static Set<Id> getSkillIds(Set<String> skillNames) {
        Set<Id> skillIds = new Set<Id>();
        for (Skill s : [
            SELECT Id FROM Skill
            WHERE MasterLabel IN :skillNames
        ]) {
            skillIds.add(s.Id);
        }
        return skillIds;
    }
}
```

## Step-by-Step: Omni-Supervisor

### Step 1: Enable Omni-Supervisor

```
// Omni-Supervisor Setup
// Setup > Omni-Channel > Omni-Supervisor

// Enable Omni-Supervisor: ✅
// Permissions:
// - Assign Omni-Supervisor Users: ✅
// - Assign Omni-Supervisor Admins: ✅
// - View Omni-Supervisor Dashboards: ✅

// Access:
// - Supervisors can view all queues
// - Supervisors can view all agents
// - Supervisors can reassign work
```

### Step 2: Configure Supervisor Views

```apex
// Omni-Supervisor View Configuration
// Setup > Omni-Channel > Omni-Supervisor Views

// View: Support Operations
// Queues: All Support Queues
// Columns:
// - Agent Name
// - Presence Status
// - Online Count
// - Offline Count
// - Available Capacity
// - Work in Queue

// View: Premium Support
// Queues: Premium Support Queue
// Filters: Support Tier = Premium
// Columns: Same + Support Tier
```

### Step 3: Monitor Agent Productivity

```soql
-- Agent productivity analytics
SELECT Owner.Name as AgentName,
       Status,
       COUNT() as CaseCount,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionDays,
       MIN(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as MinResolutionDays,
       MAX(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as MaxResolutionDays
FROM Case
WHERE Owner.Name IN (
    SELECT Name FROM User WHERE IsActive = true
)
AND CreatedDate = THIS_QUARTER
GROUP BY Owner.Name, Status
ORDER BY AgentName, Status
```

### Step 4: Omni-Supervisor Dashboards

```apex
// Dashboard Component Configuration
// Setup > Dashboards > Omni-Supervisor

// Standard Components:
// 1. Queue Wait Time
// 2. Agent Presence Status
// 3. Work Item Distribution
// 4. Skill Utilization
// 5. Service Level Agreement Compliance
// 6. Peak Hours Analysis
```

## Step-by-Step: SOQL for Omni-Channel Analytics

### Queue Metrics

```soql
-- Queue performance metrics
SELECT Queue.Name as QueueName,
       COUNT() as WorkItems,
       AVG(AgeHours) as AvgWaitTime,
       MAX(AgeHours) as MaxWaitTime
FROM Case
WHERE Status != 'Closed'
AND Owner.Type = 'Queue'
GROUP BY Queue.Name
ORDER BY AvgWaitTime DESC
```

### Agent Presence Metrics

```soql
-- Agent performance by presence
SELECT Owner.Name as AgentName,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionHours,
       COUNT() as CasesHandled,
       SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityCases
FROM Case
WHERE CreatedDate = THIS_WEEK
AND Owner.Type = 'User'
GROUP BY Owner.Name
ORDER BY CasesHandled DESC
```

### Channel Performance Comparison

```soql
-- Performance by case origin
SELECT Origin as Channel,
       COUNT() as CaseCount,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionDays,
       SUM(CASE WHEN Status = 'Escalated' THEN 1 ELSE 0 END) as Escalations
FROM Case
WHERE CreatedDate = THIS_QUARTER
GROUP BY Origin
ORDER BY CaseCount DESC
```

## Hands-On Tasks

1. **Enable Omni-Channel**: Turn on Omni-Channel in your org
2. **Configure Presence**: Set up presence configurations and capacity
3. **Define Skills**: Create skills for routing and assign to test agents
4. **Build Routing**: Configure routing with queue and skills
5. **Set Up Omni-Supervisor**: Enable supervisor view and configure dashboards
6. **Test Routing**: Simulate work distribution to test agent availability
7. **Monitor Performance**: Analyze agent and queue performance

## Self-Check Questions

1. What are the core components of Omni-Channel?
2. How does skills-based routing work?
3. What is the role of presence in routing decisions?
4. What does Omni-Supervisor provide?
5. How do you configure routing for multiple channels?

## Common Exam Traps

- **Trap**: Assuming Omni-Channel is included with all Service Cloud plans — it requires Service Cloud licenses.
- **Trap**: Forgetting that capacity limits agent work intake.
- **Trap**: Not considering skill-based routing for language support.
- **Trap**: Assuming Omni-Supervisor automatically monitors all queues.
- **Trap**: Overlooking that presence affects routing availability.

## Related

- **Phase**: 08 - Omni-Channel and Omni-Supervisor
- **Exam Domain**: Intake & Interaction Channels (13%)
- **Previous Phase**: 07 - Lightning Service Console
- **Next Phase**: 09 - Einstein Bots and Messaging
- **Resources**: [Omni-Channel Documentation](https://help.salesforce.com/s/articleView?id=sf.omni_overview.htm&type=5)