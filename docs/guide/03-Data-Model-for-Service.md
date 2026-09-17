# Data Model for Service

## Overview

A well-designed data model is the foundation of any successful Service Cloud implementation. The data model determines how efficiently agents can access information, how effectively cases can be routed, and how accurately analytics can be generated. This guide covers the standard and custom objects used in Service Cloud, their relationships, lookup vs. master-detail considerations, and data model design patterns for common service scenarios.

Service Cloud leverages the core Salesforce data model while adding specialized objects for service-specific needs. Understanding these relationships is essential for certification and real-world implementation.

## Core Concepts

### Service Cloud Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Account    │◄──────│    Case      │──────►│   Contact    │
│              │       │              │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │                     │                       │
       │                     │                       │
       ▼                     ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Contract    │       │ Entitlement  │       │   Case       │
│              │       │              │       │   Comments   │
└──────────────┘       └──────────────┘       └──────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌──────────────┐       ┌──────────────┐
│  Account     │       │  Milestone   │
│  Assets      │       │  Type        │
└──────────────┘       └──────────────┘
```

### Key Objects and Relationships

| Object | Relationship Type | Related To | Purpose |
|--------|------------------|------------|---------|
| Case | Lookup | Contact | Person reporting issue |
| Case | Lookup | Account | Organization context |
| Case | Lookup | Entitlement | SLA agreement |
| Case | Master-Detail | CaseComment | Notes and updates |
| Case | Lookup | User/Queue | Case ownership |
| Entitlement | Lookup | Account | SLA holder |
| Entitlement | Lookup | Contract | Linked contract |
| MilestoneType | Parent | Entitlement | SLA milestone definitions |
| CaseMilestone | Junction | Case + MilestoneType | Active milestones |

### Lookup vs. Master-Detail

| Aspect | Lookup | Master-Detail |
|--------|--------|---------------|
| Parent deletion | Child preserved | Child deleted |
| Sharing | Inherited from parent | Controlled by parent |
| Required field | Optional | Always required |
| Roll-up summary | Not available | Available |
| Re-parenting | Allowed | Not allowed |
| Typical use | Case → Contact | CaseComment → Case |

### Data Model Design Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| Polymorphic Lookup | Single field points to multiple object types | Account OR Contact on a custom object |
| Junction Object | Many-to-many relationship | Cases linked to multiple products |
| Role Hierarchy | Hierarchical data access | Support tiers (L1, L2, L3) |
| Poly Hierarchy | Self-referential lookup | Product categories, org structure |
| Data Skew Mitigation | Distribution strategies | Large case volumes per account |

### Data Skew Considerations

| Skew Type | Threshold | Impact | Mitigation |
|-----------|-----------|--------|------------|
| Account-Case Skew | >10,000 cases/account | Report/chart failures | Split accounts or use external ID |
| Account-Contact Skew | >10,000 contacts/account | Sharing rule limits | Role hierarchy redesign |
| Role Hierarchy Skew | >10,000 users per role | Performance degradation | Flatten hierarchy |

## Key Features

| Feature | Description | Data Model Impact |
|---------|-------------|-------------------|
| Entitlements | SLA tracking | New object relationships |
| Milestones | SLA milestones | Child objects of entitlements |
| Case Teams | Collaborative resolution | Junction object for team members |
| Asset Management | Product tracking | Account-Asset relationships |
| Service Contracts | Contract management | Contract-Entitlement link |
| Custom Objects | Extended data model | Custom relationships |

## Step-by-Step: Building the Service Data Model

### Step 1: Core Case Relationships

```apex
// Custom Case fields for service-specific data model
// Setup > Customize > Cases > Fields

// 1. Product Line (Lookup to custom object)
// Object: Case
// Field Name: Product_Line__c
// Type: Lookup(Product_Line__c)

// 2. Service Region (Lookup to custom object)
// Object: Case
// Field Name: Service_Region__c
// Type: Lookup(Service_Region__c)

// 3. Root Cause (Lookup to custom object)
// Object: Case
// Field Name: Root_Cause__c
// Type: Lookup(Root_Cause__c)

// 4. Resolution Type (Picklist)
// Object: Case
// Field Name: Resolution_Type__c
// Values: Fix, Workaround, Known Issue, By Design, Cannot Reproduce
```

### Step 2: Create Supporting Objects

```apex
// Custom Object: Product_Line__c
// Fields:
// - Name (Standard Text)
// - Product_Family__c (Picklist)
// - Support_Tier__c (Picklist: Basic, Standard, Premium)
// - Active__c (Checkbox)
// - Owner__c (Lookup to User)

// Custom Object: Service_Region__c
// Fields:
// - Name (Standard Text)
// - Region_Code__c (Text, External ID)
// - Time_Zone__c (Picklist)
// - Support_Hours__c (Number)
// - Active__c (Checkbox)

// Custom Object: Root_Cause__c
// Fields:
// - Name (Standard Text)
// - Category__c (Picklist: Product, Process, People, Technology)
// - Sub_Category__c (Text)
// - Resolution_Template__c (Long Text)
// - Occurrence_Count__c (Number)
```

### Step 3: Configure Entitlement Relationships

```apex
// Entitlement object setup
// Setup > Customize > Entitlements

// Entitlement Fields:
// - Name (Standard Text)
// - AccountId (Lookup to Account)
// - ContractId (Lookup to Contract)
// - EntitlementTypeId (Lookup to EntitlementType)
// - StartDate (Date)
// - EndDate (Date)
// - Status (Picklist: Active, Inactive)

// MilestoneType (Custom Object or Standard)
// Fields:
// - Name (Text)
// - Description__c (Long Text)
// - Duration__c (Number)
// - DurationType__c (Picklist: Minutes, Hours, Days)
// - BusinessHoursId (Lookup to BusinessHours)
```

### Step 4: Implement Case Teams

```apex
// Case Team configuration
// Setup > Customize > Cases > Case Teams

// Team Roles:
// 1. Case Owner (Default) - Primary responsibility
// 2. Technical Support - Technical expertise
// 3. Product Specialist - Product knowledge
// 4. Account Manager - Customer relationship
// 5. Escalation Manager - Escalation oversight

// Default Team Members:
// Based on Account.Support_Tier__c:
// - Premium: All 5 roles
// - Standard: Case Owner, Technical Support, Account Manager
// - Basic: Case Owner only
```

## Step-by-Step: SOQL for Data Model Queries

### Querying Case Relationships

```soql
-- Cases with full relationship data
SELECT Id, CaseNumber, Subject, Status,
       Contact.Name, Contact.Email, Contact.Phone,
       Account.Name, Account.Support_Tier__c,
       Entitlement.Name, Entitlement.Type,
       Product_Line__r.Name, Product_Line__r.Product_Family__c,
       Service_Region__r.Name,
       (SELECT Id, CommentBody, CreatedBy.Name
        FROM CaseComments
        ORDER BY CreatedDate DESC)
FROM Case
WHERE Status != 'Closed'
AND CreatedDate = LAST_N_DAYS:30
```

### Case Volume by Relationship

```soql
-- Case distribution by product line
SELECT Product_Line__r.Name as ProductLine,
       Service_Region__r.Name as Region,
       COUNT() as CaseCount,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionDays
FROM Case
WHERE CreatedDate = THIS_QUARTER
GROUP BY Product_Line__r.Name, Service_Region__r.Name
ORDER BY CaseCount DESC
```

### Entitlement Coverage Analysis

```soql
-- Accounts with and without entitlements
SELECT Id, Name, 
       (SELECT Id, Name, Status, StartDate, EndDate
        FROM Entitlements
        WHERE Status = 'Active') as ActiveEntitlements,
       (SELECT Id, Status
        FROM Cases
        WHERE Status != 'Closed') as OpenCases
FROM Account
WHERE Id IN (SELECT AccountId FROM Case WHERE Status != 'Closed')
```

## Apex for Data Model Management

### Trigger for Relationship Integrity

```apex
trigger CaseRelationshipTrigger on Case (before insert, before update) {
    
    // Enforce required relationships for certain case types
    if (Trigger.isInsert || Trigger.isUpdate) {
        
        Set<Id> productLineIds = new Set<Id>();
        Set<Id> serviceRegionIds = new Set<Id>();
        
        for (Case c : Trigger.new) {
            if (c.Product_Line__c != null) {
                productLineIds.add(c.Product_Line__c);
            }
            if (c.Service_Region__c != null) {
                serviceRegionIds.add(c.Service_Region__c);
            }
        }
        
        // Validate product lines are active
        if (!productLineIds.isEmpty()) {
            Map<Id, Product_Line__c> productLines = new Map<Id, Product_Line__c>(
                [SELECT Id, Name, Active__c
                 FROM Product_Line__c
                 WHERE Id IN :productLineIds]
            );
            
            for (Case c : Trigger.new) {
                if (c.Product_Line__c != null) {
                    Product_Line__c pl = productLines.get(c.Product_Line__c);
                    if (pl != null && !pl.Active__c) {
                        c.addError('Cannot assign inactive product line: ' + pl.Name);
                    }
                }
            }
        }
        
        // Validate service regions are active
        if (!serviceRegionIds.isEmpty()) {
            Map<Id, Service_Region__c> regions = new Map<Id, Service_Region__c>(
                [SELECT Id, Name, Active__c
                 FROM Service_Region__c
                 WHERE Id IN :serviceRegionIds]
            );
            
            for (Case c : Trigger.new) {
                if (c.Service_Region__c != null) {
                    Service_Region__c region = regions.get(c.Service_Region__c);
                    if (region != null && !region.Active__c) {
                        c.addError('Cannot assign inactive service region: ' + region.Name);
                    }
                }
            }
        }
    }
}
```

### Data Migration Helper

```apex
public class ServiceDataMigration {
    
    public static void migrateCaseRelationships(List<Case> cases) {
        // Build lookup maps
        Map<String, Id> productLineMap = new Map<String, Id>();
        Map<String, Id> regionMap = new Map<String, Id>();
        
        // Populate maps from reference data
        for (Product_Line__c pl : [SELECT Id, Name FROM Product_Line__c]) {
            productLineMap.put(pl.Name.toLowerCase(), pl.Id);
        }
        
        for (Service_Region__c region : [SELECT Id, Name FROM Service_Region__c]) {
            regionMap.put(region.Name.toLowerCase(), region.Id);
        }
        
        // Update cases with correct relationships
        List<Case> casesToUpdate = new List<Case>();
        
        for (Case c : cases) {
            Boolean needsUpdate = false;
            
            // Map product name to product line lookup
            if (c.Product__c != null && c.Product_Line__c == null) {
                Id productLineId = productLineMap.get(c.Product__c.toLowerCase());
                if (productLineId != null) {
                    c.Product_Line__c = productLineId;
                    needsUpdate = true;
                }
            }
            
            // Map region name to service region lookup
            if (c.Region__c != null && c.Service_Region__c == null) {
                Id regionId = regionMap.get(c.Region__c.toLowerCase());
                if (regionId != null) {
                    c.Service_Region__c = regionId;
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                casesToUpdate.add(c);
            }
        }
        
        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate;
        }
    }
}
```

## Hands-On Tasks

1. **Design ERD**: Create an entity-relationship diagram for your service data model
2. **Build Custom Objects**: Create Product_Line__c and Service_Region__c objects
3. **Configure Relationships**: Set up lookup and master-detail relationships
4. **Implement Validation**: Create validation rules for required relationships
5. **Test Data Skew**: Import 10,000+ cases per account and observe performance
6. **Write SOQL**: Query cases with all related objects in a single query
7. **Build Trigger**: Enforce relationship integrity on case insert/update

## Self-Check Questions

1. What is the difference between lookup and master-detail relationships?
2. How does data skew impact Service Cloud performance?
3. When would you use a junction object in a service data model?
4. What are the key relationships on the Case object?
5. How do you handle multi-select relationships in SOQL?

## Common Exam Traps

- **Trap**: Assuming all relationships are master-detail — most Case relationships are lookup.
- **Trap**: Forgetting that data skew can cause report and sharing rule failures.
- **Trap**: Not considering data migration when redesigning the data model.
- **Trap**: Overlooking that roll-up summaries require master-detail relationships.
- **Trap**: Assuming you can re-parent master-detail relationships.

## Related

- **Phase**: 03 - Data Model for Service
- **Exam Domain**: Service Cloud Solution Design (15%)
- **Previous Phase**: 02 - Case Object and Lifecycle
- **Next Phase**: 04 - Entitlements, Milestones, and SLA
- **Resources**: [Salesforce Data Model Documentation](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_erd.htm)
