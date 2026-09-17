# Use Case Solutions

## Overview

This guide provides complete, consultant-grade solutions for the three use cases presented in Phase 16. Each solution includes the recommended architecture, data model, configuration approach, automation design, and validation queries. Use these solutions to evaluate your own design and to understand the reasoning behind each recommendation.

For each use case, the solution is organized into: Solution Summary, Architecture, Data Model, Configuration Steps, Automation Design, and Validation.

## Use Case UC1: Global Support Center — Solution

### Solution Summary

For this B2B software company, the recommended implementation is:

| Requirement | Solution |
|-------------|----------|
| Multichannel intake | On-Demand Email-to-Case (no Email Agent), Web-to-Case, Omni-Channel Chat, CTI for phone |
| Case routing | Omni-Channel with routing configurations by product/severity |
| SLA tracking | Entitlements with premium (1h response) and standard (4h response) tiers |
| Supervisor monitoring | Omni-Supervisor with real-time agent and queue views |
| Agent workflows | Lightning Service Console with macros, quick text, highlight panel |
| Dashboard | Service Operations dashboard with KPI metrics |
| Knowledge deflection | Salesforce Knowledge with case-to-article suggestions |
| Duplicate management | Duplicate rules + case merge utility |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       INTAKE CHANNELS                        │
│  Email ──► On-Demand Email-to-Case                           │
│  Web    ──► Web-to-Case (HTML form + auto-response)          │
│  Phone  ──► CTI (screen pop + auto case creation)            │
│  Chat   ──► Omni-Channel Chat / Live Agent                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       INTAKE PROCESSES                       │
│  Auto-Response Rule (acknowledge within 1 hour)              │
│  Assignment Rules (product + severity → queue)               │
│  Duplicate Rule (detect, merge)                              │
│  Flow: assign Entitlement from Account tier                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE PROCESSES                      │
│  Entitlements (Premium: 1h first response, 24h resolve)     │
│  Entitlements (Standard: 4h first response, 48h resolve)    │
│  Milestones: First Response, Time to Resolve                  │
│  Escalation Flow: breach prevention                          │
│  Macros: escalate, close, update status                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      AGENT WORKSPACE                         │
│  Lightning Service Console (workspace tabs, split view)      │
│  Utility Bar: History, Notes, Email, Knowledge, Omni-Channel │
│  Highlight Panel: Status, Priority, Entitlement              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPERVISION & ANALYTICS                 │
│  Omni-Supervisor (agent presence, queue status)              │
│  Service Operations Dashboard (KPI metrics)                  │
│  SLA Compliance report by entitlement type                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Design

| Object | Type | Fields | Notes |
|--------|------|--------|-------|
| Case | Standard | Add: Product_Line__c, Severity__c, Resolution_Notes__c | Extension for routing |
| Entitlement | Standard | Standard fields | Tied to Account |
| Account | Standard | Add: Support_Tier__c (Picklist: Standard/Premium/Enterprise) | Drives SLA |
| Product_Line__c | Custom | Product_Family__c | Routing basis |
| Case_Extension__c (optional) | Custom | Resolution_Time__c, Escalation_History__c | Audit trail |

### Configuration Steps

**Step 1 — Enable Service Cloud and base setup**
```
Setup > Service Cloud Settings
- Enable Case: ✅
- Enable Auto-Response Rules: ✅
- Track Case History: ✅
```

**Step 2 — Configure intake channels**
```
Email: Setup > Email > On-Demand Email-to-Case
- Create support@company.com routing address
- Accept attachments
- Associate CRM content to Email-to-Case

Web: Setup > Customize > Cases > Web-to-Case
- Generate form with Subject, Description, Contact, Account
- Set Origin=Web, Status=New, Priority=Normal
- Configure Auto-Response Rule → welcome email
```

**Step 3 — Set up SLA entitlements**
```
Setup > Customize > Entitlements > Entitlement Processes
Process 1: Premium Support (24x7)
  Milestone: First Response (1 hour, business hours 24x7)
  Milestone: Time to Resolve (24 hours, business hours)
  Violation Action: Escalate to Tier-2, Email Alert manager

Process 2: Standard Support (business hours)
  Milestone: First Response (4 hours)
  Milestone: Time to Resolve (48 hours)
  Violation Action: Escalate, Email Alert

Setup > Entitlements > Entitlements
- Create for each account based on Support_Tier__c
```

**Step 4 — Route with Omni-Channel**
```
Setup > Omni-Channel > Presence Configurations
- Support Presence: capacity 8

Setup > Omni-Channel > Routing Configurations
- Routing: Premium Routing → Premium Queue (capacity 6)
- Routing: Standard Routing → Standard Queue (capacity 8)
- Skills: Product knowledge, language

Assign skills to agents:
- Enterprise Suite specialist → Enterprise queue skills
- Billing specialist → Billing queue skills
```

**Step 5 — Enable Order-to-Case / case merging**
```
Setup > Customize > Cases > Duplicate Rules
- Rule: Duplicate Case on Subject, Contact Email
- Action: Allow merge

Use case merge quickly when duplicate detected
```

**Step 6 — Build the Service Console**
```
App Manager > New App > Service Console
- Navigation: Cases, Accounts, Contacts, Knowledge, Dashboards
- Utility Bar: History, Notes, Email, Knowledge, Omni-Channel
- Case layout: highlight panel with Status/Priority/Entitlement

Case Page Layout
- Compact Layout: Case Number, Status, Priority
- Path: New → Working → Escalated → Resolved → Closed
```

**Step 7 — Auto-assign entitlement on case creation**

```apex
trigger CaseTrigger on Case (before insert) {
    Set<Id> accountIds = new Set<Id>();
    for (Case c : Trigger.new) {
        if (c.AccountId != null) accountIds.add(c.AccountId);
    }
    
    Map<Id, Account> accts = new Map<Id, Account>(
        [SELECT Id, Support_Tier__c FROM Account
         WHERE Id IN :accountIds]
    );
    
    Map<Id, Entitlement> entMap = new Map<Id, Entitlement>();
    for (Entitlement e : [
        SELECT Id, AccountId, Type
        FROM Entitlement
        WHERE AccountId IN :accountIds
        AND Status = 'Active'
        AND StartDate <= TODAY AND EndDate >= TODAY
    ]) {
        entMap.put(e.AccountId, e);
    }
    
    for (Case c : Trigger.new) {
        if (c.EntitlementId == null && entMap.containsKey(c.AccountId)) {
            c.EntitlementId = entMap.get(c.AccountId).Id;
        }
    }
}
```

### Automation Design

| Automation | Type | Purpose |
|------------|------|---------|
| Auto-Response Rule | Standard | Send acknowledgment email within 1 hour |
| Assignment Rule | Standard | Route to queue by product |
| Record-Triggered Flow | Flow | Set priority from severity, assign entitlement |
| Scheduled Flow | Flow | Escalate cases nearing SLA breach |
| Milestone Violation Actions | Entitlement | Escalate + email |

### Dashboard Design

| Component | Chart Type | Data Source |
|-----------|-----------|-------------|
| Total Open Cases | Metric | Case Volume report |
| SLA Compliance % | Gauge | SLA Compliance report |
| First Response Time | Metric | Case stats |
| Cases by Channel | Donut | Cases by Origin |
| Cases by Priority | Bar | Cases by Priority |
| Agent Workload | Table | Agent performance |
| Breach Alerts | Table | Milestone violation report |

### Validation Queries

```soql
-- Channel performance
SELECT Origin, COUNT() Count
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY Origin

-- SLA compliance by entitlement
SELECT Entitlement.Type,
       COUNT() Total,
       SUM(CASE WHEN Is_Violated__c = true THEN 1 ELSE 0 END) Breaches
FROM Case
WHERE EntitlementId != null AND ClosedDate = THIS_MONTH
GROUP BY Entitlement.Type
```

### UC1 Solution Rationale

- **On-Demand Email-to-Case** (not installed Email Agent) because the constraint prohibits server infrastructure.
- **Entitlements** handle the premium vs standard SLA difference using entitlement processes.
- **Omni-Channel** because the company has real-time supervision needs and multi-channel routing.
- **Macros + quick text** standardize agent workflows and cut click-path.
- **Duplicate rules + merge** address the 50% duplicate reduction goal.

## Use Case UC2: Lifecycle Enterprise — Solution

### Solution Summary

| Requirement | Solution |
|-------------|----------|
| Service Contracts with entitlements | Service Contract object + Entitlements linked by contract |
| Entitlement versioning | Entitlement Process versioning + field version tracking |
| Hardware milestones | Milestones: Remote Diagnosis, On-site Repair, Hardware Replacement |
| Breach reporting | Reports on CaseMilestones by breach, group by contract/product/region |
| Regional business hours | Business Hours per region (AMER, EMEA, APAC) |
| OMS integration | Apex REST callout to OMS + scheduled sync |
| Audit traceability | Case comments + field history + milestone logs |
| Auto-assign entitlements | Flow/trigger on Case creation |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 SERVICE CONTRACT LAYER                       │
│  ServiceContract (Name, AccountId, Status, StartDate,       │
│                    EndDate, ContractTerm)                    │
│    └── ContractLineItems (covered products)                  │
│    └── Entitlements (per product line, per region)           │
│          └── Entitlement Process (milestones)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     OMS INTEGRATION                          │
│  Scheduled Apex → REST GET order/contracts → upsert          │
│  Entitlement + ServiceContract records                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       SLA TRACKING                           │
│  Case → Entitlement (auto-assigned)                          │
│  Milestones per entitlement process                          │
│  Business Hours per region                                   │
│  Breach detection + escalation flow                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMPLIANCE REPORTING                     │
│  SLA Compliance by contract / product / region               │
│  Milestone breach history                                    │
│  Audit trail (field history + milestone logs)                │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Design

```
ServiceContract
  ├── Name
  ├── AccountId (Lookup)
  ├── Status (Active/Expired/Terminated)
  ├── StartDate, EndDate
  └── ContractTerm (Number)

ContractLineItem
  ├── ServiceContractId
  ├── PricebookEntryId → Product
  └── Quantity

Entitlement
  ├── Name
  ├── AccountId
  ├── ServiceContractId (Lookup)
  ├── EntitlementTypeId → Entitlement Process
  ├── StartDate, EndDate, Status
  └── Product_Line__c (for product-specific entitlements)

Case
  ├── EntitlementId (auto-assigned)
  └── MilestoneStatus__c (formula from CaseMilestones)
```

### Entitlement Process (per region)

```
Entitlement Process: Premium Hardware Support — EMEA
  Milestone 1: Remote Diagnosis
    Duration: 4 business hours (EMEA hours)
    Entry: Case.Status = New/Working
    Success: Case has diagnosis record
    Violation: Escalate to regional manager
  Milestone 2: On-site Repair
    Duration: 5 business days
    Entry: Diagnosis complete
    Success: Case closed
    Violation: Escalate + notify
  Milestone 3: Hardware Replacement
    Duration: 2 business days
    Entry: Replacement authorized
    Success: Case closed
    Violation: Notify logistics manager
```

### Business Hours Strategy

| Region | Business Hours Name | Schedule |
|--------|--------------------|----------|
| AMER | AMER Support Hours | Mon-Fri 8:00-18:00 America/New_York |
| EMEA | EMEA Support Hours | Mon-Fri 8:00-18:00 Europe/London |
| APAC | APAC Support Hours | Mon-Fri 9:00-18:00 Asia/Singapore |

Each entitlement stores a BusinessHoursId; milestones use the entitlement's business hours.

### OMS Integration Design

```apex
// Scheduled Apex: Sync contracts from OMS
public class OMSContractSync implements Schedulable {
    
    public void execute(SchedulableContext sc) {
        // 1. Call OMS REST endpoint for modified contracts
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:OMS_API/contracts?since=' + lastSyncTime);
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + getToken());
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // 2. Parse JSON response
        List<ContractData> contracts = 
            (List<ContractData>)JSON.deserialize(
                res.getBody(), List<ContractData>.class
            );
        
        // 3. Upsert ServiceContract + Entitlement records
        List<ServiceContract> contractsToUpsert = new List<ServiceContract>();
        List<Entitlement> entitlementsToUpsert = new List<Entitlement>();
        
        for (ContractData data : contracts) {
            ServiceContract sc2 = new ServiceContract(
                External_Id__c = data.externalId,
                Name = data.name,
                AccountId = findAccount(data.accountExternalId),
                StartDate = data.startDate,
                EndDate = data.endDate,
                Status = data.status,
                ContractTerm = data.term
            );
            contractsToUpsert.add(sc2);
        }
        
        upsert contractsToUpsert;
        
        // 4. Create entitlements from contract lines
        for (ContractData data : contracts) {
            for (ContractLineData line : data.lines) {
                Entitlement e = new Entitlement(
                    External_Id__c = data.externalId + ':' + line.productCode,
                    AccountId = findAccount(data.accountExternalId),
                    ServiceContractId = findContract(data.externalId),
                    EntitlementTypeId = findByProduct(line.productCode),
                    StartDate = data.startDate,
                    EndDate = data.endDate,
                    Status = data.status,
                    Product_Line__c = findByProductCode(line.productCode)
                );
                entitlementsToUpsert.add(e);
            }
        }
        
        upsert entitlementsToUpsert;
    }
}
```

### Validation Queries

```soql
-- Milestone breach by region
SELECT Business_Region__c,
       COUNT() Cases,
       SUM(CASE WHEN Milestone_Violated__c = true THEN 1 ELSE 0 END) Breaches
FROM Case
WHERE ClosedDate = THIS_QUARTER
GROUP BY Business_Region__c

-- Audit trace
SELECT Id, CaseNumber, Entitlement.Name,
       Entitlement.StartDate, Entitlement.EndDate,
       MilestoneStatus__c
FROM Case
WHERE AccountId = '001XX000003ABC'
ORDER BY CreatedDate DESC
```

### UC2 Solution Rationale

- **Service Contract + Entitlements** — product and contract-specific SLAs are modeled with one entitlement per product line per contract.
- **Entitlement Process versioning** satisfies the audit requirement (older cases keep the active process at creation time).
- **OMS REST integration** uses a scheduled Apex callout with external IDs for idempotent upserts.
- **Regional business hours** ensure accurate SLA calculation across timezones.
- **Hardware-specific milestones** directly address the remote-diagnosis, on-site-repair, replacement workflow.

## Use Case UC3: AI-Powered Helpdesk — Solution

### Solution Summary

| Requirement | Solution |
|-------------|----------|
| Einstein Bot (3 categories) | Bot dialogs: Password Reset, Billing, Feature Request |
| Automatic case classification | Einstein Case Classification trained on 8k tickets |
| Article recommendations | Agent Assist (article suggestions in console) + bot article links |
| Knowledge deflection | Publish self-service articles, bot answers common questions |
| Executive dashboard | Service analytics dashboard with CSAT, volume, deflection |
| Omni-Channel handoff | Bot → agent handoff via Omni-Channel routing |
| Closure survey | Survey via EmailTemplate on case closure |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER TOUCHPOINTS                      │
│  Website Chat Button ──► Einstein Bot                       │
│  Self-Service Portal ──► Knowledge Articles                  │
│  Email ──► On-Demand Email-to-Case                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   EINSTEIN LAYER                             │
│  Einstein Bot (3 dialogs)                                   │
│  Einstein Case Classification (category predictions)        │
│  Article Recommendation Engine                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CASE INTAKE & ROUTING                     │
│  Case created (bot or email)                                 │
│  Classification → predicted category                         │
│  Omni-Channel routing (chat → tier-1, escalation → tier-2)  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AGENT ASSISTANCE                          │
│  Case console with Agent Assist                              │
│  Article recommendations shown                              │
│  Macro to link article + close as deflected                 │
│  Closure survey email                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXECUTIVE ANALYTICS                         │
│  Deflection rate                                           │
│  First response time                                       │
│  % resolved by bot                                        │
│  CSAT                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Einstein Bot Dialog Design

```
DIALOG: Password Reset
Trigger: "password", "reset", "forgot login"
Flow:
  1. "I can help with password resets. Which product?"
  2. Collect product name
  3. "What's the email on the account?"
  4. Validate identity (existing contact or challenge)
  5. Provide reset instructions (from article)
  6. Ask "Did that resolve your issue?"
  7. If yes → mark conversation deflected
  8. If no → create case with description → hand off

DIALOG: Billing Question
Trigger: "bill", "invoice", "charge", "payment"
Flow:
  1. "I can help with billing. What would you like to know?"
  2. Menu: Invoice copy / Payment method / Refund / Other
  3. Sub-dialog per option referencing billing articles
  4. For complex billing → create case → hand to Billing Queue

DIALOG: Feature Request
Trigger: "feature", "enhancement", "request"
Flow:
  1. Collect feature description
  2. Create case with RecordType = Feature Request
  3. Confirm ID for future reference
```

### Einstein Case Classification Configuration

```
Setup > Einstein > Einstein Case Classification
- Enable: ✅
- Object: Case
- Model training: use 500+ classified cases (subject + description)
- Predicted fields: Category__c (Password/Billing/Feature/Other)

Flow: on case creation
  - Get predicted classification
  - Auto-assign Category__c
  - Route based on category: Billing → Billing Queue, Technical → Tier 1
```

### Knowledge Deflection Design

| Funnel Step | Metric | Target |
|-------------|--------|--------|
| Article views | Views count | 10k+/month |
| % views that lead to case | Deflection rate | >25% deflection |
| % bot resolved | Resolved by bot | 25% of conversations |
| % case closed by article | Agent uses article | >50% of cases |

```soql
-- Deflection query
SELECT COUNT() TotalCases,
       SUM(CASE WHEN Resolved_By_Bot__c = true THEN 1 ELSE 0 END) BotResolved,
       SUM(CASE WHEN Article_Used__c = true THEN 1 ELSE 0 END) ClosedByArticle
FROM Case
WHERE CreatedDate = THIS_QUARTER
```

### Agent Assist Configuration

```
Setup > Einstein > Einstein Agent Assist
- Enable: ✅
- Object: Case
- Data source: Knowledge__kav (published articles)
- Recommendation field: match on case Subject/Description
- Display: Article recommendations panel in console
```

### Omni-Channel Bot Handoff

```
Setup > Einstein Bots > Your Bot > Routing
- Handoff to Agent: ✅
- Queue: Tier-1 Queue (chat-capable agents)
- Presence: Chat Only (capacity 4)
- Conversation context: pass category + description + identified contact

Console: 
- Agents see bot chat transcripts in workspace
- Case link pre-created on handoff
```

### Executive Dashboard Design

| Component | Chart Type | Metric |
|-----------|-----------|--------|
| Total Tickets | Metric | Volume |
| First Response Time | Metric | FRT average |
| Deflection Rate | Metric | % articles preventing cases |
| Tickets by Category | Bar | Password / Billing / Feature |
| Resolved by Bot | Metric | % |
| CSAT | Metric | Survey score |
| Monthly Trend | Line | Volume over time |

### Validation Queries

```soql
-- Bot resolution rate
SELECT Channel, COUNT() Conversations,
       SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) Resolved
FROM Conversation
WHERE CreatedDate = THIS_MONTH
GROUP BY Channel

-- Category distribution
SELECT Category__c, COUNT() Count
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY Category__c
ORDER BY Count DESC
```

### UC3 Solution Rationale

- **Einstein Bot** handles the top 3 ticket categories because they are predictable and independent of the knowledge base.
- **Einstein Case Classification** reduces manual categorization by tier-1 agents.
- **Article recommendations** (Agent Assist) help agents close tickets faster and consistently.
- **Knowledge deflection** is the primary volume-reduction lever and is measurable in the dashboard.
- **Omni-Channel handoff** preserves conversation context so tier-2 gets full history.
- **Dashboard** gives executives visibility into the operational metrics that justify the investment.

## Cross-Use Case Evaluation

### What Each Use Case Tests

| Use Case | Key Skills Tested |
|----------|-------------------|
| UC1 | Multi-channel intake, SLA tiering, console design, supervision |
| UC2 | Service Contract modeling, entitlement versioning, API integration, audit |
| UC3 | Einstein bots, case classification, knowledge deflection, analytics |

### Common Mistakes in Each Use Case

| Use Case | Common Mistakes |
|----------|----------------|
| UC1 | Adding unnecessary features (AI) that complicate the design; forgetting the no-server constraint for email intake |
| UC2 | Using a single entropy process for all regions instead of region-specific business hours; forgetting entitlement versioning for audits |
| UC3 | Training the bot only on keywords without designing dialogs; neglecting to plan measured deflection |

## Hands-On Tasks

1. **Trace requirements to solution** for UC1 (map every R# to a feature)
2. **Build the UC1 data model** in your sandbox and test the assignment flow
3. **Design the UC2 entitlement process** with the three hardware milestones
4. **Simulate the OMS callout** with @future or @HttpPost in a sandbox
5. **Build the UC3 bot** with the three dialogs and test the handoff
6. **Create the UC3 executive dashboard** in your sandbox
7. **Write a one-page summary** for each use case as if presenting to a stakeholder

## Self-Check Questions

1. Why is On-Demand Email-to-Case the right choice for UC1?
2. How does entitlement process versioning support UC2's audit requirement?
3. What are the three hardware milestones in UC2, and why are they needed?
4. How does Einstein Case Classification reduce tier-1 workload in UC3?
5. What KPIs would you present to the UC3 executive team?

## Common Exam Traps

- **Trap**: Recommending installed Email Agent when constraints prohibit server infra.
- **Trap**: Using one global business hours model where regional hours are required.
- **Trap**: Forgetting entitlement auto-assignment — cases without entitlements have no SLA tracking.
- **Trap**: Not measuring deflection — the solution must quantify value.
- **Trap**: Building a bot with only one dialog that handles everything.
- **Trap**: Overlooking that Einstein Case Classification needs training data.

## Related

- **Phase**: 17 - Use Case Solutions
- **Exam Domain**: Service Cloud Solution Design (15%), Industry Knowledge (12%), Integrations (10%)
- **Previous Phase**: 16 - Real-World Use Cases
- **Use Cases**: UC1, UC2, UC3
- **Time Investment**: 3-6 hours to study solutions