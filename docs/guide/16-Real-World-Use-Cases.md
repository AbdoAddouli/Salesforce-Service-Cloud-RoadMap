# Real-World Use Cases

## Overview

This guide presents three comprehensive, real-world Service Cloud use cases that mirror typical consulting engagements. Each use case describes a business scenario, requirements, and constraints. Use Case Solutions (Phase 17) provides the detailed implementation approach, configuration, and Apex/SOQL for each.

Work through each use case as if you were the consultant: read the scenario, identify requirements, design the solution, then compare your design against the provided solution in Phase 17.

## Use Case UC1: Global Support Center

### Scenario

**Company**: A multinational software company with 5,000 employees serving 15,000 B2B customers across 40 countries.

**Current state**: The company uses email inboxes for support (support@company.com), a shared spreadsheet to track issues, and no standardized process. Response times average 3 days. Customer satisfaction is at 62%. Cases are frequently duplicated across agents. There is no SLA definition or tracking.

**Business goals**:
1. Reduce average first response time from 3 days to under 4 hours
2. Achieve 90%+ SLA compliance for premium customers
3. Reduce case duplicates by 50%
4. Support email, web form, phone, and chat channels
5. Enable supervisors to monitor agent status in real time
6. Standardize agent workflows and communication

**Budget constraints**:
- Enterprise Edition licenses for 150 agents
- No additional data storage
- No custom hardware or on-premises integration
- 6-month implementation timeline

### Requirements

| # | Requirement | Priority |
|---|-------------|----------|
| R1 | Multichannel case intake (email, web, phone, chat) | Must |
| R2 | Automatic case routing by product and severity | Must |
| R3 | SLA tracking for premium vs. standard customers | Must |
| R4 | Real-time supervisor monitoring | Must |
| R5 | Standardized agent workflow tools | Must |
| R6 | Case-health dashboard with KPIs | Must |
| R7 | Knowledge base with self-service deflection | Should |
| R8 | Duplicate case detection and merging | Should |

### Constraints

- Existing data: 250,000 contacts, 80,000 accounts, 50,000 email threads of historical support data
- Email-to-Case must work without server infrastructure (no Email Agent)
- All customers must receive acknowledgment within 1 hour of case creation
- Agents should spend no more than 3 clicks to open a case from email

### Deliverables Expected

1. Solution architecture document
2. Data model design
3. Case lifecycle definition
4. SLA model design
5. Omni-Channel routing configuration
6. Console layout for agents
7. Operational dashboard design

## Use Case UC2: Lifecycle Enterprise

### Scenario

**Company**: A hardware manufacturer selling enterprise servers, network equipment, and storage devices. They have 2,000 dealers and 500 direct enterprise customers.

**Current state**: Support agreements are managed in paper contracts. Service level commitments differ by product and contract tier. There is no centralized system to track response and resolution times against commitments. The company is being audited for SLA compliance and needs historical evidence.

**Business goals**:
1. Enforce complex, product-specific SLA commitments
2. Track SLA compliance historically with entitlement versioning
3. Automate milestone breach detection and escalation
4. Report SLA compliance by contract, product line, and region
5. Support hardware-specific milestones (repair, replacement, remote diagnosis)

**Budget constraints**:
- Unlimited Edition licenses for 80 support engineers
- Incident management workflow already approved
- Requires integration with their order management system (OMS) for service contracts

### Requirements

| # | Requirement | Priority |
|---|-------------|----------|
| R1 | Service Contracts with product-specific entitlements | Must |
| R2 | Entitlement versioning for contract changes | Must |
| R3 | SLA milestones for: remote diagnosis, on-site repair, hardware replacement | Must |
| R4 | Milestone breach reporting by contract/product/region | Must |
| R5 | Business hours per region | Must |
| R6 | Integration with OMS for contract data | Must |
| R7 | Case-to-contract traceability for audits | Must |
| R8 | Auto-assignment of entitlements to cases | Should |

### Constraints

- Contracts have both fixed-duration (annual) and evergreen terms
- Some accounts have multiple active contracts for different product lines
- The OMS uses REST API
- Auditors need full audit trail of SLA calculations and changes
- Business hours differ per region (EMEA, AMER, APAC)

### Deliverables Expected

1. Service Contract and Entitlement data model
2. Entitlement process with hardware-specific milestones
3. OMS integration design (REST API + Apex)
4. Milestone breach notification flow
5. SLA compliance reporting architecture
6. Business hours strategy per region

## Use Case UC3: AI-Powered Helpdesk

### Scenario

**Company**: A mid-sized SaaS company (cloud-based HR and payroll software) with 25,000 end-user customers. They receive 8,000 tickets per month with a team of 12 tier-1 agents and 4 tier-2 specialists.

**Current state**: All tickets arrive via a generic email inbox. Agents manually classify tickets (25% are password resets, 20% are billing questions, 15% are feature requests) and manually search a knowledge base in a separate system. First response time is 6-8 hours. Only 35% of tickets are resolved on first contact. CSAT is 68%.

**Business goals**:
1. Automate handling of the top 3 ticket categories
2. Reduce tier-1 workload by 40% via deflection and automation
3. Achieve first response time under 2 hours
4. Reach 55% first contact resolution
5. Recommend articles to agents during case handling
6. Provide executives a service analytics dashboard

**Budget constraints**:
- Service Cloud Enterprise with Einstein add-ons available
- 20 agent licenses
- Existing website can host a chatbot (JavaScript snippet)
- 3-month implementation timeline

### Requirements

| # | Requirement | Priority |
|---|-------------|----------|
| R1 | Einstein Bot to handle password resets, billing, feature requests | Must |
| R2 | Automatic case classification by Einstein Case Classification | Must |
| R3 | Article recommendations to agents and customers | Must |
| R4 | Knowledge deflection to reduce ticket volume | Must |
| R5 | Service analytics dashboard for executives | Must |
| R6 | Omni-Channel for chat handoff to tier agents | Should |
| R7 | Survey at case closure | Should |

### Constraints

- Bot must not access PII beyond what standard Service Cloud offers
- Article recommendations must link from case subjects
- The solution must be implementable within 3 months by two admins
- Escalation to tier-2 must preserve conversation context

### Deliverables Expected

1. Bot dialog design for the 3 categories
2. Einstein Case Classification model configuration
3. Knowledge deflection funnel design
4. Omni-Channel chat configuration with bot handoff
5. Agent assist (article recommendations) configuration
6. Executive dashboard design

## Cross-Use Case Comparison

| Dimension | UC1 Global Support Center | UC2 Lifecycle Enterprise | UC3 AI-Powered Helpdesk |
|-----------|--------------------------|--------------------------|------------------------|
| Industry | Software (B2B) | Hardware manufacturing | SaaS (HR/payroll) |
| Team Size | 150 agents | 80 engineers | 16 agents |
| Case Volume | High | Medium | High (8k/month) |
| SLA Model | Tiered (premium vs standard) | Product/contract-specific | Simple (no SLA) |
| Channels | Email, web, phone, chat | Email, phone | Email, chat, bot |
| AI Usage | Minimal | None | High (bots, classification) |
| Key Complexity | Volume, supervision | Contract, region, audit | Deflection, classification |
| Timeline | 6 months | 6 months | 3 months |

## Consultant Approach Framework

For each use case, apply this framework:

### Step 1: Discovery
- Document current state (channels, pain points, metrics)
- Identify stakeholders and their needs
- Understand constraints (budget, licenses, timeline)

### Step 2: Solution Design
- Map requirements to platform features
- Design the data model extensions
- Define process flows and automation
- Design the reporting/analytics view

### Step 3: Build & Configure
- Configure in a sandbox
- Build custom objects, fields, flows
- Create reports and dashboards
- Integrate external systems

### Step 4: Test
- Validate against each requirement
- Test edge cases and bulk scenarios
- Verify SLA calculations with real data

### Step 5: Document & Handoff
- Configuration documentation
- Administrator training materials
- Dashboard and report catalog

## Hands-On Tasks

1. **Read UC1** and design a solution before reading Phase 17
2. **Identify requirements** for UC1 and map to platform features
3. **Read UC2** and design the entitlement model
4. **Compare solutions** with Phase 17 answers
5. **Read UC3** and design the bot dialog flow
6. **Evaluate constraints** — note where constraints changed your design
7. **Build a matrix** showing which features address which requirements

## Self-Check Questions

1. In UC1, what is the recommended intake strategy for multiple channels?
2. In UC2, how do you handle multiple active contracts per account?
3. In UC3, how do you measure knowledge deflection?
4. What distinguishes a "Must" from a "Should" requirement in evaluation?
5. How do budget and license constraints impact solution design?

## Common Exam Traps

- **Trap**: Over-engineering UC1 with AI features that aren't required.
- **Trap**: Ignoring the Email-to-Case constraint (no Email Agent) and recommending on-premises Email-to-Case.
- **Trap**: Overlooking entitlement versioning in UC2 despite the audit requirement.
- **Trap**: Failing to handle multi-region business hours in UC2.
- **Trap**: Not accounting for conversation context preservation in UC3 bot handoff.

## Related

- **Phase**: 16 - Real-World Use Cases
- **Exam Domain**: Service Cloud Solution Design (15%), Industry Knowledge (12%)
- **Previous Phase**: 15 - Answers and Results
- **Next Phase**: 17 - Use Case Solutions
- **Use Cases**: UC1, UC2, UC3
- **Time Investment**: 4-6 hours to design solutions before reading answers