# Salesforce Service Cloud Consultant Roadmap

A complete, hands-on learning academy for the **Salesforce Certified Agentforce Service Consultant** exam (formerly *Salesforce Certified Service Cloud Consultant*). It ships as a deployable **Salesforce DX metadata project** plus an **interactive study site** served from `docs/`.

- **Live site**: [https://abdoaddouli.github.io/Salesforce-Service-Cloud-RoadMap/](https://abdoaddouli.github.io/Salesforce-Service-Cloud-RoadMap/) — or open [`docs/index.html`](docs/index.html) directly — 17 self-paced phases with lessons, quizzes, exercises, and progress saved in your browser.
- **Deployable lab org**: everything under [`force-app/`](force-app/main/default) compiles into a Developer/scratch org.
- **17 study guides**: canonical markdown in [`developer Service Cloud Consultant Roadmap/`](developer%20Service%20Cloud%20Consultant%20Roadmap), mirrored to [`docs/guide/`](docs/guide).

![API](https://img.shields.io/badge/API-v68.0-00a1e0) ![Apex](https://img.shields.io/badge/Apex%20classes-22-1798c1) ![Phases](https://img.shields.io/badge/Phases-17-7c3aed) ![PRs](https://img.shields.io/badge/PRs-welcome-8b5cf6)

## Exam facts (Spring '26)

| Detail | Value |
| --- | --- |
| Exam | Salesforce Certified Agentforce Service Consultant (CRT-150) |
| Questions | 60 scored + up to 5 unscored |
| Duration | 105 minutes |
| Passing score | 78% (English), 67% (Japanese) |
| Fee | $200 (retake $100) |
| Prerequisite | Salesforce Certified Platform Administrator |

Top domains: **Case Management 32%**, Service Cloud Platform 13%, Interaction Channels 11%, Knowledge Management 10%, Contact Center Analytics 9%, Service Cloud Solution Design 9%, Integrations 8%, Service Console 8%. Full details in [`13-Certification-Prep.md`](developer%20Service%20Cloud%20Consultant%20Roadmap/13-Certification-Prep.md).

## The 17 phases

1. Service Cloud Concepts & Architecture
2. The Case Object & Lifecycle
3. Data Model & Relationships for Service
4. Entitlements, Milestones & SLA
5. Service Process Automation
6. Knowledge Management
7. Lightning Service Console
8. Omni-Channel & Omni Supervisor
9. Einstein Bots & Messaging
10. CTI / Open CTI & Telephony
11. Case Management Best Practices
12. Reports & Dashboards for Service
13. Certification Prep
14. Practical Exercises & Mini Projects
15. Answers & Results
16. Real-World Use Cases
17. Use Case Solutions

## What's in the repo

```
├── config/                        # Scratch org definition
├── developer Service Cloud Consultant Roadmap/   # 17 canonical guides
├── docs/                          # Interactive GitHub-Pages site
│   ├── index.html
│   ├── guide/                     # Guide mirrors consumed by the site
│   └── assets/                    # app.js (engine), curriculum.js, answers.js, style.css
├── force-app/main/default/
│   ├── classes/                   # 10 service classes + 11 @isTest classes
│   ├── triggers/                  # 7 thin triggers → TriggerHandlerService
│   ├── objects/                   # SLA_Compliance__c, Service_Routing_Log__c,
│   │                              # Training_Question__c, Knowledge_Article_Metrics__c,
│   │                              # Certification_Setting__mdt (+ Case/Account/Contact ext.)
│   ├── flows/                     # 6 record-triggered flows
│   ├── dashboards/  reports/      # 1 dashboard + 2 reports
│   ├── email/       tabs/  permissionsets/  approvalProcesses/  assignmentRules/
│   └── platformEvent/             # Service_Event__e
├── manifest/package.xml
└── sfdx-project.json
```

## Metadata in the lab org

**10 Apex service classes** — `CaseRoutingService`, `EntitlementMilestoneService`, `SlaComplianceService`, `EscalationService`, `OmniChannelService`, `KnowledgeService`, `CaseProcessService`, `EinsteinRecommendationService`, `ServiceReportService`, `CaseTriggerHandlerService` — each with a bulk-safe `@isTest` class (`with sharing`, `@TestSetup`), plus `ServiceCloudFundamentalsTest`.

**7 triggers** delegate to `TriggerHandlerService` / `CaseTriggerHandlerService`: `Case`, `Entitlement`, `Milestone`, `ServiceContract`, `CaseComment`, `KnowledgeArticleVersion`, `SLACompliance`.

**6 flows** — `Case_Init_Flow`, `Case_Assignment_Flow`, `Case_Escalation_Flow`, `SLA_Reminder_Flow`, `Entitlement_Check_Flow`, `Training_Quiz_Scoring_Flow`.

**5 custom objects** — `SLA_Compliance__c`, `Service_Routing_Log__c`, `Knowledge_Article_Metrics__c`, `Training_Question__c`, and `Certification_Setting__mdt` (with the `Service_Cloud_Consultant_Exam` record carrying the real exam facts shown above).

**Plus** a permission set (`Service_Cloud_Consultant`), 3 custom tabs, assignment rules, an approval process, 2 email templates, and the `Service_Event__e` platform event.

## Quick start

```bash
# 1. Open the interactive study site
start docs/index.html

# 2. Stand up the lab org and deploy the metadata
sf org create scratch -f config/project-scratch-def.json -a scc-lab \
  --set-default --duration-days 30
sf project deploy start -d force-app
sf org assign permset -n Service_Cloud_Consultant

# 3. Push sample data (organizer scripts in scripts/, one-off .apex/.soql in scripts/apex|soql)
sf apex run --file scripts/apex/case-lifecycle.apex
```

Prerequisites follow the exam: create a Platform Developer/Administrator org, enable Service Cloud and Knowledge features (`ServiceKnowledge`, `ServiceUser` are already in the scratch-def), then work phases 1 → 17.

## CI / tooling

- **Prettier + Apex**: `npm run prettier`, `npm run lint`, `npm run test:unit` (LWC jest).
- **Husky pre-commit** runs `lint-staged` (Prettier + ESLint).
- Requires Node ≥ 20 and the Salesforce CLI (SFDX) with API 68.0.

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for layered diagrams (service layer, data model relationships, trigger→service wiring, CI workflow).

## License & contributing

For learning purposes. PRs welcome — the tests in [`force-app/main/default/classes`](force-app/main/default/classes) keep every service honest and the guides in `docs/` mirror the same exercises.