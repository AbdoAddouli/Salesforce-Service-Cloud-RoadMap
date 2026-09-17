const GUIDE = '';
const ACADEMY = [
  {
    id: 'svc-fund',
    n: 1,
    title: 'Service Cloud Concepts & Architecture',
    icon: '01',
    color: '#4F46E5',
    tagline: 'Understand what Service Cloud is, its architecture, and when to use it.',
    guide: '01-Service-Cloud-Concepts-and-Architecture.md',
    art: [
      { label: 'Architecture Diagram', href: 'config/project-scratch-def.json' },
      { label: 'Feature Comparison Matrix', href: 'force-app/main/default/permissionsets/Service_Cloud_Consultant.permissionset-meta.xml' }
    ],
    objectives: [
      'Define Service Cloud and explain its core value proposition',
      'Distinguish between Service Cloud and other Salesforce clouds',
      'Describe the shared-nothing multitenant architecture',
      'Compare license types and editions for Service Cloud',
      'Identify when Service Cloud is the right solution',
      'Explain the role of APIs and integrations in the Service Cloud ecosystem'
    ],
    lessons: [
      {
        title: 'What is Service Cloud & When to Use It',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Service Cloud Overview' },
          { t: 'p', x: 'Salesforce Service Cloud is a customer service and support platform that enables companies to manage customer issues, track cases, and deliver personalized service across multiple channels. It is built on the Salesforce platform and leverages the power of CRM to unify customer data with service interactions.' },
          { t: 'table', head: ['Cloud', 'Primary Focus', 'Key Objects'], rows: [
            ['Service Cloud', 'Customer support & case management', 'Case, Knowledge, Entitlement'],
            ['Sales Cloud', 'Lead & opportunity management', 'Lead, Opportunity, Account'],
            ['Experience Cloud', 'Self-service portals & communities', 'Account, Contact, Knowledge'],
            ['Marketing Cloud', 'Marketing automation & journeys', 'Journey, Contact, Campaign']
          ]},
          { t: 'h', x: 'When to Choose Service Cloud' },
          { t: 'list', items: [
            'You need structured case management with escalation paths',
            'Your support team handles high volumes of customer inquiries',
            'You require multi-channel support (phone, email, chat, social)',
            'You need SLA tracking and entitlement management',
            'You want to build a knowledge base for agents and customers',
            'You need real-time supervisor monitoring of agent activity'
          ]},
          { t: 'callout', kind: 'tip', x: 'Service Cloud is not just a ticketing system \u2014 it is a full CRM-powered service platform with AI, automation, and analytics built in.' },
          { t: 'code', lang: 'apex', x: '// Verify Service Cloud features available in the org\nSELECT Id, Name, Features,\n       OrganizationType,\n       IsSandbox\nFROM Organization\n\n// Check whether knowledge is enabled\nSELECT Id, IsKnowledgeEnabled,\n       IsNamedCredentialEnabled\nFROM FeatureUsage\nLIMIT 1\n\n// Inspect standard service objects present\nSELECT Id, QualifiedApiName, Label\nFROM EntityDefinition\nWHERE QualifiedApiName IN (\n    \'Case\', \'Entitlement\', \n    \'Milestone\', \'ServiceContract\'\n)' },
          { t: 'selfcheck', q: 'What is the primary difference between Service Cloud and a basic helpdesk tool?', a: 'Service Cloud provides CRM-integrated case management with AI, automation, knowledge management, omnichannel routing, and analytics \u2014 all built on the Salesforce platform with full access to the underlying data model.' }
        ]
      },
      {
        title: 'Service Data Model & Shared-Nothing Architecture',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Multitenant Architecture' },
          { t: 'p', x: 'Salesforce operates on a shared-nothing, multitenant architecture. Each tenant (org) has its own data, metadata, and configuration, but they share the same infrastructure and application logic. This means no two orgs can affect each other\'s performance or data integrity.' },
          { t: 'list', items: [
            'Metadata-driven development: All configuration is stored as metadata',
            'Isolated data: Each org\'s data is logically separated',
            'Shared compute: Infrastructure is pooled but resource-governed',
            'Automatic upgrades: All tenants receive platform updates simultaneously'
          ]},
          { t: 'h', x: 'Key Service Cloud Objects' },
          { t: 'table', head: ['Object', 'Purpose', 'Key Fields'], rows: [
            ['Case', 'Tracks customer issues', 'CaseNumber, Status, Priority, Origin'],
            ['Contact', 'Customer identity', 'Name, Email, Phone, AccountId'],
            ['Account', 'Company/organization', 'Name, Industry, Phone, Type'],
            ['Entitlement', 'SLA agreement', 'Name, StartDate, EndDate, Status'],
            ['Milestone', 'SLA target', 'Name, TargetDate, IsCompleted'],
            ['Knowledge__kav', 'Support articles', 'Title, Summary, UrlName, PublicationStatus'],
            ['CaseComment', 'Case updates', 'CommentBody, IsPublished']
          ]},
          { t: 'code', lang: 'apex', x: 'SELECT Id, CaseNumber, Subject, Status, Priority, Origin,\n       Contact.Name, Contact.Email, Account.Name,\n       Entitlement.Name, Entitlement.EndDate\nFROM Case\nWHERE Status = \'Open\'\nORDER BY Priority DESC, CreatedDate ASC\nLIMIT 100' },
          { t: 'callout', kind: 'tip', x: 'The Case object is the heart of Service Cloud. Every customer interaction \u2014 whether from email, phone, chat, or social \u2014 ultimately creates or updates a Case record.' },
          { t: 'selfcheck', q: 'What does "shared-nothing" mean in the context of Salesforce architecture?', a: 'Each tenant (org) has completely isolated data and metadata. While tenants share the same infrastructure and application code, no org can access or impact another org\'s data or performance.' }
        ]
      },
      {
        title: 'Licenses, Editions & Feature Comparisons',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Service Cloud License Types' },
          { t: 'table', head: ['License', 'User Type', 'Key Capabilities'], rows: [
            ['Service Cloud', 'Full agent', 'Cases, Knowledge, Entitlements, Omni-Channel, Console'],
            ['Service Cloud Community', 'Portal user', 'Self-service, case creation, knowledge access'],
            ['Service Cloud Light', 'Basic agent', 'Cases, basic console, limited automation'],
            ['Customer Community', 'External user', 'Self-service portal, knowledge access'],
            ['Customer Community Plus', 'External user', 'Cases, ideas, knowledge, reports']
          ]},
          { t: 'h', x: 'Edition Comparison' },
          { t: 'table', head: ['Feature', 'Professional', 'Enterprise', 'Unlimited'], rows: [
            ['Case Management', 'Yes', 'Yes', 'Yes'],
            ['Knowledge', 'Add-on', 'Yes', 'Yes'],
            ['Omni-Channel', 'No', 'Yes', 'Yes'],
            ['Entitlements', 'Add-on', 'Yes', 'Yes'],
            ['Einstein Bots', 'No', 'Add-on', 'Yes'],
            ['Field Service Lightning', 'No', 'Add-on', 'Add-on'],
            ['API Calls', 'Limited', 'Standard', 'High']
          ]},
          { t: 'code', lang: 'apex', x: '// Check current org edition and features\n// via Setup > Company Information\n// Or query via Tooling API:\nSELECT Id, Name, Features, OrganizationType\nFROM Organization' },
          { t: 'callout', kind: 'warn', x: 'Always verify feature availability by edition before designing a solution. Enterprise edition is the minimum for Omni-Channel and Entitlements out of the box.' },
          { t: 'selfcheck', q: 'Which Salesforce edition is the minimum required for Omni-Channel routing?', a: 'Enterprise Edition. Omni-Channel is not available in Professional Edition. Entitlements are also not available in Professional Edition without an add-on.' }
        ]
      }
    ],
    quiz: {
      title: 'Service Cloud Fundamentals Quiz',
      mins: 10,
      questions: [
        { q: 'Which object is the central record for tracking customer issues in Service Cloud?', opts: ['Account', 'Contact', 'Case', 'Lead'], a: 2, why: 'The Case object is the primary record for tracking customer issues, requests, and inquiries in Service Cloud.' },
        { q: 'What does "shared-nothing" architecture mean in Salesforce?', opts: ['No data is shared between orgs', 'All orgs share the same database', 'Metadata is not shared', 'APIs cannot be shared'], a: 0, why: 'In a shared-nothing architecture, each org has completely isolated data and metadata, even though they share the same infrastructure.' },
        { q: 'Which license provides full access to Omni-Channel, Knowledge, and Entitlements?', opts: ['Service Cloud Light', 'Customer Community', 'Service Cloud (Enterprise+)', 'Partner Community'], a: 2, why: 'Full Service Cloud licenses on Enterprise edition and above include Omni-Channel, Knowledge, and Entitlements capabilities.' }
      ]
    }
  },
  {
    id: 'case-lifecycle',
    n: 2,
    title: 'The Case Object & Lifecycle',
    icon: '02',
    color: '#7C3AED',
    tagline: 'Master case fields, statuses, record types, and intake channels.',
    guide: '02-Case-Object-and-Lifecycle.md',
    art: [
      { label: 'Case Lifecycle Diagram', href: 'force-app/main/default/triggers/CaseTrigger.trigger' },
      { label: 'Case Fields Reference', href: 'force-app/main/default/classes/CaseProcessService.cls' }
    ],
    objectives: [
      'Configure case fields, record types, and page layouts',
      'Design a case status lifecycle appropriate for the business',
      'Set up Web-to-Case and Email-to-Case intake channels',
      'Explain On-Demand Email-to-Case vs Email-to-Case',
      'Manage case assignment rules and auto-response rules',
      'Understand case feeds and collaboration features'
    ],
    lessons: [
      {
        title: 'Case Fields, Record Types & Page Layouts',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Standard Case Fields' },
          { t: 'table', head: ['Field', 'API Name', 'Type', 'Description'], rows: [
            ['Case Number', 'CaseNumber', 'Auto-Number', 'Unique identifier'],
            ['Status', 'Status', 'Picklist', 'Current state of the case'],
            ['Priority', 'Priority', 'Picklist', 'Urgency level: Low, Medium, High, Critical'],
            ['Origin', 'Origin', 'Picklist', 'Source: Phone, Email, Web, Chat, Social'],
            ['Reason', 'Reason', 'Picklist', 'Reason for the case'],
            ['Type', 'Type', 'Picklist', 'Type of issue'],
            ['Contact', 'ContactId', 'Lookup', 'Related contact'],
            ['Account', 'AccountId', 'Lookup', 'Related account'],
            ['Entitlement', 'EntitlementId', 'Lookup', 'Related entitlement'],
            ['Owner', 'OwnerId', 'Lookup', 'Assigned agent or queue']
          ]},
          { t: 'h', x: 'Record Types Control Behavior' },
          { t: 'p', x: 'Record types determine which picklist values, page layouts, and business processes are available for different types of cases. For example, a "Billing Issue" record type might show different status values than a "Technical Support" record type.' },
          { t: 'num', items: [
            'Create the Record Type in Setup > Object Manager > Case > Record Types',
            'Select the appropriate Business Process (Case Support Process)',
            'Assign available picklist values for each field',
            'Assign Page Layouts per profile or role',
            'Set the default record type for each profile'
          ]},
          { t: 'code', lang: 'apex', x: '// Query cases by record type\nSELECT Id, CaseNumber, RecordType.Name, Status, Priority\nFROM Case\nWHERE RecordType.DeveloperName = \'Technical_Support\'\nAND Status NOT IN (\'Closed\', \'Escalated\')' },
          { t: 'callout', kind: 'tip', x: 'Use Record Types sparingly. Too many record types create administrative overhead. Consider using a single record type with custom fields instead when differences are minor.' },
          { t: 'selfcheck', q: 'What three things do Record Types control on the Case object?', a: 'Record Types control which picklist values are available, which page layout is displayed, and which business process (support process) is used for the case lifecycle stages.' }
        ]
      },
      {
        title: 'Case Status Lifecycle & Feed',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Designing the Status Lifecycle' },
          { t: 'p', x: 'The case status lifecycle defines the stages a case moves through from creation to resolution. A well-designed lifecycle should be simple enough for agents to follow but detailed enough to provide meaningful reporting.' },
          { t: 'table', head: ['Status', 'Description', 'Typical Next Status'], rows: [
            ['New', 'Recently created, not yet assigned', 'Assigned / Working'],
            ['Assigned', 'Assigned to an agent or queue', 'Working'],
            ['Working', 'Agent is actively investigating', 'Escalated / Pending / Closed'],
            ['Pending', 'Awaiting customer or third-party response', 'Working / Closed'],
            ['Escalated', 'Moved to higher tier or manager', 'Working / Closed'],
            ['Closed', 'Issue resolved and verified', 'N/A (terminal)']
          ]},
          { t: 'h', x: 'Case Feed' },
          { t: 'p', x: 'Case Feed provides a chronological, social-media-style timeline of all case interactions. It shows emails, tasks, calls, field changes, and Chatter posts in a unified view.' },
          { t: 'list', items: [
            'Email messages sent and received are logged to the feed',
            'Field changes appear as feed items with before/after values',
            'Tasks and call logs show agent activities',
            'Chatter posts enable team collaboration on the case',
            'Feed filtering lets agents focus on specific activity types'
          ]},
          { t: 'code', lang: 'apex', x: '// Query case feed items\nSELECT Id, CreatedDate, CreatedBy.Name,\n       Type, Body, FeedPost.Body\nFROM CaseFeed\nWHERE ParentId = \'500XX0000012345\'\nORDER BY CreatedDate DESC\nLIMIT 20' },
          { t: 'selfcheck', q: 'Why is keeping the status lifecycle simple important for reporting?', a: 'Complex status lifecycles with too many values make it difficult to track meaningful metrics like average resolution time. A simpler lifecycle with clear stage definitions enables more accurate and actionable reporting.' }
        ]
      },
      {
        title: 'Web-to-Case, Email-to-Case & On-Demand Email-to-Case',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Intake Channel Comparison' },
          { t: 'table', head: ['Channel', 'Setup Complexity', 'Real-Time', 'Attachment Support', 'Use Case'], rows: [
            ['Web-to-Case', 'Low', 'Yes', 'Yes', 'Website support forms'],
            ['Email-to-Case', 'Medium', 'Yes (Agent)', 'Yes', 'Dedicated support email'],
            ['On-Demand Email-to-Case', 'Low', 'Yes (Agent)', 'Yes', 'No agent installed'],
            ['Chat', 'Medium', 'Yes', 'Limited', 'Live website chat'],
            ['Social', 'High', 'Yes', 'Yes', 'Twitter, Facebook']
          ]},
          { t: 'h', x: 'Web-to-Case Setup' },
          { t: 'p', x: 'Web-to-Case creates a hidden HTML form that can be embedded on your website. When a customer submits the form, a Case record is automatically created in Salesforce. You can configure auto-response rules to send confirmation emails.' },
          { t: 'num', items: [
            'Enable Web-to-Case in Setup > Web-to-Case',
            'Generate the HTML form with required fields',
            'Set the default values for hidden fields (Origin, Status)',
            'Configure Auto-Response Rules to acknowledge receipt',
            'Add the form to your website or portal'
          ]},
          { t: 'h', x: 'Email-to-Case Architecture' },
          { t: 'p', x: 'Email-to-Case uses an installed Email Agent on your network that monitors a support mailbox. The agent downloads emails and creates Case records in Salesforce. This requires a Windows server running the Email Agent service.' },
          { t: 'p', x: 'On-Demand Email-to-Case removes the need for the installed agent. Salesforce handles email processing in the cloud. However, the Email Agent is still needed if you want to send emails from the Case originator\'s address rather than a Salesforce-generated address.' },
          { t: 'code', lang: 'apex', x: '// Auto-response rule evaluation\n// Check which rules fire based on case criteria\nSELECT Id, Name, Priority, Active,\n       SenderEmail, TemplateId,\n       ConditionsVerb, SortOrder\nFROM CaseAssignmentRule\nWHERE Active = true\nORDER BY SortOrder ASC' },
          { t: 'callout', kind: 'warn', x: 'On-Demand Email-to-Case has a 25 MB limit per email (including attachments). The installed Email Agent has a 10 MB limit per email. Plan your intake accordingly.' },
          { t: 'selfcheck', q: 'What is the key architectural difference between Email-to-Case and On-Demand Email-to-Case?', a: 'Email-to-Case requires an installed Email Agent on a Windows server within your network to poll the mailbox. On-Demand Email-to-Case processes emails entirely in the Salesforce cloud without requiring the installed agent, though the agent is still needed for reply-from-Salesforce functionality.' }
        ]
      }
    ],
    quiz: {
      title: 'Case Lifecycle Quiz',
      mins: 10,
      questions: [
        { q: 'What do Record Types control on the Case object?', opts: ['Only page layouts', 'Picklist values, page layouts, and business processes', 'Only field-level security', 'Only report access'], a: 1, why: 'Record Types determine available picklist values, which page layout is shown, and which business process (support process) governs the status values.' },
        { q: 'Which intake channel requires an installed agent on a Windows server?', opts: ['Web-to-Case', 'On-Demand Email-to-Case', 'Email-to-Case', 'Chat'], a: 2, why: 'Email-to-Case requires the Email Agent installed on a Windows server to poll the support mailbox. On-Demand Email-to-Case eliminates this requirement.' },
        { q: 'What is the purpose of Auto-Response Rules in the context of Web-to-Case?', opts: ['To assign the case to an agent', 'To send a confirmation email to the customer who submitted the form', 'To escalate the case', 'To close the case automatically'], a: 1, why: 'Auto-Response Rules send an automated confirmation email to the customer acknowledging their case submission. They fire based on case criteria before assignment rules run.' }
      ]
    }
  },
  {
    id: 'data-model',
    n: 3,
    title: 'Data Model & Relationships for Service',
    icon: '03',
    color: '#0EA5E9',
    tagline: 'Design the right data model for service processes.',
    guide: '03-Data-Model-for-Service.md',
    art: [
      { label: 'Data Model Diagram', href: 'force-app/main/default/objects/SLA_Compliance__c/SLA_Compliance__c.object-meta.xml' },
      { label: 'Relationship Patterns', href: 'force-app/main/default/objects/Service_Routing_Log__c/Service_Routing_Log__c.object-meta.xml' }
    ],
    objectives: [
      'Distinguish between Lookup and Master-Detail relationships',
      'Design custom objects to extend the service data model',
      'Understand Service Contracts and their relationship to Cases',
      'Build a schema that supports SLA tracking',
      'Apply junction objects for many-to-many relationships',
      'Evaluate data modeling trade-offs for performance and flexibility'
    ],
    lessons: [
      {
        title: 'Custom Objects & Lookup vs Master-Detail',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Lookup vs Master-Detail' },
          { t: 'table', head: ['Feature', 'Lookup Relationship', 'Master-Detail'], rows: [
            ['Ownership', 'Independent records', 'Child owned by parent'],
            ['Deletion', 'Parent can be deleted', 'Parent deletion cascades to children'],
            ['Security', 'Separate sharing rules', 'Child inherits parent sharing'],
            ['Roll-up Summary', 'Not available', 'Available'],
            ['Required Field', 'Optional', 'Always required'],
            ['Reparenting', 'Allowed (unless restricted)', 'Not allowed by default'],
            ['Page Layout', 'Independent', 'Parent controls child layout']
          ]},
          { t: 'p', x: 'For Service Cloud, common Lookup relationships include Case-to-Account, Case-to-Contact, and Entitlement-to-Account. Master-Detail is useful when child records (like Case Comments) should always be scoped to their parent Case.' },
          { t: 'h', x: 'Custom Objects for Service Extensions' },
          { t: 'list', items: [
            'Case_Extension__c \u2014 additional fields beyond standard Case object',
            'Support_Request__c \u2014 specialized intake with custom fields',
            'Customer_Feedback__c \u2014 post-resolution survey tracking',
            'Escalation_History__c \u2014 audit trail of escalations',
            'Third_Party_Ticket__c \u2014 external system ticket tracking'
          ]},
          { t: 'code', lang: 'apex', x: '// Query custom extension objects related to cases\nSELECT Id, Case__r.CaseNumber, Type__c,\n       Severity__c, Resolved_Date__c,\n       Resolution_Notes__c\nFROM Case_Extension__c\nWHERE Case__c IN (\n    SELECT Id FROM Case WHERE Status != \'Closed\'\n)\nORDER BY Severity__c DESC' },
          { t: 'callout', kind: 'tip', x: 'Avoid Master-Detail on Case if you need to share Cases independently from Account. Use Lookup unless you specifically need roll-up summaries or cascading delete.' },
          { t: 'selfcheck', q: 'When would you choose a Lookup relationship over Master-Detail for a Case-related object?', a: 'When you need independent sharing rules (Cases shared differently than Accounts), when you want to allow parent deletion without cascading, or when you need to reparent records. Lookup relationships provide more flexibility at the cost of roll-up summary fields.' }
        ]
      },
      {
        title: 'Service Contracts & Entitlement Relationships',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Service Contracts Object' },
          { t: 'p', x: 'Service Contracts represent formal agreements between your company and a customer. They define the terms of service, including coverage period, SLA commitments, and the specific entitlements the customer is entitled to.' },
          { t: 'table', head: ['Object', 'Purpose', 'Key Fields'], rows: [
            ['ServiceContract', 'Customer agreement', 'Name, AccountId, StartDate, EndDate, Status, ContractTerm'],
            ['Entitlement', 'Specific SLA', 'Name, AccountId, ServiceContractId, StartDate, EndDate, Type'],
            ['ContractLineItem', 'Covered product/service', 'ServiceContractId, PricebookEntryId, Quantity']
          ]},
          { t: 'h', x: 'Entitlement Relationships' },
          { t: 'p', x: 'Entitlements link a customer to specific SLA terms. Each Entitlement is associated with an Entitlement Process that defines milestones and time targets. Entitlements can be linked to a Service Contract or directly to an Account.' },
          { t: 'list', items: [
            'An Account can have multiple Entitlements with different types',
            'A Case references an Entitlement to determine its SLA',
            'Entitlement Processes define milestones and time calculations',
            'Milestones can be based on calendar or business hours',
            'Entitlements can have nested Milestone actions (Entry, Success, Violation)'
          ]},
          { t: 'code', lang: 'apex', x: '// Query entitlements linked to service contracts\nSELECT Id, Name, Status, Type,\n       StartDate, EndDate,\n       ServiceContract.Name,\n       ServiceContract.ContractTerm,\n       Account.Name\nFROM Entitlement\nWHERE AccountId = \'001XX000003ABC\'\nAND Status = \'Active\'\nAND EndDate >= TODAY' },
          { t: 'callout', kind: 'tip', x: 'Always link Entitlements to Cases before agents start working. Without an Entitlement, the case has no SLA tracking. Use default entitlements on the Account for common scenarios.' },
          { t: 'selfcheck', q: 'What is the relationship between a Service Contract and an Entitlement?', a: 'A Service Contract defines the overall customer agreement and can contain multiple Entitlements. Each Entitlement represents a specific SLA commitment (e.g., "4-hour response time") within that contract. Cases are linked to Entitlements, not directly to Service Contracts.' }
        ]
      },
      {
        title: 'Schema Design for SLA Tracking',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Designing for SLA Compliance' },
          { t: 'p', x: 'Effective SLA tracking requires careful schema design. The data model must support time calculations, escalation triggers, and compliance reporting. Key design decisions include how to store business hours, how to define SLA tiers, and how to track milestone violations.' },
          { t: 'table', head: ['Design Element', 'Recommended Approach', 'Why'], rows: [
            ['Business Hours', 'BusinessHours object', 'Timezone-aware, holiday support'],
            ['SLA Tiers', 'Entitlement Type field', 'Different processes per tier'],
            ['Violation Tracking', 'Milestone field updates', 'Automatic timestamp on violation'],
            ['Escalation Audit', 'Custom Escalation_History__c', 'Full audit trail'],
            ['SLA Reporting', 'Formula fields + reports', 'Real-time compliance %']
          ]},
          { t: 'code', lang: 'apex', x: '// Schema design pattern: SLA Tracking\n// 1. Link Case to Entitlement (Lookup)\n// 2. Link Entitlement to Entitlement Process\n// 3. Milestones auto-populate on Case\n\n// Query cases approaching SLA breach\nSELECT Id, CaseNumber, Priority,\n       Entitlement.Name,\n       MilestoneStatus,\n       MilestoneDate,\n       MilestoneViolated__c\nFROM Case\nWHERE MilestoneViolated__c = false\nAND MilestoneDate <= NEXT_N_DAYS:2\nAND Status NOT IN (\'Closed\', \'Escalated\')\nORDER BY MilestoneDate ASC' },
          { t: 'callout', kind: 'warn', x: 'Formula fields with date/time calculations can be complex. Test thoroughly with different timezone scenarios. Consider using Flow or Apex for more complex SLA logic.' },
          { t: 'selfcheck', q: 'Why should you use the BusinessHours object instead of hardcoding hours?', a: 'The BusinessHours object is timezone-aware and supports company holidays and custom schedules. This ensures SLA calculations are accurate regardless of the agent\'s or customer\'s timezone, and accounts for holidays and non-working days automatically.' }
        ]
      }
    ],
    quiz: {
      title: 'Data Model Quiz',
      mins: 10,
      questions: [
        { q: 'Which relationship type allows roll-up summary fields?', opts: ['Lookup', 'Master-Detail', 'External', 'Hierarchical'], a: 1, why: 'Roll-up summary fields are only available on the child side of a Master-Detail relationship. They aggregate child records and display the result on the parent.' },
        { q: 'What object links a Case to its SLA agreement?', opts: ['Service Contract', 'Entitlement', 'Account', 'Contract Line Item'], a: 1, why: 'Cases are linked to Entitlements (not directly to Service Contracts). The Entitlement references the specific SLA terms and the Entitlement Process that defines milestones.' },
        { q: 'Why use the BusinessHours object for SLA tracking?', opts: ['It is required by the platform', 'It supports timezone-aware calculations and holidays', 'It is faster than custom code', 'It is the only way to track time'], a: 1, why: 'BusinessHours provides timezone-aware calculations, holiday schedules, and custom business hours definitions, ensuring accurate SLA tracking across different regions.' }
      ]
    }
  },
  {
    id: 'entitlements',
    n: 4,
    title: 'Entitlements, Milestones & SLA',
    icon: '04',
    color: '#10B981',
    tagline: 'Configure SLA enforcement with entitlement processes and milestones.',
    guide: '04-Entitlements-Milestones-and-SLA.md',
    art: [
      { label: 'Entitlement Process Diagram', href: 'force-app/main/default/classes/EntitlementMilestoneService.cls' },
      { label: 'Milestone Actions Config', href: 'force-app/main/default/classes/SlaComplianceService.cls' }
    ],
    objectives: [
      'Configure Entitlement Processes with milestones',
      'Set up milestone entry, success, and violation actions',
      'Implement entitlement versioning for contract changes',
      'Build SLA compliance reports and dashboards',
      'Manage business hours and their impact on SLA calculations',
      'Troubleshoot common entitlement and milestone issues'
    ],
    lessons: [
      {
        title: 'Entitlement Processes & Entitlement Versioning',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Entitlement Process Structure' },
          { t: 'p', x: 'An Entitlement Process defines the SLA workflow for cases. It contains one or more milestones, each with specific time targets and actions. When a case is linked to an Entitlement, the process automatically tracks milestone progress.' },
          { t: 'num', items: [
            'Create an Entitlement Process in Setup > Entitlement Processes',
            'Define the process name, SObject (Case), and type',
            'Add milestones with time criteria (e.g., first response in 4 hours)',
            'Configure business hours for time calculations',
            'Set milestone actions (entry, success, violation)',
            'Activate the process'
          ]},
          { t: 'h', x: 'Entitlement Versioning' },
          { t: 'p', x: 'When you update an Entitlement Process (e.g., change milestone times), you create a new version. Existing cases continue to use the version they were created with. New cases use the latest active version. This ensures historical SLA accuracy.' },
          { t: 'table', head: ['Version', 'Status', 'Impact on Cases'], rows: [
            ['Version 1 (Active)', 'Active', 'Assigned to existing cases'],
            ['Version 2 (Draft)', 'Draft', 'Being configured'],
            ['Version 2 (Active)', 'Active', 'New cases use this version'],
            ['Version 1 (Retired)', 'Retired', 'No new assignments, existing cases keep it']
          ]},
          { t: 'code', lang: 'apex', x: '// Query entitlement processes and their milestones\nSELECT Id, Name, SObjectType, Status,\n       Description, VersionNumber\nFROM EntitlementProcess\nWHERE SObjectType = \'Case\'\nAND Status = \'Active\'\n\n// Query milestones for a specific process\nSELECT Id, Name, EntitlementProcessId,\n       DurationMinutes, DurationDays,\n       StartTimeField, RecurrenceType\nFROM Milestone\nWHERE EntitlementProcessId = \'000000000000001\'\nORDER BY SequenceNumber ASC' },
          { t: 'callout', kind: 'tip', x: 'Always version your Entitlement Processes instead of editing the active version directly. This protects existing cases from unexpected SLA changes.' },
          { t: 'selfcheck', q: 'What happens to existing cases when you create a new version of an Entitlement Process?', a: 'Existing cases continue to use the version they were created with. Only new cases created after the new version is activated will use the updated version. This ensures historical SLA accuracy and prevents retroactive changes.' }
        ]
      },
      {
        title: 'Milestone Actions: Entry, Success & Violation',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Milestone Action Types' },
          { t: 'table', head: ['Action Type', 'When It Fires', 'Common Use'], rows: [
            ['Entry Criteria', 'When milestone becomes active', 'Set initial status, notify agent'],
            ['Success Criteria', 'When milestone is completed in time', 'Send thank-you, update field'],
            ['Violation Criteria', 'When milestone time expires', 'Escalate, send alert, update status']
          ]},
          { t: 'h', x: 'Configuring Milestone Actions' },
          { t: 'p', x: 'Each milestone can have multiple actions. Actions can be field updates, tasks, email alerts, or outbound messages. The key is to define clear entry criteria (when the milestone starts counting), success criteria (what "done" looks like), and violation criteria (what happens when time runs out).' },
          { t: 'list', items: [
            'Entry criteria: "Case.Status = Working" or "Case.Priority = High"',
            'Success criteria: "Case.Status = Closed" or "Case.Comment Added"',
            'Violation actions: "Escalate to Tier 2 Queue", "Send Email Alert"',
            'Time criteria: "4 business hours" or "2 calendar days"',
            'Recurrence: Some milestones repeat (e.g., daily check-in)'
          ]},
          { t: 'code', lang: 'apex', x: '// Example: Trigger to track milestone violations\n// Fires when a milestone is violated\ntrigger MilestoneViolationTrigger on Case (\n    after update\n) {\n    List<Case> violatedCases = new List<Case>();\n    for (Case c : Trigger.new) {\n        Case oldCase = Trigger.oldMap.get(c.Id);\n        if (c.MilestoneViolated__c &&\n            !oldCase.MilestoneViolated__c) {\n            violatedCases.add(c);\n        }\n    }\n    if (!violatedCases.isEmpty()) {\n        MilestoneService.handleViolations(violatedCases);\n    }\n}' },
          { t: 'callout', kind: 'warn', x: 'Violation actions run asynchronously. If you need immediate action upon violation, consider using a Flow with scheduled paths instead of relying solely on milestone violation actions.' },
          { t: 'selfcheck', q: 'What is the difference between Entry Criteria and Violation Criteria on a milestone?', a: 'Entry Criteria determine when the milestone starts counting time (e.g., when the case status changes to "Working"). Violation Criteria define what happens when the milestone time expires without the success criteria being met (e.g., escalate to a manager).' }
        ]
      },
      {
        title: 'SLA Compliance Reporting',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Key SLA Metrics' },
          { t: 'table', head: ['Metric', 'Formula', 'Target'], rows: [
            ['First Response Time', 'Time from creation to first agent response', '< 4 hours'],
            ['Resolution Time', 'Time from creation to closure', '< 24 hours'],
            ['SLA Compliance %', '(Cases meeting SLA / Total cases) * 100', '> 90%'],
            ['Milestone Violation Rate', '(Violated milestones / Total milestones) * 100', '< 5%'],
            ['Escalation Rate', '(Escalated cases / Total cases) * 100', '< 10%']
          ]},
          { t: 'h', x: 'Building SLA Reports' },
          { t: 'p', x: 'Salesforce provides standard report types for entitlements and milestones. You can create custom reports to track compliance rates, identify trends, and drill down by agent, team, priority, or record type.' },
          { t: 'num', items: [
            'Create a report using the "Cases with Entitlements" report type',
            'Add columns for Milestone Status, Milestone Date, and Violation',
            'Group by Entitlement Name or Milestone Name',
            'Add filters for date range and case status',
            'Create a formula field for SLA Compliance %',
            'Schedule the report for weekly delivery to management'
          ]},
          { t: 'code', lang: 'apex', x: '// SLA compliance query\nSELECT Entitlement.Name,\n       COUNT(Id) TotalCases,\n       COUNT(CASE WHEN MilestoneViolated__c = false THEN 1 END) MetSLA,\n       COUNT(CASE WHEN MilestoneViolated__c = true THEN 1 END) ViolatedSLA\nFROM Case\nWHERE EntitlementId != NULL\nAND ClosedDate = THIS_MONTH\nGROUP BY Entitlement.Name' },
          { t: 'selfcheck', q: 'What is the most important SLA metric for a support center focused on customer satisfaction?', a: 'First Response Time is typically the most impactful SLA metric for customer satisfaction, as customers judge service quality heavily by how quickly they receive an initial acknowledgment. Resolution Time is the second most important metric.' }
        ]
      }
    ],
    quiz: {
      title: 'Entitlements & SLA Quiz',
      mins: 10,
      questions: [
        { q: 'What happens when you activate a new version of an Entitlement Process?', opts: ['All cases switch to the new version', 'Only new cases use the new version', 'Existing cases are deleted', 'The process stops working'], a: 1, why: 'Only newly created cases use the new version. Existing cases continue on the version they were created with, ensuring SLA accuracy for historical data.' },
        { q: 'Which milestone action fires when the SLA time expires?', opts: ['Entry Action', 'Success Action', 'Violation Action', 'Exit Action'], a: 2, why: 'Violation Actions fire when the milestone time expires without the success criteria being met. This is typically used for escalation or alerting.' },
        { q: 'What report type should you use for SLA compliance analysis?', opts: ['Cases with Contacts', 'Cases with Entitlements', 'Accounts with Cases', 'Leads with Cases'], a: 1, why: '"Cases with Entitlements" provides the data needed for SLA analysis, including milestone status, violation dates, and entitlement details.' }
      ]
    }
  },
  {
    id: 'automation',
    n: 5,
    title: 'Service Process Automation',
    icon: '05',
    color: '#F59E0B',
    tagline: 'Automate service workflows with Flow, rules, and macros.',
    guide: '05-Service-Process-Automation.md',
    art: [
      { label: 'Automation Diagram', href: 'force-app/main/default/flows/Case_Init_Flow.flow-meta.xml' },
      { label: 'Flow Templates', href: 'force-app/main/default/flows/Case_Assignment_Flow.flow-meta.xml' }
    ],
    objectives: [
      'Build Flows for case management automation',
      'Configure assignment and escalation rules',
      'Implement email alerts and auto-response rules',
      'Use Quick Actions, Macros, and Quick Text',
      'Choose the right automation tool for each scenario',
      'Understand Flow vs. Apex triggers for service automation'
    ],
    lessons: [
      {
        title: 'Flow Builder for Service',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Flow Types for Service Automation' },
          { t: 'table', head: ['Flow Type', 'Trigger', 'Use Case'], rows: [
            ['Record-Triggered', 'Record create/update/delete', 'Auto-assign entitlement, update status'],
            ['Screen Flow', 'User-initiated', 'Guided case creation wizard'],
            ['Scheduled Flow', 'Time-based', 'Daily SLA compliance check'],
            ['Autolaunched Flow', 'Invoked by process', 'Reusable service logic'],
            ['Platform Event-Triggered', 'Platform event', 'Integration with external systems']
          ]},
          { t: 'h', x: 'Common Service Cloud Flows' },
          { t: 'list', items: [
            'Auto-populate case fields based on product or category',
            'Send SLA breach warnings before milestone violation',
            'Create follow-up tasks when case is closed',
            'Route cases to specialized queues based on keywords',
            'Sync case data with external CRM systems',
            'Generate customer satisfaction surveys post-resolution'
          ]},
          { t: 'code', lang: 'apex', x: '// Flow-invocable method for service automation\n@InvocableMethod(\n    label=\'Assign Entitlement\'\n    description=\'Auto-assign entitlement to case based on account\'\n)\npublic static void assignEntitlements(\n    List<Case> cases\n) {\n    Set<Id> accountIds = new Set<Id>();\n    for (Case c : cases) {\n        if (c.AccountId != null) {\n            accountIds.add(c.AccountId);\n        }\n    }\n    Map<Id, List<Entitlement>> accountEntitlements =\n        new Map<Id, List<Entitlement>>();\n    for (Entitlement e : [\n        SELECT Id, AccountId, Type, StartDate, EndDate\n        FROM Entitlement\n        WHERE AccountId IN :accountIds\n        AND Status = \'Active\'\n        AND StartDate <= TODAY\n        AND EndDate >= TODAY\n    ]) {\n        if (!accountEntitlements.containsKey(e.AccountId)) {\n            accountEntitlements.put(e.AccountId, new List<Entitlement>());\n        }\n        accountEntitlements.get(e.AccountId).add(e);\n    }\n    for (Case c : cases) {\n        if (accountEntitlements.containsKey(c.AccountId)) {\n            c.EntitlementId = accountEntitlements.get(\n                c.AccountId\n            )[0].Id;\n        }\n    }\n    update cases;\n}' },
          { t: 'callout', kind: 'tip', x: 'Use Record-Triggered Flows with Fast Field Updates for field changes (Before Save) to avoid extra SOQL queries. Use After Save Flows for operations that require related record access.' },
          { t: 'selfcheck', q: 'When should you use a Record-Triggered Flow instead of a Screen Flow?', a: 'Record-Triggered Flows execute automatically when a record is created, updated, or deleted \u2014 ideal for backend automation like auto-assigning entitlements. Screen Flows require user interaction and are better for guided wizards where user input is needed.' }
        ]
      },
      {
        title: 'Assignment Rules, Escalation Rules & Email Alerts',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Case Assignment Rules' },
          { t: 'p', x: 'Assignment rules automatically route incoming cases to the right queue or agent based on criteria. They evaluate rules in priority order and assign the case to the first matching rule. Each rule can have multiple criteria and can assign to users or queues.' },
          { t: 'num', items: [
            'Navigate to Setup > Case Assignment Rules',
            'Create a new rule with a name and sort order',
            'Add rule entries with criteria (e.g., Priority = High)',
            'Specify the assignment (Queue or User)',
            'Add email notification to the assignee (optional)',
            'Activate the rule'
          ]},
          { t: 'h', x: 'Escalation Rules' },
          { t: 'p', x: 'Escalation rules automatically reassign or notify when cases approach or breach SLA milestones. They can be defined at the entitlement process level or as standalone escalation rules. Escalations can change the case owner, send alerts, or update fields.' },
          { t: 'table', head: ['Rule Type', 'Trigger', 'Action'], rows: [
            ['Time-Based', 'Milestone approaching', 'Warn agent, notify manager'],
            ['Violation-Based', 'Milestone breached', 'Reassign to escalation queue'],
            ['Criteria-Based', 'Custom conditions', 'Update priority, send alert']
          ]},
          { t: 'code', lang: 'apex', x: '// Email alert configuration for escalation\n// Setup > Case Escalation Rules > Rule Entry\n// > Escalation Action\n\n// Apex trigger alternative for complex escalation\ntrigger CaseEscalationTrigger on Case (\n    after update\n) {\n    List<Messaging.SingleEmailMessage> emails =\n        new List<Messaging.SingleEmailMessage>();\n    for (Case c : Trigger.new) {\n        Case oldCase = Trigger.oldMap.get(c.Id);\n        if (c.IsEscalated && !oldCase.IsEscalated) {\n            Messaging.SingleEmailMessage email =\n                new Messaging.SingleEmailMessage();\n            email.setTargetObjectId(c.ContactId);\n            email.setSubject(\n                \'Case Escalated: \' + c.CaseNumber\n            );\n            email.setPlainTextBody(\n                \'Your case has been escalated. \' +\n                \'A specialist will review it shortly.\'\n            );\n            emails.add(email);\n        }\n    }\n    if (!emails.isEmpty()) {\n        Messaging.sendEmail(emails);\n    }\n}' },
          { t: 'callout', kind: 'warn', x: 'Assignment rules and escalation rules can conflict. Always test thoroughly. Consider using Flow Builder for complex routing logic that goes beyond what standard rules support.' },
          { t: 'selfcheck', q: 'How do Assignment Rules determine which rule to apply?', a: 'Assignment Rules evaluate entries in priority order (based on the sort order). The first rule entry whose criteria match the case is applied, and the case is assigned to the specified queue or user. No further rules are evaluated after the first match.' }
        ]
      },
      {
        title: 'Quick Actions, Macros & Quick Text',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Quick Actions for Efficiency' },
          { t: 'table', head: ['Action Type', 'Location', 'Use Case'], rows: [
            ['Object-Specific Action', 'Case page layout', 'Create follow-up, update status'],
            ['Global Action', 'Global menu', 'Create case from anywhere'],
            ['Action Layout', 'Action bar', 'Customize available actions'],
            ['Quick Action', 'Publisher', 'One-click case operations']
          ]},
          { t: 'h', x: 'Macros for Repetitive Tasks' },
          { t: 'p', x: 'Macros let agents perform multiple steps with a single click. They can update fields, send emails, assign cases, and log activities. Macros are especially useful for standard responses to common issues.' },
          { t: 'list', items: [
            'Create a macro with a name and description',
            'Add instruction steps (field updates, email sends)',
            'Use merge fields to personalize content',
            'Assign macros to folders for organization',
            'Run macros from the Case feed or macro utility',
            'Track macro usage for process improvement'
          ]},
          { t: 'h', x: 'Quick Text' },
          { t: 'p', x: 'Quick Text provides pre-written responses that agents can insert into emails, chats, and case feeds. It supports merge fields for personalization and can be organized into folders by category.' },
          { t: 'code', lang: 'apex', x: '// Query Quick Text for service agents\nSELECT Id, Name, Message, FolderName,\n       IsPersonal, Channel\nFROM QuickText\nWHERE FolderName = \'Standard Responses\'\nAND Channel INCLUDES (\'Email\', \'Chat\')\nORDER BY Name ASC' },
          { t: 'callout', kind: 'tip', x: 'Combine Macros with Quick Text for maximum efficiency. A macro can send an email that pulls in a Quick Text response, giving agents a one-click solution for common scenarios.' },
          { t: 'selfcheck', q: 'What is the key difference between a Macro and Quick Text?', a: 'Macros execute multiple steps in sequence (field updates, emails, tasks) with a single click. Quick Text provides pre-written text snippets that agents insert into messages. Macros are action-oriented; Quick Text is content-oriented.' }
        ]
      }
    ],
    quiz: {
      title: 'Service Automation Quiz',
      mins: 10,
      questions: [
        { q: 'Which Flow type is best for auto-assigning entitlements when a case is created?', opts: ['Screen Flow', 'Record-Triggered Flow', 'Scheduled Flow', 'Platform Event Flow'], a: 1, why: 'Record-Triggered Flows execute automatically when a record is created or updated, making them ideal for auto-populating fields like EntitlementId when a new Case is created.' },
        { q: 'How do Assignment Rules determine which rule to apply?', opts: ['Random selection', 'Priority order, first match wins', 'All matching rules fire', 'Admin selects manually'], a: 1, why: 'Assignment Rules evaluate entries in priority (sort) order. The first entry whose criteria match the case is applied, and evaluation stops.' },
        { q: 'What can a Macro do that Quick Text cannot?', opts: ['Insert pre-written text', 'Execute multiple steps including field updates and emails', 'Support merge fields', 'Be organized in folders'], a: 1, why: 'Macros can perform multiple actions in sequence (field updates, email sends, task creation). Quick Text only inserts pre-written text content.' }
      ]
    }
  },
  {
    id: 'knowledge',
    n: 6,
    title: 'Knowledge Management',
    icon: '06',
    color: '#EF4444',
    tagline: 'Build and manage a knowledge base for agents and customers.',
    guide: '06-Knowledge-Management.md',
    art: [
      { label: 'Knowledge Architecture', href: 'force-app/main/default/classes/KnowledgeService.cls' },
      { label: 'Data Category Taxonomy', href: 'force-app/main/default/triggers/KnowledgeArticleVersionTrigger.trigger' }
    ],
    objectives: [
      'Configure Knowledge article types and fields',
      'Manage publishing states and article lifecycle',
      'Design a data category taxonomy',
      'Integrate Knowledge into the Service Console',
      'Explain KCS methodology and its benefits',
      'Compare Knowledge, Content, and legacy KB solutions'
    ],
    lessons: [
      {
        title: 'Article Types, Publishing States & Data Categories',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Knowledge Article Types' },
          { t: 'p', x: 'Salesforce Knowledge uses a single Knowledge__kav object with configurable field sets (article types). Each article type defines which fields are available, allowing different content structures for different knowledge domains.' },
          { t: 'table', head: ['Article Type', 'Fields', 'Use Case'], rows: [
            ['FAQ', 'Question, Answer, Category', 'Common customer questions'],
            ['Troubleshooting', 'Symptom, Cause, Resolution', 'Technical issue resolution'],
            ['How-To', 'Steps, Prerequisites, Screenshots', 'Step-by-step guides'],
            ['Policy', 'Policy Text, Effective Date, Version', 'Company policies and procedures']
          ]},
          { t: 'h', x: 'Publishing States' },
          { t: 'p', x: 'Knowledge articles go through a publishing workflow. The standard states are Draft, Published, and Archived. Draft articles are only visible to knowledge managers and authors. Published articles are visible to agents and (optionally) customers. Archived articles are read-only and hidden from search results.' },
          { t: 'list', items: [
            'Draft \u2014 article being authored, not visible to agents',
            'Published \u2014 live and searchable by agents and customers',
            'Archived \u2014 retired but retained for historical reference',
            'Published with Draft Revision \u2014 live version + pending update',
            'Translation states mirror the primary language workflow'
          ]},
          { t: 'h', x: 'Data Categories' },
          { t: 'p', x: 'Data categories organize articles into a hierarchical taxonomy. Agents and customers can browse or filter articles by category. A well-designed taxonomy improves article discoverability and reduces search time.' },
          { t: 'code', lang: 'soql', x: 'SELECT Id, Title, Summary, ArticleNumber,\n       PublishStatus, Language,\n       KnowledgeArticleId,\n       FirstPublishedDate, LastPublishedDate\nFROM Knowledge__kav\nWHERE PublishStatus = \'Online\'\nAND Language = \'en_US\'\nORDER BY LastPublishedDate DESC\nLIMIT 50' },
          { t: 'callout', kind: 'tip', x: 'Keep your data category hierarchy to 3 levels deep maximum. Deeper hierarchies become difficult for agents to navigate and often lead to miscategorization.' },
          { t: 'selfcheck', q: 'What is the difference between Draft and Published article states?', a: 'Draft articles are being authored and are only visible to knowledge managers and authors. Published articles are live, searchable, and visible to agents (and optionally customers through portals). Articles must be explicitly published to become visible to end users.' }
        ]
      },
      {
        title: 'Knowledge in Service Console',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Knowledge Panel Configuration' },
          { t: 'p', x: 'The Knowledge tab in the Service Console provides agents with a contextual search experience. Articles are ranked by relevance and can be linked to cases. The Knowledge One widget displays suggested articles based on case details.' },
          { t: 'table', head: ['Feature', 'Description', 'Configuration'], rows: [
            ['Knowledge Tab', 'Searchable knowledge base', 'Add to console navigation'],
            ['Knowledge One Widget', 'AI-suggested articles', 'Enable in console component'],
            ['Case-Linked Articles', 'Articles associated with cases', 'Link from case feed'],
            ['Article Feedback', 'Agent ratings on articles', 'Enable feedback component'],
            ['External Apps', 'Embed KB in third-party tools', 'Use Knowledge API']
          ]},
          { t: 'h', x: 'Knowledge Search Optimization' },
          { t: 'num', items: [
            'Configure search layouts to show relevant fields',
            'Set up article validation rules for content quality',
            'Enable article suggestions (Einstein Knowledge)',
            'Configure data category groups for filtering',
            'Set up article ranking rules based on usage',
            'Enable article versioning for change tracking'
          ]},
          { t: 'code', lang: 'apex', x: '// Search Knowledge articles via API\n// Use SOSL for full-text search\nList<List<SObject>> results = [FIND \'login error\'\n    IN ALL FIELDS\n    RETURNING Knowledge__kav (\n        Id, Title, Summary, ArticleNumber,\n        PublishStatus\n        WHERE PublishStatus = \'Online\'\n        AND Language = \'en_US\'\n    )\n    LIMIT 10\n];\nList<Knowledge__kav> articles =\n    (List<Knowledge__kav>)results[0];' },
          { t: 'callout', kind: 'tip', x: 'Enable Einstein Knowledge Article Suggestions to automatically recommend relevant articles to agents based on the case subject and description. This can reduce average handle time by 15-25%.' },
          { t: 'selfcheck', q: 'What is the Knowledge One widget and why is it valuable?', a: 'The Knowledge One widget uses AI to automatically suggest relevant knowledge articles based on the current case details. It reduces agent search time, improves first-contact resolution, and ensures consistent answers across the support team.' }
        ]
      },
      {
        title: 'KB vs Cases vs Content & KCS Methodology',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Knowledge vs Content vs Legacy KB' },
          { t: 'table', head: ['Feature', 'Knowledge (Current)', 'Content (Legacy)', 'Legacy KB'], rows: [
            ['Object', 'Knowledge__kav', 'ContentVersion', 'KbArticle'],
            ['Publishing', 'Draft \u2192 Published', 'Major/Minor versions', 'Draft \u2192 Published'],
            ['Categories', 'Data Categories', 'Content Libraries', 'Article Groups'],
            ['Search', 'SOSL + Einstein', 'Content search', 'Basic search'],
            ['Console Integration', 'Native', 'Manual', 'Limited'],
            ['Portal Display', 'Experience Cloud native', 'Custom build', 'Not supported']
          ]},
          { t: 'h', x: 'KCS Methodology' },
          { t: 'p', x: 'Knowledge-Centered Service (KCS) is a methodology for capturing, maintaining, and reusing knowledge as a natural byproduct of the support process. Instead of resolving issues and moving on, agents create or update knowledge articles as part of their workflow.' },
          { t: 'list', items: [
            'Capture: Agents write articles during case resolution',
            'Structure: Articles follow a standard template (Issue, Cause, Resolution)',
            'Reuse: Agents search existing articles before creating new ones',
            'Improve: Articles are continuously updated based on usage',
            'Reward: Article quality and usage are measured and recognized',
            'Maintain: Regular article reviews keep content accurate'
          ]},
          { t: 'code', lang: 'apex', x: '// KCS: Link article to case and track usage\n// After case resolution, agent links the article\ntrigger KCSArticleLink on CaseArticle (\n    after insert\n) {\n    Set<Id> articleIds = new Set<Id>();\n    for (CaseArticle ca : Trigger.new) {\n        articleIds.add(ca.KnowledgeArticleId);\n    }\n    // Update article view count\n    List<Knowledge__kav> articles = [\n        SELECT Id, ViewCount__c\n        FROM Knowledge__kav\n        WHERE KnowledgeArticleId IN :articleIds\n    ];\n    for (Knowledge__kav art : articles) {\n        art.ViewCount__c = (art.ViewCount__c != null\n            ? art.ViewCount__c + 1 : 1);\n    }\n    update articles;\n}' },
          { t: 'callout', kind: 'warn', x: 'KCS requires cultural change, not just technology. Invest in training, leadership buy-in, and incentive programs. Without organizational support, knowledge bases quickly become stale and inaccurate.' },
          { t: 'selfcheck', q: 'What is the core principle of KCS methodology?', a: 'KCS makes knowledge creation a natural byproduct of the support process. Instead of treating knowledge as a separate activity, agents capture and maintain knowledge as they resolve cases, ensuring the knowledge base stays current and useful.' }
        ]
      }
    ],
    quiz: {
      title: 'Knowledge Management Quiz',
      mins: 10,
      questions: [
        { q: 'Which publishing state makes an article visible to agents and customers?', opts: ['Draft', 'Published', 'Archived', 'Pending Review'], a: 1, why: 'Only Published articles are visible to agents and customers. Draft articles are only visible to knowledge managers and authors.' },
        { q: 'What is the recommended maximum depth for a data category hierarchy?', opts: ['1 level', '2 levels', '3 levels', '5 levels'], a: 2, why: 'A 3-level hierarchy is recommended because deeper hierarchies become difficult to navigate and often lead to miscategorization of articles.' },
        { q: 'What is the core principle of KCS methodology?', opts: ['Separate knowledge team writes all articles', 'Knowledge creation is a byproduct of case resolution', 'Only managers can publish articles', 'Knowledge is updated quarterly'], a: 1, why: 'KCS makes knowledge creation part of the agent\'s normal workflow. Agents write or update articles as they resolve cases, keeping the knowledge base current.' }
      ]
    }
  },
  {
    id: 'console',
    n: 7,
    title: 'Lightning Service Console',
    icon: '07',
    color: '#8B5CF6',
    tagline: 'Configure the console for agent productivity.',
    guide: '07-Lightning-Service-Console.md',
    art: [
      { label: 'Console Layout', href: 'force-app/main/default/tabs/SLA_Compliance__c.tab-meta.xml' },
      { label: 'Utility Bar Config', href: 'force-app/main/default/permissionsets/Service_Cloud_Consultant.permissionset-meta.xml' }
    ],
    objectives: [
      'Configure console apps and workspace tabs',
      'Set up subtabs for related records',
      'Customize the utility bar for agent tools',
      'Design mini page layouts for efficiency',
      'Implement split view for side-by-side comparison',
      'Master keyboard shortcuts for faster navigation'
    ],
    lessons: [
      {
        title: 'Console Apps, Workspace Tabs & Subtabs',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Console App Architecture' },
          { t: 'p', x: 'The Lightning Service Console is a specialized app designed for high-volume service agents. It uses a tab-based workspace where agents can manage multiple cases simultaneously. The console layout is optimized for fast case processing with minimal clicks.' },
          { t: 'table', head: ['Component', 'Description', 'Configuration'], rows: [
            ['Workspace Tabs', 'Primary tabs for main records', 'App Manager > Navigation Items'],
            ['Subtabs', 'Child records under parent tab', 'Related lists and lookups'],
            ['Navigation Items', 'Objects shown in navigation', 'App Manager > Navigation Items'],
            ['Page Layouts', 'Record detail layouts', 'Object Manager > Page Layouts'],
            ['Console Components', 'Embedded panels', 'Lightning App Builder']
          ]},
          { t: 'h', x: 'Workspace Tab Configuration' },
          { t: 'num', items: [
            'Create a new Lightning App with Console navigation type',
            'Add navigation items for Case, Contact, Account, Knowledge',
            'Configure tab behavior: open as workspace tab or subtab',
            'Set default tabs for different case record types',
            'Enable or disable tab limits per user profile',
            'Configure tab highlighting for priority cases'
          ]},
          { t: 'h', x: 'Subtab Behavior' },
          { t: 'p', x: 'Subtabs open beneath a workspace tab when an agent clicks a related record. For example, clicking a Contact from a Case opens the Contact as a subtab. This keeps related records organized and accessible without losing context.' },
          { t: 'code', lang: 'apex', x: '// Navigate to case in console from custom button\n// Use URLFOR to open in console context\n// Formula field or button URL:\n// /lightning/r/Case/{!Case.Id}/view\n\n// Or use NavigationMixin for LWC:\n// this[NavigationMixin.Navigate]({\n//     type: \'standard__recordPage\',\n//     attributes: {\n//         recordId: caseId,\n//         objectApiName: \'Case\',\n//         actionName: \'view\'\n//     }\n// });' },
          { t: 'callout', kind: 'tip', x: 'Limit workspace tabs to 5-7 per user profile to prevent browser performance issues. Use tab limits to enforce this and guide agents to close completed tabs.' },
          { t: 'selfcheck', q: 'What is the difference between a workspace tab and a subtab?', a: 'A workspace tab is a primary tab that opens a main record (like a Case). A subtab opens beneath a workspace tab and displays a related record (like a Contact linked to the Case). Subtabs maintain context by staying grouped under their parent workspace tab.' }
        ]
      },
      {
        title: 'Utility Bar, Split View & Mini Page Layouts',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Utility Bar Components' },
          { t: 'table', head: ['Utility Item', 'Purpose', 'Use Case'], rows: [
            ['History', 'Recent records', 'Quick access to previously viewed cases'],
            ['Notes', 'Case notes', 'Quick note-taking during calls'],
            ['Omni-Channel', 'Presence status', 'Go on/offline for chat routing'],
            ['Macros', 'Automated steps', 'Execute common case workflows'],
            ['Gmail/Outlook', 'Email integration', 'Log emails to cases'],
            ['Phone', 'Softphone', 'Make/receive calls in console']
          ]},
          { t: 'h', x: 'Split View' },
          { t: 'p', x: 'Split View lets agents view a list of cases alongside the case detail. This is useful for triaging incoming cases or comparing multiple records. The list shows key fields and allows quick navigation between cases.' },
          { t: 'list', items: [
            'Enable Split View in the console component configuration',
            'Configure list view columns for the split panel',
            'Set the default list view (e.g., "My Open Cases")',
            'Use split view for queue monitoring and triage',
            'Agents can resize the split panel',
            'Click a list item to load the record in the detail pane'
          ]},
          { t: 'h', x: 'Mini Page Layouts' },
          { t: 'p', x: 'Mini page layouts define which fields appear in hover details and split view summaries. They provide at-a-glance information without opening the full record. Configure them to show the most critical fields for quick assessment.' },
          { t: 'code', lang: 'apex', x: '// Mini Page Layout Configuration\n// Setup > Object Manager > Case > Mini Page Layout\n// Include these high-value fields:\n// - Case Number\n// - Status\n// - Priority\n// - Subject\n// - Contact Name\n// - Entitlement Name\n// - Last Activity Date\n\n// These fields appear in:\n// - Hover details on lookup fields\n// - Split view list panels\n// - Recent items previews' },
          { t: 'callout', kind: 'tip', x: 'Configure the utility bar to show only the tools each profile actually needs. Too many utility items slow down the console load time and clutter the agent experience.' },
          { t: 'selfcheck', q: 'When would you use Split View instead of opening records in separate tabs?', a: 'Split View is ideal for triaging incoming cases, comparing similar records, or monitoring a queue. It lets agents see the list and detail simultaneously without opening multiple tabs. For deep work on a single case, a full workspace tab is more appropriate.' }
        ]
      },
      {
        title: 'Console Customization & Keyboard Shortcuts',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Console Customization' },
          { t: 'p', x: 'The Service Console can be customized per profile to show different tabs, components, and layouts. This ensures each agent sees only the tools and records relevant to their role.' },
          { t: 'table', head: ['Customization Area', 'What to Configure', 'Where'], rows: [
            ['Navigation', 'Tabs and objects', 'Lightning App Builder'],
            ['Page Layouts', 'Record detail fields', 'Object Manager'],
            ['Component Visibility', 'Show/hide panels', 'Lightning App Builder'],
            ['Profile Settings', 'Tab limits, default tabs', 'App Manager'],
            ['Record Types', 'Different layouts by type', 'Object Manager > Record Types']
          ]},
          { t: 'h', x: 'Keyboard Shortcuts' },
          { t: 'p', x: 'Keyboard shortcuts significantly speed up console navigation. Agents can perform common actions without using the mouse, reducing click time and improving throughput.' },
          { t: 'table', head: ['Shortcut', 'Action', 'Description'], rows: [
            ['Alt + 1-9', 'Switch tabs', 'Navigate to workspace tab by position'],
            ['Alt + Q', 'New case', 'Open new case creation form'],
            ['Alt + S', 'Save', 'Save current record'],
            ['Alt + E', 'Edit', 'Open record in edit mode'],
            ['Alt + M', 'Macro', 'Open macro panel'],
            ['Alt + K', 'Search', 'Focus the search bar']
          ]},
          { t: 'code', lang: 'javascript', x: '// Custom keyboard shortcuts via Lightning Component\n// Register shortcuts in component init:\nimport { registerShortcut } from \'lightning/consoleKeyboardShortcuts\';\n\n// In connectedCallback:\nregisterShortcut(\'alt+shift+n\', () => {\n    // Open new case with pre-filled fields\n    this[NavigationMixin.Navigate]({\n        type: \'standard__objectPage\',\n        attributes: {\n            objectApiName: \'Case\',\n            actionName: \'new\'\n        },\n        state: {\n            defaultFieldValues: {\n                Status: \'New\',\n                Origin: \'Phone\'\n            }\n        }\n    });\n});' },
          { t: 'callout', kind: 'tip', x: 'Train agents on at least 5 keyboard shortcuts. Studies show that keyboard-efficient agents process 20-30% more cases per day than mouse-dependent agents.' },
          { t: 'selfcheck', q: 'Why should you customize the console per profile instead of giving everyone the same layout?', a: 'Different roles need different tools. A Tier 1 agent needs chat and quick actions, while a Tier 2 agent needs escalation tools and knowledge articles. Profile-based customization reduces clutter and ensures each agent has the most relevant tools visible.' }
        ]
      }
    ],
    quiz: {
      title: 'Service Console Quiz',
      mins: 10,
      questions: [
        { q: 'What is a subtab in the Service Console?', opts: ['A minimized case', 'A child record opened under a parent workspace tab', 'A search result', 'A utility bar item'], a: 1, why: 'Subtabs are child records that open beneath a parent workspace tab. For example, clicking a Contact from a Case opens the Contact as a subtab under the Case.' },
        { q: 'How many workspace tabs should you recommend per user profile?', opts: ['As many as possible', '1-2', '5-7', '10-15'], a: 2, why: 'Limiting to 5-7 workspace tabs prevents browser performance issues and encourages agents to close completed work. More tabs consume more memory and slow down the console.' },
        { q: 'What does the Mini Page Layout control?', opts: ['Full record page layout', 'Hover details and split view summaries', 'Print layout', 'Mobile layout'], a: 1, why: 'Mini page layouts define which fields appear in hover details, lookup popups, and split view list panels, providing at-a-glance information without opening the full record.' }
      ]
    }
  },
  {
    id: 'omnichannel',
    n: 8,
    title: 'Omni-Channel & Omni Supervisor',
    icon: '08',
    color: '#06B6D4',
    tagline: 'Route work intelligently and monitor in real time.',
    guide: '08-Omni-Channel-and-Omni-Supervisor.md',
    art: [
      { label: 'Routing Architecture', href: 'force-app/main/default/classes/OmniChannelService.cls' },
      { label: 'Queue Configuration', href: 'force-app/main/default/classes/CaseRoutingService.cls' }
    ],
    objectives: [
      'Configure Omni-Channel routing settings',
      'Set up presence statuses and service channels',
      'Implement queue-based and skills-based routing',
      'Use Omni Supervisor for real-time monitoring',
      'Manage agent capacity and workload balancing',
      'Troubleshoot common routing issues'
    ],
    lessons: [
      {
        title: 'Routing Config, Presence & Service Channels',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Omni-Channel Components' },
          { t: 'table', head: ['Component', 'Purpose', 'Configuration'], rows: [
            ['Service Channel', 'Defines routable work type', 'Setup > Omni-Channel > Service Channels'],
            ['Routing Configuration', 'Defines routing method', 'Setup > Omni-Channel > Routing Configs'],
            ['Queue', 'Groups work by type', 'Setup > Queues'],
            ['Presence Status', 'Agent availability states', 'Setup > Omni-Channel > Presence Statuses'],
            ['Presence Config', 'Status visibility rules', 'Setup > Omni-Channel > Presence Configs'],
            ['Capacity Rules', 'Agent workload limits', 'Setup > Omni-Channel > Capacity Rules']
          ]},
          { t: 'h', x: 'Service Channel Setup' },
          { t: 'p', x: 'A Service Channel defines a type of work that can be routed through Omni-Channel. Each channel maps to an SObject (like Case or LiveChatTranscript) and specifies which fields hold routing-relevant data.' },
          { t: 'num', items: [
            'Create a Service Channel for Case (or Chat, or custom object)',
            'Map the Service Channel to the SObject',
            'Configure the capacity field (e.g., Case Priority affects capacity)',
            'Set up the channel icon and label',
            'Assign the channel to the appropriate routing configuration'
          ]},
          { t: 'h', x: 'Presence Status Configuration' },
          { t: 'p', x: 'Presence statuses define the states an agent can be in (Online, Busy, On Break). Each status is assigned to a presence configuration, which controls which channels the status is available for and whether the status is considered "available" for routing.' },
          { t: 'code', lang: 'apex', x: '// Query Omni-Channel configuration\nSELECT Id, DeveloperName, MasterLabel,\n       CapacityUsed, CapacityPercentage,\n       IsCapacityBased\nFROM UserServicePresence\nWHERE StatusCategory = \'Online\'\n\n// Check routing configuration\nSELECT Id, DeveloperName, MasterLabel,\n       RoutingType, CapacityWeight,\n       IsAttendedRouting\nFROM RoutingConfiguration\nWHERE IsActive = true' },
          { t: 'callout', kind: 'tip', x: 'Always test Omni-Channel routing in a sandbox with realistic volumes before going live. Routing behavior can be surprising when multiple queues and presence statuses interact.' },
          { t: 'selfcheck', q: 'What is the purpose of a Service Channel in Omni-Channel?', a: 'A Service Channel defines a type of work that can be routed. It maps to an SObject (like Case or Chat) and specifies which fields contain routing-relevant data, enabling the routing engine to match work to the right agents.' }
        ]
      },
      {
        title: 'Queue-Based vs Skills-Based Routing',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Routing Methods Comparison' },
          { t: 'table', head: ['Method', 'How It Works', 'Best For', 'Complexity'], rows: [
            ['Queue-Based', 'Work goes to a queue, agents pull from it', 'Simple setups, team-based routing', 'Low'],
            ['Skills-Based', 'Work routed based on agent skills', 'Specialized support, multilingual', 'Medium'],
            ['External Routing', 'Custom logic in Apex', 'Complex business rules', 'High'],
            ['Most Available', 'Routed to agent with most capacity', 'Load balancing', 'Low']
          ]},
          { t: 'h', x: 'Queue-Based Routing' },
          { t: 'p', x: 'Queue-based routing places cases in a queue where agents manually pick them up. This is the simplest routing method and works well for teams with similar skill sets. Agents can see the queue contents and select cases based on priority or familiarity.' },
          { t: 'h', x: 'Skills-Based Routing' },
          { t: 'p', x: 'Skills-based routing automatically matches cases to agents based on required skills. Each case is evaluated against agent skill profiles, and the best match receives the work. This requires defining skills (e.g., "Billing", "Technical", "Spanish") and assigning skill levels to agents.' },
          { t: 'list', items: [
            'Define skills in Setup > Skills (e.g., Product Knowledge, Language)',
            'Assign skill levels to agents (1-10 scale)',
            'Add required skills to routing configurations',
            'Configure skill matching rules and priorities',
            'Set fallback queues for unmatched cases',
            'Monitor skill coverage gaps in Omni Supervisor'
          ]},
          { t: 'code', lang: 'apex', x: '// Skills-based routing example\n// Case requires "Billing" skill at level 5\n// Agent profiles:\n//   Agent A: Billing=8, Technical=3\n//   Agent B: Billing=4, Technical=9\n//   Agent C: Billing=7, Technical=6\n\n// Result: Agent A (Billing=8) is the best match\n// If Agent A is unavailable, Agent C (Billing=7) is next\n// Agent B (Billing=4) does not meet the minimum level\n\n// Configuration in Routing Config:\n// Required Skill: Billing, Min Level: 5\n// Matching Type: Most Skilled\n// Fallback: Tier1-Queue' },
          { t: 'callout', kind: 'warn', x: 'Skills-based routing increases complexity. Start with queue-based routing and evolve to skills-based only when you have clear data on agent capabilities and case requirements.' },
          { t: 'selfcheck', q: 'When should you choose queue-based routing over skills-based routing?', a: 'Queue-based routing is simpler and works well when agents have similar skills or when the team is small. Choose it when you don\'t need to match specific capabilities to cases. Skills-based routing is better for large teams with diverse specializations.' }
        ]
      },
      {
        title: 'Omni Supervisor Dashboards & Monitoring',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Omni Supervisor Overview' },
          { t: 'p', x: 'Omni Supervisor provides real-time visibility into agent activity, queue status, and service levels. Supervisors can monitor agent presence, reassign work, and identify bottlenecks. It replaces the legacy Supervisor Console with a modern, configurable interface.' },
          { t: 'table', head: ['Dashboard Panel', 'What It Shows', 'Action Available'], rows: [
            ['Agents', 'Agent presence status, capacity', 'Change agent status, view agent details'],
            ['Queues', 'Queue depth, wait times', 'Reassign items, view queue contents'],
            ['Service Channels', 'Volume per channel', 'Adjust routing weights'],
            ['Metrics', 'SLA compliance, response times', 'Drill down to individual cases']
          ]},
          { t: 'h', x: 'Supervisor Actions' },
          { t: 'list', items: [
            'View all agents and their current presence status',
            'Override agent presence (set to "Off Queue")',
            'Reassign cases between agents or queues',
            'Monitor queue wait times and volume',
            'Filter by service channel, queue, or skill',
            'Export real-time data for reporting',
            'Set up alerts for SLA thresholds'
          ]},
          { t: 'code', lang: 'apex', x: '// Query real-time Omni-Channel metrics\nSELECT Id, UserId, UserName,\n       PresenceStatus, PresenceStatusCategory,\n       ServiceChannelId, CapacityUsed\nFROM UserServicePresence\nWHERE ServiceChannel.DeveloperName = \'Case_Channel\'\nORDER BY CapacityUsed DESC\n\n// Query queue metrics\nSELECT Id, Name,\n       (SELECT Id FROM Cases\n        WHERE Status NOT IN (\'Closed\'))\nFROM Queue\nWHERE DeveloperName = \'Tier1_Support\'' },
          { t: 'callout', kind: 'tip', x: 'Configure Omni Supervisor alerts for key thresholds: queue depth > 20, average wait time > 5 minutes, or SLA compliance < 85%. This enables proactive management instead of reactive firefighting.' },
          { t: 'selfcheck', q: 'What is the primary benefit of Omni Supervisor over manual queue monitoring?', a: 'Omni Supervisor provides real-time, centralized visibility across all agents, queues, and channels. Supervisors can take immediate action (reassign work, change status) without navigating to individual records or queues, enabling faster response to changing conditions.' }
        ]
      }
    ],
    quiz: {
      title: 'Omni-Channel Quiz',
      mins: 10,
      questions: [
        { q: 'What does a Service Channel define in Omni-Channel?', opts: ['Agent availability', 'A type of routable work mapped to an SObject', 'A queue configuration', 'A reporting dashboard'], a: 1, why: 'A Service Channel defines a type of work (like Case or Chat) that can be routed through Omni-Channel, mapping the SObject to the routing engine.' },
        { q: 'What is the main advantage of skills-based routing over queue-based routing?', opts: ['Simpler to configure', 'Automatically matches cases to agents with the right capabilities', 'Requires fewer licenses', 'Provides better reporting'], a: 1, why: 'Skills-based routing automatically matches cases to agents based on required skills, ensuring specialized cases go to qualified agents without manual selection.' },
        { q: 'What can a supervisor do from Omni Supervisor?', opts: ['Create new cases', 'Reassign cases and override agent presence', 'Edit routing configurations', 'Delete closed cases'], a: 1, why: 'Omni Supervisor allows supervisors to reassign work between agents/queues and override agent presence status in real time, enabling dynamic workload management.' }
      ]
    }
  },
  {
    id: 'einstein-bots',
    n: 9,
    title: 'Einstein Bots & Messaging',
    icon: '09',
    color: '#EC4899',
    tagline: 'Automate conversations with AI-powered bots and messaging channels.',
    guide: '09-Einstein-Bots-and-Messaging.md',
    art: [
      { label: 'Bot Flow Diagram', href: 'force-app/main/default/classes/EinsteinRecommendationService.cls' },
      { label: 'Messaging Channels Config', href: 'force-app/main/default/platformEvent/Service_Event__e.event-meta.xml' }
    ],
    objectives: [
      'Set up Messaging for In-App and Web',
      'Configure Einstein Bot dialogs and intents',
      'Implement bot-to-agent escalation',
      'Integrate Social Customer Service channels',
      'Design effective bot conversation flows',
      'Measure bot performance and customer satisfaction'
    ],
    lessons: [
      {
        title: 'Messaging for In-App and Web',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Messaging Channels Overview' },
          { t: 'p', x: 'Messaging for In-App and Web allows customers to communicate with your company through embedded chat widgets on websites or within mobile apps. It supports real-time messaging with features like typing indicators, read receipts, and file sharing.' },
          { t: 'table', head: ['Channel', 'Platform', 'Features', 'Setup Complexity'], rows: [
            ['Web Chat', 'Website', 'Widget, pre-chat, file share', 'Medium'],
            ['In-App Messaging', 'Mobile App', 'Embedded, push notifications', 'Medium'],
            ['SMS', 'Mobile Phone', 'Text messaging', 'Low-Medium'],
            ['WhatsApp', 'WhatsApp App', 'Business API integration', 'High'],
            ['Facebook Messenger', 'Facebook', 'Page integration', 'Medium'],
            ['Apple Business Chat', 'iMessage', 'Apple Business Register', 'High']
          ]},
          { t: 'h', x: 'Web Chat Setup' },
          { t: 'num', items: [
            'Enable Chat in Setup > Chat Settings',
            'Create a Chat Deployment with branding and button text',
            'Configure Pre-Chat Form to collect customer info',
            'Set up Routing for chat requests to queues',
            'Add the chat widget code to your website',
            'Test the chat experience end-to-end'
          ]},
          { t: 'h', x: 'In-App Messaging Configuration' },
          { t: 'p', x: 'In-App Messaging embeds a messaging experience directly in your mobile app. It supports push notifications, rich media, and persistent conversation history. The SDK integration allows seamless handoff between bot and agent.' },
          { t: 'code', lang: 'apex', x: '// Pre-chat form mapping to Case fields\n// The pre-chat component collects:\n// - Name (maps to Contact.Name)\n// - Email (maps to Contact.Email)\n// - Subject (maps to Case.Subject)\n// - Description (maps to Case.Description)\n\n// After chat ends, case is created:\nSELECT Id, CaseNumber, Subject, Status,\n       Contact.Name, Contact.Email,\n       (SELECT Id, Body, SentBy, CreatedDate\n        FROM CaseChatMessages\n        ORDER BY CreatedDate)\nFROM Case\nWHERE Origin = \'Chat\'\nAND CreatedDate = TODAY' },
          { t: 'callout', kind: 'tip', x: 'Configure pre-chat forms to auto-populate from known customer data (e.g., from cookies or app context). This reduces customer effort and improves routing accuracy.' },
          { t: 'selfcheck', q: 'What is the difference between Web Chat and In-App Messaging?', a: 'Web Chat is a widget embedded on websites that customers access through a browser. In-App Messaging is embedded within a native mobile app using the SDK, supporting push notifications and persistent conversations across app sessions.' }
        ]
      },
      {
        title: 'Einstein Bot Setup & Dialogs',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Einstein Bot Architecture' },
          { t: 'p', x: 'Einstein Bots use a dialog-based system where conversations are structured as a series of dialogs. Each dialog handles a specific topic (e.g., "Check Order Status", "Reset Password"). The bot uses natural language processing to match customer intents to the appropriate dialog.' },
          { t: 'table', head: ['Component', 'Purpose', 'Example'], rows: [
            ['Dialog', 'Conversation topic', '"Check Order Status"'],
            ['Intent', 'Customer goal', '"Where is my order?"'],
            ['Entity', 'Extracted data', '"Order #12345"'],
            ['Action', 'System operation', 'Query Order object'],
            ['Response', 'Bot message', '"Your order shipped on..."'],
            ['Handoff', 'Transfer to agent', '"Let me connect you..."']
          ]},
          { t: 'h', x: 'Building Effective Dialogs' },
          { t: 'num', items: [
            'Start with the top 5 most common support topics',
            'Design clear intent phrases (5-10 variations per intent)',
            'Create response templates with merge fields',
            'Add confirmation steps for critical actions',
            'Implement fallback dialogs for unrecognized input',
            'Test with sample conversations before deployment'
          ]},
          { t: 'code', lang: 'apex', x: '// Einstein Bot can call Apex actions\n// to query custom data\n@InvocableMethod(\n    label=\'Get Order Status\'\n    description=\'Returns order status for bot dialog\'\n)\npublic static List<OrderResult> getOrderStatus(\n    List<OrderRequest> requests\n) {\n    List<OrderResult> results = new List<OrderResult>();\n    for (OrderRequest req : requests) {\n        List<Order> orders = [\n            SELECT Id, OrderNumber, Status,\n                   ShippedDate, TrackingNumber\n            FROM Order\n            WHERE AccountId = :req.accountId\n            ORDER BY CreatedDate DESC\n            LIMIT 5\n        ];\n        for (Order o : orders) {\n            results.add(new OrderResult(\n                o.OrderNumber, o.Status,\n                o.ShippedDate, o.TrackingNumber\n            ));\n        }\n    }\n    return results;\n}' },
          { t: 'callout', kind: 'warn', x: 'Always provide a "Talk to a Human" option in every dialog. Bots should handle simple queries and escalate complex ones. Forcing customers through a bot when they want an agent creates frustration.' },
          { t: 'selfcheck', q: 'What is the recommended starting point for building an Einstein Bot?', a: 'Start with the top 5 most common support topics. These typically cover 60-80% of incoming contacts. Build dialogs for these first, measure performance, then expand to additional topics based on actual customer needs.' }
        ]
      },
      {
        title: 'Escalation to Agents & Social Customer Service',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Bot-to-Agent Escalation' },
          { t: 'p', x: 'Effective escalation is critical for bot success. Customers should be able to request an agent at any point, and the bot should automatically escalate when it cannot resolve an issue. The escalation path should transfer the full conversation context to the agent.' },
          { t: 'list', items: [
            'Always include "Talk to a Human" as a fallback option',
            'Transfer conversation history to the agent during handoff',
            'Route to the appropriate queue based on issue type',
            'Set wait time expectations before transferring',
            'Log the bot conversation to the Case record',
            'Capture customer sentiment before and after bot interaction'
          ]},
          { t: 'h', x: 'Social Customer Service Integration' },
          { t: 'p', x: 'Social Customer Service enables agents to monitor and respond to social media interactions (Twitter, Facebook) directly from the Service Console. Posts, mentions, and messages are converted to Cases and routed to agents through Omni-Channel.' },
          { t: 'table', head: ['Platform', 'Integration Method', 'Case Creation', 'Features'], rows: [
            ['Twitter', 'Streaming API', 'Auto-create on mention/DM', 'Monitor keywords, respond publicly'],
            ['Facebook', 'Graph API', 'Auto-create on page post/DM', 'Respond to comments, private messages'],
            ['Instagram', 'Graph API', 'Auto-create on comment/DM', 'Respond to comments, stories'],
            ['YouTube', 'Data API', 'Auto-create on comment', 'Monitor brand mentions']
          ]},
          { t: 'code', lang: 'apex', x: '// Social Customer Service creates cases from posts\n// Query social-origin cases\nSELECT Id, CaseNumber, Subject, Status,\n       Origin, SocialPostUrl__c,\n       SocialNetwork__c, SocialHandle__c,\n       (SELECT Id, Body, CreatedDate\n        FROM SocialPosts\n        ORDER BY CreatedDate DESC)\nFROM Case\nWHERE Origin IN (\'Twitter\', \'Facebook\', \'Instagram\')\nAND CreatedDate = LAST_7_DAYS\nORDER BY CreatedDate DESC' },
          { t: 'callout', kind: 'tip', x: 'Set up social listening rules to capture brand mentions even when customers don\'t tag your official account. This proactive approach can identify issues before they escalate.' },
          { t: 'selfcheck', q: 'What happens when a bot cannot resolve a customer issue?', a: 'The bot should automatically escalate to a live agent, transferring the full conversation context. The case is routed to the appropriate queue via Omni-Channel, and the agent sees the entire bot interaction history, avoiding the customer having to repeat themselves.' }
        ]
      }
    ],
    quiz: {
      title: 'Einstein Bots & Messaging Quiz',
      mins: 10,
      questions: [
        { q: 'What is the purpose of a Bot Dialog in Einstein Bots?', opts: ['To store customer data', 'To handle a specific conversation topic with intents and responses', 'To route cases to agents', 'To generate reports'], a: 1, why: 'Each Dialog handles a specific conversation topic (e.g., "Check Order Status"). It contains intents (customer goals), actions (system operations), and responses (bot messages) for that topic.' },
        { q: 'What should every Einstein Bot dialog include?', opts: ['A link to the knowledge base', 'A "Talk to a Human" fallback option', 'A customer satisfaction survey', 'A payment processing step'], a: 1, why: 'Every dialog should provide a way to escalate to a live agent. This ensures customers can always reach a human when the bot cannot resolve their issue.' },
        { q: 'How does Social Customer Service create cases?', opts: ['Agents manually create them from social media', 'Social posts are automatically converted to Cases', 'Customers must fill out a web form', 'Cases are created by batch process nightly'], a: 1, why: 'Social Customer Service automatically converts social media interactions (mentions, posts, DMs) into Case records that are routed to agents through Omni-Channel.' }
      ]
    }
  },
  {
    id: 'cti',
    n: 10,
    title: 'CTI / Open CTI & Telephony',
    icon: '10',
    color: '#14B8A6',
    tagline: 'Integrate telephony with the Service Console.',
    guide: '10-CTI-and-Telephony.md',
    art: [
      { label: 'CTI Architecture', href: 'force-app/main/default/classes/CaseTriggerHandlerService.cls' },
      { label: 'Adapter Comparison', href: 'force-app/main/default/classes/EinsteinRecommendationService.cls' }
    ],
    objectives: [
      'Understand Open CTI architecture and adapters',
      'Configure the softphone in the Service Console',
      'Implement screen pop for incoming calls',
      'Set up call logging and activity tracking',
      'Integrate with third-party telephony providers',
      'Design call workflows with CTI connectors'
    ],
    lessons: [
      {
        title: 'Softphone & Open CTI Adapters',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Open CTI Architecture' },
          { t: 'p', x: 'Open CTI is Salesforce\'s framework for integrating computer telephony with the Service Console. It uses JavaScript APIs that run in the browser, allowing agents to make and receive calls directly within the console. Third-party telephony providers build adapters that connect their systems to Salesforce using the Open CTI API.' },
          { t: 'table', head: ['Component', 'Purpose', 'Configuration'], rows: [
            ['Softphone', 'In-browser phone control', 'CTI adapter + Lightning App Builder'],
            ['Open CTI API', 'JavaScript integration layer', 'Developer tools / custom code'],
            ['CTI Connector', 'Maps telephony events to Salesforce', 'Third-party or custom build'],
            ['Screen Pop Config', 'Auto-open records on call', 'Call center settings'],
            ['Call Logging', 'Auto-create activities', 'CTI adapter configuration']
          ]},
          { t: 'h', x: 'Softphone Configuration' },
          { t: 'num', items: [
            'Install the CTI adapter package from AppExchange or vendor',
            'Create a Call Center definition in Setup > Call Centers',
            'Associate the adapter with the Call Center',
            'Add the Softphone utility item to the console utility bar',
            'Configure softphone layout (dial pad, call controls)',
            'Test inbound and outbound calls'
          ]},
          { t: 'h', x: 'CTI Adapter Comparison' },
          { t: 'table', head: ['Adapter', 'Provider', 'Features', 'Certification'], rows: [
            ['Amazon Connect', 'AWS', 'Cloud-native, AI integration', 'Salesforce Certified'],
            ['Genesys Cloud', 'Genesys', 'Omnichannel, workforce management', 'Salesforce Certified'],
            ['Five9', 'Five9', 'Cloud contact center, CRM integration', 'Salesforce Certified'],
            ['NICE inContact', 'NICE', 'Enterprise, analytics', 'Salesforce Certified'],
            ['Custom Adapter', 'In-house', 'Full control, custom requirements', 'Self-maintained']
          ]},
          { t: 'code', lang: 'javascript', x: '// Open CTI API: Making an outbound call\n// Using the softphone\'s click-to-dial feature\n\n// Register click-to-dial handler\nsforce.opencti.onClickToDial({\n    listener: function(response) {\n        // response.number contains the phone number\n        // response.recordId contains the related record\n        console.log(\'Dialing: \' + response.number);\n\n        // Optionally create a Task for the call\n        sforce.opencti.runApex({\n            apexClass: \'CTICallLogger\',\n            methodName: \'logOutboundCall\',\n            methodParams: {\n                phoneNumber: response.number,\n                recordId: response.recordId\n            },\n            callback: function(result) {\n                if (result.success) {\n                    console.log(\'Call logged successfully\');\n                }\n            }\n        });\n    }\n});' },
          { t: 'callout', kind: 'tip', x: 'Always test CTI integration in a sandbox with the vendor\'s test environment. Phone number formats, caller ID, and call routing rules need end-to-end validation before going live.' },
          { t: 'selfcheck', q: 'What is the role of an Open CTI adapter?', a: 'An Open CTI adapter is a software component (usually provided by a telephony vendor) that bridges the gap between the phone system and Salesforce. It translates telephony events (incoming calls, hang-ups) into Salesforce actions (screen pops, call logging) using the Open CTI JavaScript API.' }
        ]
      },
      {
        title: 'Screen Pop, Call Logging & Third-Party Integrations',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Screen Pop Configuration' },
          { t: 'p', x: 'Screen Pop automatically opens a record (Contact, Case, or custom object) when an agent receives an incoming call. This gives agents immediate context about the caller, reducing average handle time and improving first-contact resolution.' },
          { t: 'table', head: ['Screen Pop Action', 'Behavior', 'Use Case'], rows: [
            ['Pop to Record', 'Opens the matching Contact/Account', 'Known caller identification'],
            ['Pop to New Case', 'Opens a new Case form', 'First-time callers'],
            ['Pop to Search', 'Searches for the caller', 'Unknown numbers'],
            ['Pop to Feed', 'Opens the Case feed', 'Returning issues']
          ]},
          { t: 'h', x: 'Automatic Call Logging' },
          { t: 'p', x: 'When a call ends, the CTI adapter can automatically create a Task record on the related Case or Contact. This ensures every call is tracked without agents manually logging activities. Call duration, direction, and notes are captured.' },
          { t: 'num', items: [
            'Configure the CTI adapter to auto-create Tasks on call end',
            'Map call fields (duration, direction, outcome) to Task fields',
            'Set the Task subject to indicate call type (Inbound/Outbound)',
            'Link the Task to the appropriate Case or Contact',
            'Include call recording links in the Task description',
            'Set up follow-up Tasks based on call outcome'
          ]},
          { t: 'code', lang: 'apex', x: '// Apex class for call logging via CTI adapter\npublic class CTICallLogger {\n\n    @InvocableMethod(\n        label=\'Log Call Activity\'\n        description=\'Creates a Task for CTI call logging\'\n    )\n    public static void logCall(List<CallInfo> calls) {\n        List<Task> tasks = new List<Task>();\n        for (CallInfo call : calls) {\n            Task t = new Task(\n                Subject = call.direction + \' Call: \' + call.phoneNumber,\n                Status = \'Completed\',\n                Priority = \'Normal\',\n                WhoId = call.contactId,\n                WhatId = call.caseId,\n                Description = \'Duration: \' + call.duration +\n                    \' seconds\\nOutcome: \' + call.outcome +\n                    \'\\nRecording: \' + call.recordingUrl,\n                ActivityDate = Date.today(),\n                Type = \'Call\'\n            );\n            tasks.add(t);\n        }\n        insert tasks;\n    }\n\n    public class CallInfo {\n        @InvocableVariable public String phoneNumber;\n        @InvocableVariable public String direction;\n        @InvocableVariable public Integer duration;\n        @InvocableVariable public String outcome;\n        @InvocableVariable public String contactId;\n        @InvocableVariable public String caseId;\n        @InvocableVariable public String recordingUrl;\n    }\n}' },
          { t: 'callout', kind: 'warn', x: 'Be mindful of call recording laws. Some jurisdictions require explicit consent before recording. Configure the CTI adapter to respect recording consent flags and display appropriate notifications to agents.' },
          { t: 'selfcheck', q: 'Why is screen pop important for customer service?', a: 'Screen Pop gives agents immediate context about the caller by opening their record automatically. This eliminates the time spent searching for customer information, reduces average handle time, and allows agents to personalize the interaction from the first second.' }
        ]
      }
    ],
    quiz: {
      title: 'CTI & Telephony Quiz',
      mins: 10,
      questions: [
        { q: 'What does Open CTI provide?', opts: ['A built-in phone system', 'A JavaScript API framework for telephony integration', 'A hardware telephony device', 'A reporting tool for call center metrics'], a: 1, why: 'Open CTI is a JavaScript API framework that enables third-party telephony providers to integrate their phone systems with the Salesforce Service Console.' },
        { q: 'What is the purpose of Screen Pop?', opts: ['To pop up an advertisement', 'To automatically open a caller\'s record when they call', 'To display call center metrics', 'To generate a call report'], a: 1, why: 'Screen Pop automatically opens the matching Contact, Account, or Case when an agent receives an incoming call, giving them immediate context about the caller.' },
        { q: 'How does automatic call logging work?', opts: ['Agents manually create Tasks after each call', 'The CTI adapter creates a Task record when the call ends', 'Calls are logged in a separate system', 'Only missed calls are logged'], a: 1, why: 'The CTI adapter automatically creates a Task record on the related Case or Contact when a call ends, capturing duration, direction, and outcome without agent intervention.' }
      ]
    }
  },
  {
    id: 'case-mgmt',
    n: 11,
    title: 'Case Management Best Practices',
    icon: '11',
    color: '#F97316',
    tagline: 'Optimize case management with teams, escalation paths, and self-service.',
    guide: '11-Case-Management-Best-Practices.md',
    art: [
      { label: 'Case Teams Diagram', href: 'force-app/main/default/triggers/CaseCommentTrigger.trigger' },
      { label: 'Escalation Matrix', href: 'force-app/main/default/classes/EscalationService.cls' }
    ],
    objectives: [
      'Configure Case Teams for collaborative resolution',
      'Design effective escalation paths',
      'Set up Experience Cloud self-service portals',
      'Manage customer contacts and account relationships',
      'Implement case merging and deduplication',
      'Apply case management best practices'
    ],
    lessons: [
      {
        title: 'Case Teams, Collaboration & Contacts',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Case Teams' },
          { t: 'p', x: 'Case Teams allow multiple users to collaborate on a single case. Each team member has a defined role (e.g., Primary Support, Technical Support, Subject Matter Expert). Team members can see the case in their console and receive notifications about case updates.' },
          { t: 'table', head: ['Team Role', 'Responsibility', 'Typical Profile'], rows: [
            ['Primary Owner', 'Main point of contact, drives resolution', 'Tier 1/2 Agent'],
            ['Technical Support', 'Provides deep technical expertise', 'Tier 3 Engineer'],
            ['Escalation Manager', 'Oversees escalations, removes blockers', 'Team Lead/Manager'],
            ['Subject Matter Expert', 'Advises on specific domain', 'Specialist'],
            ['Customer Success', 'Ensures customer satisfaction', 'CSM']
          ]},
          { t: 'h', x: 'Collaboration Features' },
          { t: 'list', items: [
            'Chatter posts on the Case for team discussions',
            'Case feed shows all team activity in chronological order',
            'Email alerts notify team members of case updates',
            'Knowledge article suggestions help teams find answers',
            'Internal notes visible only to the support team',
            '@mentions in Chatter to notify specific team members'
          ]},
          { t: 'h', x: 'Contact & Account Management' },
          { t: 'p', x: 'Proper contact and account management ensures agents have complete customer context. The Account-Contact relationship provides visibility into the customer\'s history, products, and service agreements.' },
          { t: 'code', lang: 'apex', x: '// Query case with team and contact details\nSELECT Id, CaseNumber, Subject, Status, Priority,\n       Contact.Name, Contact.Email, Contact.Phone,\n       Account.Name, Account.Industry,\n       Entitlement.Name,\n       (SELECT Id, TeamMemberId, TeamMember.Name,\n               Role\n        FROM CaseTeamMembers\n        ORDER BY CreatedDate)\nFROM Case\nWHERE Id = \'500XX0000012345\'\n\n// Find all cases for an account\nSELECT Id, CaseNumber, Subject, Status,\n       CreatedDate, ClosedDate\nFROM Case\nWHERE AccountId = \'001XX000003ABC\'\nORDER BY CreatedDate DESC\nLIMIT 50' },
          { t: 'callout', kind: 'tip', x: 'Set up default case teams based on case type or priority. This ensures the right experts are automatically added to cases without agents having to manually add team members.' },
          { t: 'selfcheck', q: 'When should you use Case Teams instead of just assigning a case to one agent?', a: 'Case Teams are ideal for complex cases requiring cross-functional expertise (e.g., a technical issue involving billing). They enable parallel work, knowledge sharing, and faster resolution by bringing the right people together without transferring ownership.' }
        ]
      },
      {
        title: 'Escalation Paths & Entitlement-Based Routing',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Escalation Path Design' },
          { t: 'p', x: 'A well-defined escalation path ensures issues are routed to the right level of support at the right time. Escalation can be time-based (SLA approaching), complexity-based (issue too difficult), or customer-initiated (dissatisfaction).' },
          { t: 'table', head: ['Escalation Level', 'Trigger', 'Owner', 'Expected Resolution'], rows: [
            ['Tier 1', 'Initial intake', 'Front-line agent', '0-4 hours'],
            ['Tier 2', 'Complex/technical issue', 'Specialist', '4-24 hours'],
            ['Tier 3', 'Critical/bug-related', 'Engineering', '24-72 hours'],
            ['Management', 'Customer escalation', 'Support Manager', 'Immediate review'],
            ['Executive', 'VIP/Business impact', 'VP Support', 'Same day']
          ]},
          { t: 'h', x: 'Entitlement-Based Routing' },
          { t: 'p', x: 'Different customers may have different SLA requirements based on their contract tier. Premium customers might get 1-hour response times while standard customers get 24-hour response times. Entitlement-based routing ensures the right SLA is applied based on the customer\'s service agreement.' },
          { t: 'list', items: [
            'Define entitlement types for each service tier (Premium, Standard, Basic)',
            'Create entitlement processes with different milestone times per type',
            'Link entitlements to customer accounts based on their contract',
            'Auto-assign entitlement type based on account tier',
            'Use different escalation queues per entitlement type',
            'Report on SLA compliance by entitlement type'
          ]},
          { t: 'code', lang: 'apex', x: '// Entitlement-based routing logic\n// Auto-assign entitlement based on account tier\ntrigger EntitlementAssignment on Case (\n    after insert\n) {\n    Set<Id> accountIds = new Set<Id>();\n    for (Case c : Trigger.new) {\n        if (c.AccountId != null) {\n            accountIds.add(c.AccountId);\n        }\n    }\n\n    // Query entitlements by account tier\n    Map<Id, List<Entitlement>> acctEntitlements =\n        new Map<Id, List<Entitlement>>();\n    for (Entitlement e : [\n        SELECT Id, AccountId, Type,\n               StartDate, EndDate\n        FROM Entitlement\n        WHERE AccountId IN :accountIds\n        AND Status = \'Active\'\n        AND StartDate <= TODAY\n        AND EndDate >= TODAY\n        ORDER BY Type ASC\n    ]) {\n        if (!acctEntitlements.containsKey(e.AccountId)) {\n            acctEntitlements.put(\n                e.AccountId, new List<Entitlement>()\n            );\n        }\n        acctEntitlements.get(e.AccountId).add(e);\n    }\n\n    for (Case c : Trigger.new) {\n        if (c.EntitlementId == null &&\n            acctEntitlements.containsKey(c.AccountId)) {\n            // Assign first available entitlement\n            c.EntitlementId = acctEntitlements.get(\n                c.AccountId\n            )[0].Id;\n        }\n    }\n}' },
          { t: 'callout', kind: 'warn', x: 'Avoid escalation paths that are too deep. More than 4 escalation levels usually indicates a process problem, not a support problem. Focus on empowering lower tiers with better tools and knowledge instead.' },
          { t: 'selfcheck', q: 'What is the difference between time-based and complexity-based escalation?', a: 'Time-based escalation triggers when an SLA milestone is approaching or breached (e.g., first response not provided within 4 hours). Complexity-based escalation triggers when the issue requires expertise beyond the current agent\'s capabilities (e.g., a bug requiring engineering investigation).' }
        ]
      },
      {
        title: 'Community Self-Service (Experience Cloud)',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Experience Cloud for Self-Service' },
          { t: 'p', x: 'Experience Cloud (formerly Community Cloud) enables customers to find answers and resolve issues without contacting support. A well-designed self-service portal deflects cases, reduces support costs, and improves customer satisfaction.' },
          { t: 'table', head: ['Self-Service Feature', 'Purpose', 'Deflection Impact'], rows: [
            ['Knowledge Base', 'Searchable articles', 'High - addresses top 20 issues'],
            ['Case Creation', 'Submit issues online', 'Medium - reduces phone/email volume'],
            ['Community Forums', 'Peer-to-peer support', 'Medium - builds community knowledge'],
            ['Account Portal', 'View orders, invoices, subscriptions', 'High - reduces status inquiry calls'],
            ['Live Chat', 'Real-time agent assistance', 'Low - still requires agent']
          ]},
          { t: 'h', x: 'Portal Design Best Practices' },
          { t: 'num', items: [
            'Lead with knowledge search on the home page',
            'Use data categories to help customers find relevant content',
            'Make case creation a guided flow (not a blank form)',
            'Provide status tracking for existing cases',
            'Include account self-service (billing, orders)',
            'Offer chat as a fallback when self-service fails',
            'Collect feedback on article helpfulness'
          ]},
          { t: 'code', lang: 'apex', x: '// Experience Cloud: Customer self-service case creation\n// Guest users can create cases via the portal\n// Cases are auto-linked to their contact record\n\nSELECT Id, CaseNumber, Subject, Status,\n       Contact.Name, Contact.Email,\n       Description, Origin,\n       CreatedDate, LastModifiedDate\nFROM Case\nWHERE ContactId = :currentContactId\nORDER BY CreatedDate DESC\nLIMIT 20\n\n// Knowledge articles visible to portal users\nSELECT Id, Title, Summary, ArticleNumber,\n       PublishStatus, LastPublishedDate\nFROM Knowledge__kav\nWHERE PublishStatus = \'Online\'\nAND IsVisibleInCsp = true\nAND KnowledgeArticleId IN (\n    SELECT KnowledgeArticleId\n    FROM KnowledgeArticleVersion\n    WHERE Language = \'en_US\'\n)\nORDER BY LastPublishedDate DESC' },
          { t: 'callout', kind: 'tip', x: 'Track your case deflection rate (cases avoided through self-service). Aim for 30-50% deflection within the first year. Use analytics to identify the most-searched terms without results, then create articles for those topics.' },
          { t: 'selfcheck', q: 'What is the primary goal of an Experience Cloud self-service portal?', a: 'The primary goal is case deflection \u2014 enabling customers to resolve their issues without contacting support. This reduces support costs, improves customer satisfaction (faster answers), and allows agents to focus on complex issues that truly need human intervention.' }
        ]
      }
    ],
    quiz: {
      title: 'Case Management Quiz',
      mins: 10,
      questions: [
        { q: 'When should you use Case Teams instead of assigning to a single agent?', opts: ['For every case', 'For complex cases requiring cross-functional expertise', 'Only for VIP customers', 'Only for escalated cases'], a: 1, why: 'Case Teams are ideal for complex cases that require input from multiple specialists (technical, billing, management). They enable parallel work without transferring ownership.' },
        { q: 'What is the purpose of Experience Cloud self-service?', opts: ['To replace all human agents', 'To deflect cases by enabling customer self-service', 'To provide internal collaboration tools', 'To manage employee onboarding'], a: 1, why: 'Experience Cloud self-service portals enable customers to find answers and resolve issues independently, reducing the volume of cases that require agent intervention.' },
        { q: 'What is a good target for case deflection rate in the first year?', opts: ['5-10%', '10-15%', '30-50%', '80-90%'], a: 2, why: 'A 30-50% deflection rate is realistic for the first year. This means 30-50% of potential cases are resolved through self-service without agent involvement.' }
      ]
    }
  },
  {
    id: 'analytics',
    n: 12,
    title: 'Reports & Dashboards for Service',
    icon: '12',
    color: '#6366F1',
    tagline: 'Measure and optimize service performance with data.',
    guide: '12-Reports-and-Dashboards-for-Service.md',
    art: [
      { label: 'Dashboard Mockup', href: 'force-app/main/default/dashboards/Service_Cloud_Dashboards/Service_Cloud_Performance.dashboard-meta.xml' },
      { label: 'KPI Definitions', href: 'force-app/main/default/reports/Service_Cloud_Analytics/Case_SLA_Compliance.report-meta.xml' }
    ],
    objectives: [
      'Create case analytics reports with proper report types',
      'Track KPIs: CSAT, FCR, SLA %, and Backlog',
      'Design effective dashboards for different audiences',
      'Configure report folder sharing and security',
      'Use historical trending for long-term analysis',
      'Build real-time dashboards for supervisor monitoring'
    ],
    lessons: [
      {
        title: 'Case Analytics & Report Types',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Service Cloud Report Types' },
          { t: 'table', head: ['Report Type', 'Primary Object', 'Related Objects', 'Use Case'], rows: [
            ['Cases', 'Case', 'Contact, Account, Entitlement', 'Standard case analysis'],
            ['Cases with Entitlements', 'Case', 'Entitlement, Milestone', 'SLA compliance'],
            ['Cases with Knowledge Articles', 'Case', 'Knowledge__kav', 'Article usage'],
            ['Case Historical Trending', 'Case', 'Snapshot data', 'Trend analysis'],
            ['Cases with Case Comments', 'Case', 'CaseComment', 'Collaboration tracking'],
            ['Cases with Feed', 'Case', 'CaseFeed', 'Activity analysis']
          ]},
          { t: 'h', x: 'Key Case Reports' },
          { t: 'list', items: [
            'Cases by Status (open vs. closed breakdown)',
            'Cases by Priority and Age (backlog analysis)',
            'Cases by Origin (channel effectiveness)',
            'Cases by Record Type (issue categorization)',
            'Cases by Owner (agent workload distribution)',
            'Cases Created vs. Closed (volume trends)',
            'Average Resolution Time by Priority',
            'Cases by Entitlement Type (SLA performance)'
          ]},
          { t: 'h', x: 'Report Configuration Tips' },
          { t: 'num', items: [
            'Use summary fields for grouping and subtotals',
            'Add formula fields for calculated metrics (e.g., days to close)',
            'Use cross-filters to find cases without entitlements',
            'Schedule reports for automatic delivery to stakeholders',
            'Create report charts for visual analysis',
            'Use date range filters for trending analysis'
          ]},
          { t: 'code', lang: 'soql', x: '// Equivalent report data via SOQL\nSELECT Status, Priority, Origin,\n       COUNT(Id) TotalCases,\n       AVG(DATEDIFF(ClosedDate, CreatedDate)) AvgResolutionDays\nFROM Case\nWHERE CreatedDate = THIS_QUARTER\nGROUP BY Status, Priority, Origin\nORDER BY Status, Priority' },
          { t: 'callout', kind: 'tip', x: 'Create a "Service KPI Dashboard" with the top 6 metrics visible at a glance: Open Cases, Avg Resolution Time, SLA Compliance %, CSAT Score, First Contact Resolution %, and Cases Created vs. Closed trend.' },
          { t: 'selfcheck', q: 'Why should you use report types instead of just querying the Case object?', a: 'Report types define which related objects are available for reporting. Using the wrong report type limits the fields you can include. For SLA analysis, you need "Cases with Entitlements" to access Entitlement and Milestone fields. Always choose the report type that includes all related data you need.' }
        ]
      },
      {
        title: 'KPI Tracking: CSAT, FCR, SLA %, Backlog',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Key Performance Indicators' },
          { t: 'table', head: ['KPI', 'Formula', 'Target', 'Data Source'], rows: [
            ['CSAT', '(Satisfied responses / Total responses) * 100', '> 90%', 'Case feed / Survey'],
            ['FCR', '(Resolved on first contact / Total contacts) * 100', '> 70%', 'Case status changes'],
            ['SLA Compliance', '(Cases meeting SLA / Total cases) * 100', '> 90%', 'Milestone tracking'],
            ['Backlog', 'Count of open cases beyond SLA target', '< 10% of open', 'Case age analysis'],
            ['Avg Handle Time', 'Total handle time / Total cases', '< 15 min', 'Task/Activity data'],
            ['Agent Utilization', 'Active time / Available time * 100', '75-85%', 'Omni-Channel presence']
          ]},
          { t: 'h', x: 'CSAT Measurement' },
          { t: 'p', x: 'Customer Satisfaction (CSAT) is typically measured through post-interaction surveys. Salesforce integrates with survey tools to collect feedback directly from cases. The survey response is linked to the Case record for reporting.' },
          { t: 'list', items: [
            'Configure Salesforce Surveys for post-case feedback',
            'Set up survey invitation rules (trigger on case close)',
            'Use 1-5 scale or Yes/No satisfaction questions',
            'Include open-ended feedback for qualitative insights',
            'Report on CSAT by agent, team, and issue type',
            'Set up alerts for low satisfaction scores'
          ]},
          { t: 'code', lang: 'apex', x: '// Calculate FCR: Cases resolved on first contact\n// FCR = Cases closed in 1 status change / Total cases\n\nSELECT COUNT(Id) TotalCases,\n       COUNT(CASE\n           WHEN Status = \'Closed\'\n           AND StatusChanges__c = 1\n           THEN 1\n       END) FCRCases,\n       ROUND(\n           COUNT(CASE\n               WHEN Status = \'Closed\'\n               AND StatusChanges__c = 1\n               THEN 1\n           END) * 100.0 / COUNT(Id), 2\n       ) FCRPercentage\nFROM Case\nWHERE CreatedDate = THIS_MONTH\nAND Status = \'Closed\'\n\n// Backlog analysis\nSELECT Priority,\n       COUNT(Id) OpenCases,\n       AVG(DATEDIFF(TODAY, CreatedDate)) AvgAge\nFROM Case\nWHERE Status NOT IN (\'Closed\', \'Cancelled\')\nGROUP BY Priority\nORDER BY Priority DESC' },
          { t: 'callout', kind: 'warn', x: 'CSAT surveys have diminishing returns. Limit to 1-3 questions maximum. Long surveys reduce response rates and can actually decrease satisfaction. Send surveys at the right moment \u2014 immediately after case closure.' },
          { t: 'selfcheck', q: 'What is the difference between CSAT and FCR?', a: 'CSAT measures how satisfied customers are with the service they received (typically a survey score). FCR measures whether the issue was resolved in the first interaction without requiring follow-up. Both are important \u2014 high FCR usually correlates with high CSAT.' }
        ]
      },
      {
        title: 'Dashboard Design & Folder Sharing',
        mins: 20,
        blocks: [
          { t: 'h', x: 'Dashboard Design Principles' },
          { t: 'p', x: 'Effective dashboards tell a story. They should be designed for a specific audience (agent, supervisor, executive) and answer the most important questions at a glance. Use the right chart types and keep the layout clean.' },
          { t: 'table', head: ['Chart Type', 'Best For', 'Example'], rows: [
            ['Metric', 'Single KPI value', 'Total open cases: 234'],
            ['Gauge', 'KPI vs. target', 'SLA Compliance: 92% (target: 90%)'],
            ['Bar Chart', 'Comparison across categories', 'Cases by Priority'],
            ['Line Chart', 'Trend over time', 'Cases created vs. closed weekly'],
            ['Donut Chart', 'Proportion breakdown', 'Cases by Status'],
            ['Table', 'Detailed data listing', 'Top 10 oldest open cases']
          ]},
          { t: 'h', x: 'Dashboard Folder Sharing' },
          { t: 'num', items: [
            'Create dashboard folders organized by audience (Agents, Managers, Executives)',
            'Set folder access permissions (View, Edit, Share)',
            'Use role hierarchy to control visibility',
            'Share folders with specific profiles or public groups',
            'Set up dashboard refresh schedules (hourly, daily)',
            'Enable dynamic dashboard filters for personalization'
          ]},
          { t: 'h', x: 'Recommended Dashboard Layout' },
          { t: 'p', x: 'A service dashboard should follow the "inverted pyramid" principle: most important summary metrics at the top, detailed breakdowns below, and trending data at the bottom. Each component should answer a specific question.' },
          { t: 'code', lang: 'apex', x: '// Dynamic dashboard query example\n// Filtered by current user\'s teams\nSELECT Team__c,\n       COUNT(Id) TotalCases,\n       COUNT(CASE WHEN Status = \'Closed\' THEN 1 END) ClosedCases,\n       ROUND(\n           AVG(CASE\n               WHEN ClosedDate != NULL\n               THEN DATEDIFF(ClosedDate, CreatedDate)\n           END), 1\n       ) AvgResolutionDays,\n       COUNT(CASE\n           WHEN MilestoneViolated__c = true THEN 1\n       END) SLAViolations\nFROM Case\nWHERE CreatedDate = LAST_30_DAYS\nGROUP BY Team__c\nORDER BY TotalCases DESC' },
          { t: 'callout', kind: 'tip', x: 'Create role-specific dashboard views. Agents see their own metrics, managers see team metrics, and executives see organizational metrics. Use dynamic dashboards with "Run as Specified User" to enable this with a single dashboard.' },
          { t: 'selfcheck', q: 'Why is the "inverted pyramid" layout recommended for dashboards?', a: 'The inverted pyramid puts the most critical summary metrics at the top where they\'re seen first. Stakeholders can quickly assess the overall health of the service operation and drill down into specific areas for more detail. This reduces time spent finding relevant information.' }
        ]
      }
    ],
    quiz: {
      title: 'Service Analytics Quiz',
      mins: 10,
      questions: [
        { q: 'What is the formula for First Contact Resolution (FCR)?', opts: ['Cases closed today / Total cases', 'Cases resolved on first contact / Total contacts', 'Customer satisfaction score / 100', 'SLA-compliant cases / Total cases'], a: 1, why: 'FCR measures the percentage of cases resolved during the first interaction without requiring follow-up. It\'s calculated as (First-contact resolutions / Total contacts) * 100.' },
        { q: 'What is the recommended target for CSAT scores?', opts: ['Above 50%', 'Above 70%', 'Above 90%', 'Above 99%'], a: 2, why: 'A CSAT score above 90% indicates strong customer satisfaction. Below 80% typically signals systemic issues with service quality or process design.' },
        { q: 'Why should dashboards follow the "inverted pyramid" layout?', opts: ['It looks more professional', 'Summary metrics at the top enable quick health checks with drill-down capability', 'It requires fewer components', 'It is required by Salesforce'], a: 1, why: 'The inverted pyramid puts critical KPIs at the top for immediate visibility, with detailed breakdowns below. This lets stakeholders assess status at a glance and investigate specific areas as needed.' }
      ]
    }
  },
  {
    id: 'cert-prep',
    n: 13,
    title: 'Certification Prep',
    icon: '13',
    color: '#D946EF',
    tagline: 'Prepare for the Salesforce Service Cloud Consultant certification exam.',
    guide: '13-Certification-Prep.md',
    art: [
      { label: 'Exam Blueprint', href: 'force-app/main/default/objects/Certification_Setting__mdt/records/Service_Cloud_Consultant_Exam.Certification_Setting__mdt.json' },
      { label: 'Study Plan Template', href: 'force-app/main/default/objects/Training_Question__c/Training_Question__c.object-meta.xml' }
    ],
    objectives: [
      'Understand the exam blueprint and domain weightings',
      'Create a personalized study plan',
      'Master key exam topics across all domains',
      'Practice exam-style questions and explanations',
      'Identify weak areas and focus study efforts',
      'Build confidence for exam day'
    ],
    lessons: [
      {
        title: 'Exam Blueprint & Study Plan',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Service Cloud Consultant Exam Facts' },
          { t: 'table', head: ['Detail', 'Value'], rows: [
            ['Exam Name', 'Salesforce Certified Agentforce Service Consultant (formerly Service Cloud Consultant)'],
            ['Questions', '60 scored + up to 5 unscored (unscored are pretest)'],
            ['Duration', '105 minutes'],
            ['Passing Score', '78% (English), 67% (Japanese)'],
            ['Registration Fee', '$200 USD'],
            ['Retake Fee', '$100 USD'],
            ['Prerequisite', 'Salesforce Certified Platform Administrator'],
            ['Delivery', 'Proctored at testing center or online (Kryterion)'],
            ['Question Types', 'Multiple choice, Multiple select, Scenario-based']
          ]},
          { t: 'h', x: 'Exam Domains & Weightings' },
          { t: 'table', head: ['Domain', 'Weighting', 'Key Topics'], rows: [
            ['Case Management', '32%', 'Case lifecycle, queues, assignment rules, escalation rules, auto-response rules, case teams, email-to-case, web-to-case'],
            ['Service Cloud Platform', '13%', 'Service Cloud config, console apps, macros, quick text, Einstein features, entitlements & milestones'],
            ['Interaction Channels', '11%', 'Email-to-case, web-to-case, live chat, messaging, voice (CTI), social, self-service portals'],
            ['Knowledge Management', '10%', 'Article types, data categories, article visibility, Knowledge in console, Lightning Knowledge'],
            ['Contact Center Analytics', '9%', 'Case reports, service dashboards, SLA adherence reporting, agent productivity'],
            ['Service Cloud Solution Design', '9%', 'Requirements gathering, matching features to business needs, ROI and business cases'],
            ['Integrations and Data Management', '8%', 'CTI integration, third-party telephony, data migration for cases/contacts'],
            ['Service Console', '8%', 'Console navigation, split view, workspace tabs, subtabs, macros, shortcuts, utility bar']
          ]},
          { t: 'h', x: 'Study Plan Framework' },
          { t: 'num', items: [
            'Week 1-2: Review all exam domains and identify knowledge gaps',
            'Week 3-4: Deep dive into Service Cloud Solution Design and Case Management',
            'Week 5-6: Focus on Knowledge Management and Intake Channels',
            'Week 7-8: Study Analytics, Implementation, and Integrations',
            'Week 9-10: Take practice exams and review weak areas',
            'Week 11-12: Final review, practice questions, and exam strategy'
          ]},
          { t: 'callout', kind: 'tip', x: 'Focus 30% of your study time on your weakest domain. If you\'re strong in Case Management but weak in Integrations, allocate more time to Integrations. The exam tests breadth across all domains.' },
          { t: 'code', lang: 'apex', x: '// Study plan tracker: query Service Cloud coverage in a Trailhead\ntrigger StudyPlanTrigger on Task (\n    after insert\n) {\n    List<Task> created = new List<Task>();\n    for (Task t : Trigger.new) {\n        if (t.Subject != null &&\n            t.Subject.contains(\'Exam Ready\')) {\n            created.add(t);\n        }\n    }\n    for (Integer i = 0; i < created.size(); i++) {\n        created[i].Description =\n            \'Week of \' + Date.today().format() +\n            \' \u2014 covering exam domain weights \u2014 \' +\n            \'Case Management 32%, Service Cloud Platform 13%, \' +\n            \'Interaction Channels 11%, Knowledge 10%, \' +\n            \'Analytics 9%, Solution Design 9%, \' +\n            \'Integrations 8%, Console 8%\u2019;\n    }\n}' },
          { t: 'selfcheck', q: 'What is the passing score for the Service Cloud Consultant exam in English?', a: '78% (approximately 47 out of 60 scored questions). The passing score is 78% for English and 67% for Japanese. Unscored pretest questions do not count toward your score.' }
        ]
      },
      {
        title: 'Exam Facts & Strategy',
        mins: 25,
        blocks: [
          { t: 'h', x: 'Key Exam Facts' },
          { t: 'list', items: [
            'The exam is 105 minutes for 60 scored questions (plus up to 5 unscored pretest)',
            'You need approximately 1.75 minutes per question',
            'The exam is scenario-based \u2014 read the full scenario before answering',
            'There is no penalty for guessing \u2014 always answer every question',
            'Some questions may have multiple correct answers (select all that apply)',
            'The exam covers both standard Salesforce features and implementation best practices',
            'You must hold the Platform Administrator certification as a prerequisite'
          ]},
          { t: 'h', x: 'Exam Strategy' },
          { t: 'table', head: ['Strategy', 'Description', 'When to Apply'], rows: [
            ['Read Carefully', 'Read the entire scenario before looking at answers', 'Every question'],
            ['Eliminate Wrong', 'Rule out obviously incorrect options first', 'When unsure'],
            ['Watch for Qualifiers', '"Always", "Never", "Must" are usually wrong', 'When options seem similar'],
            ['Choose "Best" Answer', 'Multiple answers may be correct \u2014 pick the BEST one', 'When all options seem valid'],
            ['Flag & Move On', 'Skip hard questions, come back later', 'When stuck > 2 min'],
            ['Time Check', 'Monitor time per question to stay on pace', 'Every 15 questions']
          ]},
          { t: 'h', x: 'Common Exam Traps' },
          { t: 'list', items: [
            'Confusing "should" (recommended) with "must" (required)',
            'Mixing up Enterprise vs. Unlimited edition features',
            'Forgetting that some features require specific license types',
            'Overlooking the prerequisite of Platform Administrator certification',
            'Not considering sandbox testing before production deployment',
            'Assuming all features are available in all editions'
          ]},
          { t: 'code', lang: 'apex', x: '// Common exam scenario pattern:\n// "A company wants to implement X.\n//  What should the consultant recommend?"\n\n// Approach:\n// 1. Identify the business requirement\n// 2. Consider constraints (budget, timeline, edition)\n// 3. Evaluate standard vs. custom solutions\n// 4. Choose the SIMPLEST solution that meets requirements\n// 5. Verify it aligns with Salesforce best practices\n\n// Example:\n// Q: "A company needs cases automatically assigned\n//     to the right queue based on product type."\n// A: Case Assignment Rules (standard feature)\n// NOT: Custom Apex trigger (over-engineered)' },
          { t: 'callout', kind: 'tip', x: 'When the exam asks "What should the consultant do FIRST?", the answer is almost always "Gather requirements" or "Understand the current state." Never jump to a solution without understanding the problem.' },
          { t: 'selfcheck', q: 'What should you do when you\'re unsure between two answer choices?', a: 'Eliminate obviously wrong answers first, then re-read the scenario for keywords. Look for qualifiers like "always" or "never" \u2014 these are usually incorrect. Choose the answer that is most specific to the scenario and aligns with Salesforce best practices. Never leave a question unanswered.' }
        ]
      },
      {
        title: 'Top Exam Topics & Practice',
        mins: 30,
        blocks: [
          { t: 'h', x: 'High-Frequency Exam Topics' },
          { t: 'table', head: ['Topic', 'Frequency', 'Key Concept'], rows: [
            ['Case Assignment Rules', 'Very High', 'Priority-based routing, queue assignment'],
            ['Entitlement Processes', 'Very High', 'Milestones, versioning, business hours'],
            ['Knowledge Management', 'High', 'Publishing states, data categories, KCS'],
            ['Omni-Channel Routing', 'High', 'Service channels, presence, capacity'],
            ['Einstein Bots', 'Medium-High', 'Dialogs, intents, escalation'],
            ['Report Types', 'High', 'Case reports, SLA compliance, KPI dashboards'],
            ['Record Types', 'Very High', 'Page layouts, picklist values, business processes'],
            ['Experience Cloud', 'Medium', 'Self-service portals, case creation, knowledge']
          ]},
          { t: 'h', x: 'Practice Question 1' },
          { t: 'p', x: 'A company receives 500 cases per day. 70% are password reset requests. The consultant needs to reduce agent workload. What should they recommend?' },
          { t: 'list', items: [
            'A. Hire more agents to handle the volume',
            'B. Implement Einstein Bots to handle password resets automatically',
            'C. Create a macro for agents to handle password resets faster',
            'D. Set up a queue for password reset cases'
          ]},
          { t: 'callout', kind: 'tip', x: 'Answer: B. Einstein Bots can handle simple, repetitive requests like password resets automatically. This deflects cases entirely and reduces agent workload. A macro (C) helps agents but doesn\'t reduce volume. More agents (A) increases cost. A queue (D) doesn\'t solve the volume problem.' },
          { t: 'h', x: 'Practice Question 2' },
          { t: 'p', x: 'A support manager needs to ensure high-priority cases are responded to within 1 hour. What feature should the consultant configure?' },
          { t: 'list', items: [
            'A. Case Assignment Rules with Priority field criteria',
            'B. Entitlement Process with a 1-hour milestone for high-priority cases',
            'C. Escalation Rules that notify the manager after 1 hour',
            'D. A workflow rule that updates the case status after 1 hour'
          ]},
          { t: 'callout', kind: 'tip', x: 'Answer: B. An Entitlement Process with milestones is the standard way to enforce SLA time targets. It tracks response time and triggers actions (escalation, alerts) when milestones are at risk or violated. Assignment rules route cases but don\'t track time.' },
          { t: 'h', x: 'Practice Question 3' },
          { t: 'p', x: 'A company wants agents to search for knowledge articles while working cases. Which feature provides contextual article suggestions?' },
          { t: 'list', items: [
            'A. Data Category filtering on the Knowledge tab',
            'B. Knowledge One widget in the Service Console',
            'C. A custom Visualforce page for article search',
            'D. Einstein Article Recommendations in the Case feed'
          ]},
          { t: 'callout', kind: 'tip', x: 'Answer: B (or D depending on the exact wording). Knowledge One widget provides AI-powered article suggestions based on the current case context. It\'s the standard, recommended approach for contextual knowledge delivery in the console.' },
          { t: 'code', lang: 'apex', x: '// Practice: Case routing question review\n// Q: "A company needs to automatically assign cases\n//     to queues based on case type AND priority."\n\n// Recommended: Case Assignment Rules with multiple entries\nSELECT Id, Name, Active, SortOrder,\n       BypassTriggers\nFROM CaseAssignmentRule\nWHERE Active = true\nORDER BY SortOrder ASC\n\n// Q: "The consultant must ensure high-priority cases\n//     are resolved within 8 business hours."\n\n// Recommended: Entitlement Process milestone\nSELECT Id, Name, SObjectType,\n       MilestoneType\nFROM EntitlementProcess\nWHERE SObjectType = \'Case\'\nAND Status = \'Active\'\n\n// Exam mindset: choose SMALLEST standard feature set\n// that fully satisfies the requirement.' },
          { t: 'selfcheck', q: 'What is the most common mistake candidates make on the Service Cloud Consultant exam?', a: 'Overthinking answers and choosing custom/complex solutions when a standard feature would suffice. The exam favors standard Salesforce features over custom development. If a standard feature meets the requirement, it\'s almost always the right answer.' }
        ]
      }
    ],
    quiz: {
      title: 'Certification Prep Mock Exam',
      mins: 15,
      questions: [
        { q: 'How many scored questions are on the Service Cloud Consultant exam?', opts: ['50', '60', '70', '100'], a: 1, why: 'The exam has 60 scored questions plus up to 5 unscored pretest questions. The unscored questions are used for future exam development and do not count toward your score.' },
        { q: 'What is the passing score for the exam in English?', opts: ['67%', '72%', '78%', '85%'], a: 2, why: 'The passing score is 78% for English-language exams (approximately 47 out of 60 scored questions) and 67% for Japanese-language exams.' },
        { q: 'Which certification is a prerequisite for the Service Cloud Consultant exam?', opts: ['Sales Cloud Consultant', 'Platform Administrator', 'Platform Developer I', 'Advanced Administrator'], a: 1, why: 'The Platform Administrator certification is the prerequisite for the Service Cloud Consultant exam. You must pass it before attempting the Consultant exam.' },
        { q: 'What should a consultant do FIRST when asked to implement a new service feature?', opts: ['Start building in a sandbox', 'Gather requirements and understand the current state', 'Purchase additional licenses', 'Create a project timeline'], a: 1, why: 'Always gather requirements and understand the current state before implementing anything. This ensures the solution addresses the actual business need and avoids rework.' },
        { q: 'Which domain has the highest weighting on the exam?', opts: ['Service Cloud Platform (13%)', 'Interaction Channels (11%)', 'Case Management (32%)', 'Knowledge Management (10%)'], a: 2, why: 'Case Management has the single highest weighting at 32% of the exam. It covers the case lifecycle, queues, assignment and escalation rules, case teams, and email-to-case and web-to-case setup.' }
      ]
    }
  },
  {
    id: 'exercises',
    n: 14,
    title: 'Practical Exercises & Mini Projects',
    icon: '14',
    color: '#059669',
    tagline: 'Apply your knowledge with hands-on exercises and mini projects.',
    guide: '14-Practical-Exercises-and-Mini-Projects.md',
    art: [
      { label: 'Exercise Workbook', href: 'scripts/apex/case-lifecycle.apex' },
      { label: 'Solution Checklist', href: 'scripts/apex/sla-compliance.apex' }
    ],
    objectives: [
      'Configure case routing in a sandbox environment',
      'Build entitlement processes and milestone actions',
      'Set up knowledge articles and data categories',
      'Design and implement end-to-end service scenarios',
      'Practice troubleshooting common configuration issues',
      'Demonstrate mastery through mini projects and capstone'
    ],
    lessons: [
      {
        title: 'Case Routing Exercises',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Exercise 14.1: Case Assignment Rules' },
          { t: 'ex', id: '14.1', title: 'Configure Case Assignment Rules', obj: 'Configure case fields, record types, and page layouts', stars: 3, code: {
            setup: [
              'Create a new Developer Sandbox',
              'Enable Case object with standard fields',
              'Create two queues: Tier1-Support and Tier2-Support',
              'Create picklist values for Priority: Low, Medium, High, Critical'
            ],
            apex: '// Test assignment by creating cases\nINSERT new Case(\n    Subject = \'Test Assignment Rule\',\n    Priority = \'High\',\n    Origin = \'Email\',\n    Description = \'High priority test case\'\n);\n\n// Verify assignment\nCase c = [SELECT Id, OwnerId, Owner.Name\n           FROM Case\n           WHERE Subject = \'Test Assignment Rule\'\n           LIMIT 1];\nSystem.assert(\n    c.OwnerId != UserInfo.getUserId(),\n    \'Case should be assigned to Tier1 queue\'\n);'
          }, steps: [
            'Create a Case Assignment Rule with sort order 1',
            'Add rule entry: Priority = High â†’ assign to Tier2-Support queue',
            'Add rule entry: Priority = Medium â†’ assign to Tier1-Support queue',
            'Add rule entry: All other priorities â†’ assign to Tier1-Support queue',
            'Activate the rule',
            'Create test cases with different priorities',
            'Verify each case is assigned to the correct queue'
          ], verify: 'Create a case with Priority=High and verify it\'s owned by Tier2-Support queue. Create a case with Priority=Medium and verify it\'s owned by Tier1-Support queue.' },
          { t: 'selfcheck', q: 'Why do we create test cases with different priorities?', a: 'To verify that each assignment rule entry fires correctly. Testing with different priorities ensures that the priority-based routing logic works as expected and each case goes to the right queue.' },
          { t: 'h', x: 'Exercise 14.2: Case Record Types & Page Layouts' },
          { t: 'ex', id: '14.2', title: 'Configure Record Types and Layouts', obj: 'Configure case fields, record types, and page layouts', stars: 3, code: {
            setup: [
              'Use the sandbox from Exercise 14.1',
              'Define two business processes: "Case Support Process" and "Case Escalation Process"'
            ],
            apex: '// Verify record types are correctly configured\nSELECT Id, CaseNumber, RecordType.Name,\n       Status, Priority, Origin\nFROM Case\nWHERE RecordType.DeveloperName = \'Technical_Support\'\n\n// Verify business process values per record type\nSELECT Id, Name, IsActive, TableEnumOrId,\n       Description\nFROM BusinessProcess\nWHERE EntityDefinitionId = \'Case\'\nAND Name LIKE \'%Support%\'\n\n// Query contacts to populate test accounts\nSELECT Id, Name, Email\nFROM Contact\nWHERE AccountId != NULL\nLIMIT 5'
          }, steps: [
            'Create a Record Type "Technical Support" using the Case Support Process',
            'Create a Record Type "Escalated Cases" using the Case Escalation Process',
            'Assign available Status and Priority picklist values to each record type',
            'Create a page layout for Technical Support cases with Subject, Description, and Entitlement required',
            'Create a different page layout for Escalated Cases with an Escalation Notes field section',
            'Assign each layout to the appropriate profiles',
            'Verify that new cases default to the Technical Support record type'
          ], verify: 'Create a Case and verify the default record type is "Technical Support". Switch to the Escalated Cases record type and verify the page layout changes with the escalation notes section.' },
          { t: 'h', x: 'Exercise 14.3: Escalation Paths & Queues' },
          { t: 'ex', id: '14.3', title: 'Configure Escalation Rules and Queue Routing', obj: 'Design escalation paths and entitlement-based routing', stars: 3, code: {
            setup: [
              'Use the two queues from Exercise 14.1',
              'Create a third queue: Escalation-Queue'
            ],
            apex: '// Verify escalation rule configuration\nSELECT Id, Name, SobjectType, Active\nFROM EscalationRule\nWHERE SobjectType = \'Case\'\nAND Active = true\n\n// Verify queue memberships\nSELECT Id, GroupId, UserOrGroupId, Group.Name\nFROM GroupMember\nWHERE Group.DeveloperName LIKE \'Escalation\'\n\n// Test the escalation by simulating a breach\nCase escalatedCase = [\n    SELECT Id, OwnerId, IsEscalated\n    FROM Case\n    WHERE DeveloperName = \'14.3 Test Escalation\'\n    LIMIT 1\n];\nSystem.assert(escalatedCase.OwnerId != null,\n    \'Case should be reassigned to Escalation-Queue\');'
          }, steps: [
            'Create an Escalation Rule entry: Priority = Critical â†’ reassign to Escalation-Queue',
            'Create a second entry: Case open for more than 48 hours â†’ reassign to Escalation-Queue',
            'Add an Escalation Action email alert to the Support Manager for Critical cases',
            'Activate the escalation rule',
            'Add two agents as members of Escalation-Queue',
            'Create a Critical case and verify it is reassigned to the Escalation-Queue',
            'Verify the manager receives the escalation email alert'
          ], verify: 'Create a Case with Priority=Critical. Wait for the escalation rule to fire and verify the case is reassigned to Escalation-Queue and the manager email alert is logged.' }
        ]
      },
      {
        title: 'Entitlement & SLA Exercises',
        mins: 35,
        blocks: [
          { t: 'h', x: 'Exercise 14.4: Entitlement Process Setup' },
          { t: 'ex', id: '14.4', title: 'Build an Entitlement Process with Milestones', obj: 'Configure Entitlement Processes with milestones', stars: 4, code: {
            setup: [
              'Create a Business Hours record for "Standard Hours" (Mon-Fri, 9am-6pm)',
              'Create an Entitlement Process named "Standard SLA"',
              'Add two milestones: First Response (4 hours) and Resolution (24 hours)'
            ],
            apex: '// Verify milestone creation\nSELECT Id, Name, EntitlementProcessId,\n       DurationMinutes, DurationDays,\n       StartTimeField\nFROM Milestone\nWHERE EntitlementProcessId = :processId\nORDER BY SequenceNumber\n\n// Verify milestone actions\nSELECT Id, Name, MilestoneId, Type,\n       CriteriaName, ActionType\nFROM MilestoneAction\nWHERE MilestoneId IN (\n    SELECT Id FROM Milestone\n    WHERE EntitlementProcessId = :processId\n)'
          }, steps: [
            'Create Business Hours (Mon-Fri 9am-6pm, timezone: EST)',
            'Create Entitlement Process "Standard SLA" for Case object',
            'Add Milestone 1: "First Response" \u2014 4 business hours',
            'Add Milestone 2: "Resolution" \u2014 24 business hours',
            'Configure Entry Action: Set Case.Status = "Working"',
            'Configure Violation Action (Milestone 1): Send email alert to manager',
            'Configure Violation Action (Milestone 2): Escalate to Tier2 queue',
            'Activate the Entitlement Process',
            'Create an Entitlement linked to a test Account',
            'Create a Case and link it to the Entitlement',
            'Verify milestones appear on the Case'
          ], verify: 'Create a Case linked to the Entitlement. Verify that two milestones appear on the Case record. Update the Case status and verify milestone progress tracks correctly.' },
          { t: 'h', x: 'Exercise 14.5: Escalation Rules' },
          { t: 'ex', id: '14.5', title: 'Configure Time-Based Escalation', obj: 'Implement escalation paths with time-based triggers', stars: 3, code: {
            setup: [
              'Use the Entitlement Process from Exercise 14.4',
              'Create an escalation queue: Escalation-Queue'
            ],
            apex: '// Test escalation by checking case owner\n// after milestone violation\nSELECT Id, CaseNumber, OwnerId, Owner.Name,\n       IsEscalated, MilestoneViolated__c,\n       MilestoneDate\nFROM Case\nWHERE EntitlementId != NULL\nAND MilestoneViolated__c = true\nAND IsEscalated = true'
          }, steps: [
            'Configure Escalation Rule for "First Response" milestone',
            'Set escalation criteria: Milestone approaching (30 min before breach)',
            'Set escalation action: Reassign to Escalation-Queue',
            'Set violation action: Send email alert to Support Manager',
            'Test by creating a case and waiting for milestone approach',
            'Verify the case is reassigned before breach',
            'Verify email alert is sent on violation'
          ], verify: 'Create a test case and monitor milestone progress. Verify that the case is reassigned to Escalation-Queue when the first response milestone approaches.' },
          { t: 'selfcheck', q: 'What happens if an agent resolves a case before the milestone violation?', a: 'The milestone Success Action fires instead of the Violation Action. The case is marked as meeting the SLA, and any success-specific actions (like sending a thank-you email) are executed.' },
          { t: 'h', x: 'Exercise 14.6: SLA Compliance Report' },
          { t: 'ex', id: '14.6', title: 'Build an SLA Compliance Dashboard', obj: 'Build SLA compliance reports and dashboards', stars: 3, code: {
            setup: [
              'Use the Entitlement Process and milestones from Exercise 14.4',
              'Create several test cases with different milestone outcomes (met and violated)'
            ],
            apex: '// Verify SLA compliance calculations\nSELECT Entitlement.Name,\n       COUNT(Id) TotalCases,\n       COUNT(CASE WHEN MilestoneViolated__c = false\n             THEN 1 END) MetSLA,\n       COUNT(CASE WHEN MilestoneViolated__c = true\n             THEN 1 END) ViolatedSLA,\n       ROUND(\n           COUNT(CASE WHEN MilestoneViolated__c = false\n                 THEN 1 END) * 100.0 / COUNT(Id), 1\n       ) CompliancePercent\nFROM Case\nWHERE EntitlementId != NULL\nGROUP BY Entitlement.Name'
          }, steps: [
            'Create a report using the "Cases with Entitlements" report type',
            'Add fields: Case Number, Entitlement Name, Milestone Name, Milestone Status, Milestone Violated',
            'Add a formula field for SLA Compliance % (met / total * 100)',
            'Group by Entitlement Name and Milestone Status',
            'Filter for cases with ClosedDate in the current month',
            'Create a dashboard with a gauge chart for overall compliance',
            'Add a bar chart breaking down compliance by entitlement type',
            'Schedule the dashboard for weekly refresh and share with management'
          ], verify: 'Open the dashboard and verify the compliance gauge matches your manually calculated percentage. Verify the breakdown by entitlement type is accurate.' }
        ]
      },
      {
        title: 'Knowledge & Console Exercises',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Exercise 14.7: Knowledge Article Creation' },
          { t: 'ex', id: '14.7', title: 'Create and Publish Knowledge Articles', obj: 'Configure Knowledge article types and fields', stars: 3, code: {
            setup: [
              'Enable Knowledge in Setup',
              'Create an Article Type: "Troubleshooting" with fields: Symptom, Cause, Resolution',
              'Create Data Category Group: "Product" with categories: Billing, Technical, Account'
            ],
            apex: '// Query published articles with categories\nSELECT Id, Title, Summary, ArticleNumber,\n       PublishStatus, Language,\n       LastPublishedDate\nFROM Knowledge__kav\nWHERE PublishStatus = \'Online\'\nAND Language = \'en_US\'\nORDER BY LastPublishedDate DESC\n\n// Check article category assignments\nSELECT Id, ParentId, DataCategoryGroupName,\n       DataCategoryName\nFROM DataCategorySelection\nWHERE ParentId IN (\n    SELECT Id FROM Knowledge__kav\n    WHERE PublishStatus = \'Online\'\n)'
          }, steps: [
            'Create an Article Type "Troubleshooting" with custom fields',
            'Create Data Category Group "Product" with child categories',
            'Create a troubleshooting article with Symptom, Cause, Resolution',
            'Assign the article to the "Billing" data category',
            'Save as Draft \u2014 verify it\'s not visible to agents',
            'Publish the article \u2014 verify it\'s now searchable',
            'Search for the article from the Knowledge tab'
          ], verify: 'Create a draft article and verify it\'s not visible in search. Publish it and verify it appears in the Knowledge tab search results.' },
          { t: 'h', x: 'Exercise 14.8: Data Categories & Search' },
          { t: 'ex', id: '14.8', title: 'Configure Data Categories and Knowledge Search', obj: 'Design a data category taxonomy and optimize search', stars: 3, code: {
            setup: [
              'Use the Data Category Group from Exercise 14.7',
              'Create a second Data Category Group: "Issue Type" with: Bug, How-To, FAQ, Policy'
            ],
            apex: '// Verify data categories are correctly assigned\nSELECT Id, ParentId, Parent.Title,\n       DataCategoryGroupName,\n       DataCategoryName\nFROM DataCategorySelection\nWHERE ParentId IN (\n    SELECT Id FROM Knowledge__kav\n    WHERE PublishStatus = \'Online\'\n)\nORDER BY DataCategoryGroupName, DataCategoryName\n\n// Test knowledge search\nList<List<SObject>> results = [\n    FIND \'login error\'\n    IN ALL FIELDS\n    RETURNING Knowledge__kav (\n        Id, Title, Summary, ArticleNumber\n        WHERE PublishStatus = \'Online\'\n    )\n    LIMIT 10\n];'
          }, steps: [
            'Create Data Category Group "Issue Type" with child categories: Bug, How-To, FAQ, Policy',
            'Assign the existing Troubleshooting article to "Technical" (Product) and "Bug" (Issue Type)',
            'Create two more articles: a How-To guide and an FAQ article',
            'Assign appropriate data categories to each new article',
            'Navigate to the Knowledge tab and filter by "Product = Technical"',
            'Verify only the Technical article appears in filtered results',
            'Test the search function by searching for keywords from the articles',
            'Verify all articles are returned when no category filter is applied'
          ], verify: 'Filter the Knowledge tab by "Product = Billing" and verify only the billing article appears. Remove the filter and verify all articles are shown.' },
          { t: 'h', x: 'Exercise 14.9: Console Configuration' },
          { t: 'ex', id: '14.9', title: 'Configure Service Console Layout', obj: 'Configure console apps and workspace tabs', stars: 3, code: {
            setup: [
              'Create a new Lightning App with Console navigation type',
              'Add navigation items: Case, Contact, Account, Knowledge'
            ],
            apex: '// Verify console app configuration\n// Check that the app has correct navigation items\n// and console-enabled tabs\n\n// Test subtab behavior:\n// 1. Open a Case in the console',
          }, steps: [
            'Create a Lightning App named "Service Console"',
            'Set navigation style to "Console"',
            'Add Case, Contact, Account, and Knowledge as navigation items',
            'Configure Case to open as a workspace tab',
            'Configure Contact and Account to open as subtabs',
            'Add the Knowledge tab to the navigation',
            'Configure the utility bar with History and Notes',
            'Test opening a Case and clicking through to related Contact',
            'Verify Contact opens as a subtab under the Case'
          ], verify: 'Open the Service Console app. Click on a Case \u2014 it should open as a workspace tab. Click on the Contact \u2014 it should open as a subtab under the Case.' },
          { t: 'selfcheck', q: 'What is the difference between a workspace tab and a subtab?', a: 'A workspace tab is a primary tab that opens a main record (like a Case). A subtab opens beneath a workspace tab and shows a related record (like a Contact linked to the Case). Subtabs maintain context by staying grouped under their parent.' }
        ]
      },
      {
        title: 'Full Pipeline Mini Projects',
        mins: 45,
        blocks: [
          { t: 'h', x: 'Mini Project 1: Complete Service Pipeline' },
          { t: 'proj', id: 'MP1', title: 'End-to-End Case Management System', obj: 'Design and implement a complete service solution', stars: 5, reqs: [
            'Create a Record Type "Technical Support" with custom picklist values',
            'Configure a status lifecycle: New â†’ Assigned â†’ Working â†’ Pending â†’ Resolved â†’ Closed',
            'Set up Case Assignment Rules routing Technical Support cases to the Technical queue',
            'Create an Entitlement Process with First Response (2 hours) and Resolution (8 hours) milestones',
            'Configure milestone violation actions: email alert on first response breach, escalation on resolution breach',
            'Set up a Knowledge Article type "Troubleshooting" with Symptom, Cause, Resolution fields',
            'Create at least 3 test knowledge articles and publish them',
            'Configure the Service Console with Case workspace tab and Contact subtab',
            'Add the Knowledge tab to the console navigation',
            'Create a report showing SLA compliance by entitlement type'
          ], success: 'A fully functional case management system where cases are automatically routed, SLA milestones are tracked, agents can access knowledge articles from the console, and management can view SLA compliance reports.' },
          { t: 'h', x: 'Mini Project 2: Multi-Channel Service Setup' },
          { t: 'proj', id: 'MP2', title: 'Omnichannel Routing & Bot Integration', obj: 'Configure multi-channel service delivery', stars: 5, reqs: [
            'Configure Omni-Channel with a Service Channel for Cases',
            'Set up two presence statuses: "Available" and "On Break"',
            'Create a Routing Configuration for queue-based routing',
            'Add cases to a support queue and configure agent presence',
            'Set up an Einstein Bot with a "Check Case Status" dialog',
            'Configure the bot to query case records via Apex action',
            'Set up bot-to-agent escalation when the customer types "agent"',
            'Create a Pre-Chat form collecting Name, Email, and Issue Type',
            'Configure Omni Supervisor to monitor queue depth and agent status',
            'Test the full flow: bot interaction â†’ escalation â†’ agent handoff'
          ], success: 'A working multi-channel setup where cases route through Omni-Channel, customers can interact with an Einstein Bot, and supervisors can monitor real-time activity through Omni Supervisor.' },
          { t: 'h', x: 'Capstone Project' },
          { t: 'proj', id: 'CAP', title: 'Salesforce Service Cloud Implementation Capstone', obj: 'Demonstrate mastery of all Service Cloud concepts', stars: 5, reqs: [
            'Design the complete data model (Account, Contact, Case, Entitlement, Knowledge)',
            'Configure Record Types, Page Layouts, and Business Processes for two case types: Billing Support and Technical Support',
            'Implement entitlement processes with different SLA tiers (Premium: 1hr response / 4hr resolution, Standard: 4hr response / 24hr resolution)',
            'Set up Case Assignment Rules routing by case type and priority',
            'Configure Omni-Channel with skills-based routing (Billing skill, Technical skill)',
            'Build an Einstein Bot handling order status checks and password resets',
            'Create a Knowledge Base with articles, data categories, and KCS workflow',
            'Configure the Service Console with optimized workspace tabs, subtabs, and utility bar',
            'Build a dashboard with SLA Compliance, CSAT, FCR, and Backlog metrics',
            'Create Experience Cloud portal for customer self-service',
            'Document the implementation in a deployment guide',
            'Test all flows in a sandbox and verify end-to-end functionality'
          ], success: 'A complete Service Cloud implementation covering all major features: case management, entitlements, omnichannel routing, AI bots, knowledge management, analytics, and self-service portal. The implementation should be demo-ready and documented.' },
          { t: 'selfcheck', q: 'Why is the capstone designed to cover all modules?', a: 'The capstone simulates a real-world Service Cloud implementation. In practice, consultants must integrate multiple features (case management, knowledge, routing, bots, analytics) into a cohesive solution. The capstone tests your ability to design and implement a complete service platform.' }
        ]
      }
    ],
    quiz: {
      title: 'Practical Exercises Quiz',
      mins: 10,
      questions: [
        { q: 'In Exercise 14.1, what should you do after creating rule entries but before testing?', opts: ['Delete the queues', 'Activate the assignment rule', 'Create more picklist values', 'Disable case feed'], a: 1, why: 'Assignment rules must be activated before they take effect. Without activation, cases will not be routed to the configured queues.' },
        { q: 'What is the correct order when building an Entitlement Process?', opts: ['Milestones first, then Business Hours, then Entitlement', 'Business Hours first, then milestones, then activation', 'Activation first, then milestones', 'Entitlement first, then Business Hours'], a: 1, why: 'You create Business Hours first so they exist as reference data, then configure milestones with those hours, then activate the process only after all milestones and actions are configured.' },
        { q: 'Why must you verify a draft Knowledge article is NOT visible before publishing?', opts: ['To save storage space', 'To confirm publishing workflow controls visibility', 'To test search speed', 'To check article formatting'], a: 1, why: 'Verifying the draft is invisible confirms the publishing lifecycle works correctly. Draft articles should only be visible to authors and managers; visibility is granted when the article is published.' }
      ]
    }
  },
  {
    id: 'answers',
    n: 15,
    title: 'Answers & Results',
    icon: '15',
    color: '#7C3AED',
    tagline: 'Detailed solutions for all exercises and mini projects.',
    guide: '15-Answers-and-Results.md',
    art: [
      { label: 'Solution Reference', href: 'scripts/apex/knowledge-recommendations.apex' },
      { label: 'Grading Rubric', href: 'scripts/soql/case-sla.soql' }
    ],
    objectives: [
      'Review step-by-step solutions for all exercises',
      'Understand the reasoning behind each solution',
      'Compare your implementation with the reference solution',
      'Identify areas for improvement',
      'Learn best practices demonstrated in solutions',
      'Prepare for similar real-world implementation scenarios'
    ],
    lessons: [
      {
        title: 'Exercise Solutions Walkthrough',
        mins: 40,
        blocks: [
          { t: 'h', x: 'Exercise 14.1: Case Assignment Rules Solution' },
          { t: 'p', x: 'The assignment rule should be configured with three entries in priority order. Each entry evaluates the Priority field and routes to the appropriate queue.' },
          { t: 'num', items: [
            'Rule Entry 1 (Sort Order 1): Criteria: Priority equals "High" â†’ Assign to Tier2-Support',
            'Rule Entry 2 (Sort Order 2): Criteria: Priority equals "Medium" â†’ Assign to Tier1-Support',
            'Rule Entry 3 (Sort Order 3): Criteria: All other cases â†’ Assign to Tier1-Support',
            'Activate the rule after configuration',
            'Test with cases having different Priority values',
            'Verify each case owner matches the expected queue'
          ]},
          { t: 'code', lang: 'apex', x: '// Verification query for Exercise 14.1\nSELECT CaseNumber, Priority, Owner.Name,\n       CreatedDate\nFROM Case\nWHERE Subject LIKE \'Test Assignment%\'\nORDER BY CreatedDate DESC\n\n// Expected Results:\n// Priority=High â†’ Owner = Tier2-Support\n// Priority=Medium â†’ Owner = Tier1-Support\n// Priority=Low â†’ Owner = Tier1-Support' },
          { t: 'h', x: 'Exercise 14.4: Entitlement Process Solution' },
          { t: 'p', x: 'The entitlement process requires two milestones configured with business hours. The key is setting the correct StartTimeField for each milestone.' },
          { t: 'table', head: ['Component', 'Configuration', 'Value'], rows: [
            ['Business Hours', 'Standard Hours', 'Mon-Fri 9am-6pm EST'],
            ['Entitlement Process', 'Standard SLA', 'SObject: Case'],
            ['Milestone 1', 'First Response', '4 business hours, Start: CreatedDate'],
            ['Milestone 2', 'Resolution', '24 business hours, Start: CreatedDate'],
            ['Entry Action', 'Set Status', 'Case.Status = "Working"'],
            ['Violation Action 1', 'Email Alert', 'Send to Manager'],
            ['Violation Action 2', 'Escalation', 'Reassign to Tier2 queue']
          ]},
          { t: 'code', lang: 'apex', x: '// Verification query for Exercise 14.4\nSELECT CaseNumber, Status,\n       Entitlement.Name,\n       MilestoneStatus,\n       MilestoneViolated__c,\n       MilestoneDate\nFROM Case\nWHERE EntitlementId != NULL\nORDER BY CreatedDate DESC\n\n// Verify milestones exist:\nSELECT Id, Name, DurationMinutes,\n       StartTimeField, SequenceNumber\nFROM Milestone\nWHERE EntitlementProcessId = :processId' },
          { t: 'h', x: 'Exercise 14.7: Knowledge Article Solution' },
          { t: 'p', x: 'The key steps for creating a publishable knowledge article are: create the article type with custom fields, write the content, assign data categories, and publish through the workflow.' },
          { t: 'num', items: [
            'Article Type "Troubleshooting" created with Symptom, Cause, Resolution fields',
            'Data Category Group "Product" created with Billing, Technical, Account categories',
            'Article content: Symptom="Login fails with error 403", Cause="Session expired", Resolution="Clear browser cache and re-authenticate"',
            'Article assigned to "Technical" data category',
            'Published from Draft â†’ Published state',
            'Verified visible in Knowledge tab search'
          ]},
          { t: 'callout', kind: 'tip', x: 'Common mistakes in exercises: forgetting to activate the assignment rule, not linking the Entitlement to the Account, or not publishing the Knowledge article. Always verify each step before moving to the next.' },
          { t: 'selfcheck', q: 'What is the most important verification step in any Service Cloud configuration?', a: 'End-to-end testing with realistic data. Create test records that match the production scenario and verify the entire flow works as expected. This includes checking record ownership, field values, related records, and any automated actions that should fire.' }
        ]
      },
      {
        title: 'Mini Project Solutions',
        mins: 40,
        blocks: [
          { t: 'h', x: 'MP1: End-to-End Case Management Solution' },
          { t: 'p', x: 'The MP1 solution integrates case management, entitlements, knowledge, and console configuration into a complete service pipeline. The key is proper sequencing: data model first, then automation, then user interface.' },
          { t: 'num', items: [
            'Record Type "Technical Support" created with custom Status picklist values',
            'Status lifecycle: New â†’ Assigned â†’ Working â†’ Pending â†’ Resolved â†’ Closed',
            'Assignment Rules: Technical Support cases â†’ Technical queue',
            'Entitlement Process: First Response (2hr) + Resolution (8hr)',
            'Milestone Violation Actions: Email alert + Escalation queue reassignment',
            'Knowledge Article type "Troubleshooting" with 3 published articles',
            'Service Console: Case workspace tab + Contact subtab + Knowledge tab',
            'SLA Compliance report: Cases grouped by Entitlement with violation counts'
          ]},
          { t: 'code', lang: 'apex', x: '// MP1: Verification queries\n\n// 1. Verify record type and assignment\nSELECT CaseNumber, RecordType.Name, Owner.Name,\n       Status, Priority\nFROM Case\nWHERE RecordType.DeveloperName = \'Technical_Support\'\n\n// 2. Verify entitlement and milestones\nSELECT CaseNumber, Entitlement.Name,\n       MilestoneViolated__c, MilestoneDate\nFROM Case\nWHERE EntitlementId != NULL\n\n// 3. Verify knowledge articles\nSELECT Title, PublishStatus, ArticleNumber\nFROM Knowledge__kav\nWHERE PublishStatus = \'Online\'\n\n// 4. Verify report accuracy\nSELECT Entitlement.Name,\n       COUNT(Id) TotalCases,\n       COUNT(CASE WHEN MilestoneViolated__c = true\n             THEN 1 END) Violations\nFROM Case\nWHERE EntitlementId != NULL\nGROUP BY Entitlement.Name' },
          { t: 'h', x: 'MP2: Omnichannel & Bot Solution' },
          { t: 'p', x: 'MP2 focuses on multi-channel service delivery. The solution must demonstrate Omni-Channel routing, Einstein Bot integration, and supervisor monitoring. The key challenge is testing the full handoff flow from bot to agent.' },
          { t: 'table', head: ['Component', 'Configuration', 'Verification'], rows: [
            ['Service Channel', 'Case_Channel mapped to Case', 'Cases appear in Omni-Channel queue'],
            ['Presence Statuses', 'Available, On Break', 'Agents can change status'],
            ['Routing Config', 'Queue-based, Most Available', 'Cases route to available agents'],
            ['Einstein Bot', 'Check Status dialog + Apex action', 'Bot returns case status info'],
            ['Bot Escalation', 'Transfer to queue on "agent"', 'Agent receives chat with history'],
            ['Pre-Chat Form', 'Name, Email, Issue Type fields', 'Case created with pre-chat data'],
            ['Omni Supervisor', 'Agent panel + Queue panel', 'Real-time monitoring visible']
          ]},
          { t: 'callout', kind: 'tip', x: 'For the MP2 bot escalation test: have one user act as the customer interacting with the bot, and another as the agent receiving the escalated chat. Verify the agent sees the full conversation history.' },
          { t: 'h', x: 'Capstone Solution Overview' },
          { t: 'p', x: 'The capstone solution brings together all modules. The implementation should demonstrate a realistic Service Cloud deployment that a company could actually use. Key success criteria include proper data modeling, effective automation, and meaningful analytics.' },
          { t: 'list', items: [
            'Data Model: Account-Contact-Case-Entitlement-Knowledge relationships properly configured',
            'Record Types: Billing Support and Technical Support with different processes',
            'Entitlements: Premium (1hr/4hr) and Standard (4hr/24hr) SLA tiers',
            'Assignment Rules: Routing by case type, priority, and customer tier',
            'Omni-Channel: Skills-based routing with Billing and Technical skills',
            'Einstein Bot: Order status and password reset dialogs with escalation',
            'Knowledge: Articles with data categories and KCS workflow',
            'Console: Optimized layout with workspace tabs, subtabs, utility bar',
            'Analytics: Dashboard with SLA, CSAT, FCR, and Backlog metrics',
            'Self-Service: Experience Cloud portal for customer case creation'
          ]},
          { t: 'selfcheck', q: 'What is the most critical success factor for the capstone project?', a: 'End-to-end integration. Each component (case management, entitlements, routing, bots, knowledge, analytics) must work together as a cohesive system. The value is in how the pieces connect, not just how each individual feature is configured.' }
        ]
      }
    ],
    quiz: null
  },
  {
    id: 'use-cases',
    n: 16,
    title: 'Real-World Use Cases',
    icon: '16',
    color: '#0891B2',
    tagline: 'Apply Service Cloud knowledge to real-world business scenarios.',
    guide: '16-Real-World-Use-Cases.md',
    art: [
      { label: 'Use Case Matrix', href: 'force-app/main/default/approvalProcesses/Case.Escalated_Case_Approval.approvalProcess-meta.xml' },
      { label: 'Solution Architecture', href: 'force-app/main/default/assignmentRules/Case.assignmentRules-meta.xml' }
    ],
    objectives: [
      'Analyze business requirements for a global support center',
      'Design a lifecycle enterprise solution with complex entitlements',
      'Architect an AI-powered helpdesk with automation and bots',
      'Apply Service Cloud best practices to real scenarios',
      'Consider trade-offs between standard features and custom development',
      'Evaluate implementation approaches for different business sizes'
    ],
    lessons: [
      {
        title: 'UC1: Global Support Center',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Scenario: GlobalTech Solutions' },
          { t: 'p', x: 'GlobalTech Solutions is a mid-size software company with 200 support agents across 3 regions (Americas, EMEA, APAC). They receive 5,000 cases per day through email, phone, and chat. Their current system lacks SLA tracking, knowledge management, and real-time monitoring. They need a unified Service Cloud implementation.' },
          { t: 'table', head: ['Requirement', 'Business Need', 'Service Cloud Feature'], rows: [
            ['Multi-region support', 'Agents in 3 time zones', 'Business Hours per region, Timezone-aware SLA'],
            ['Multi-channel intake', 'Email, phone, chat', 'Email-to-Case, Open CTI, Live Chat'],
            ['SLA enforcement', 'Response/resolution targets', 'Entitlement Processes, Milestones'],
            ['Knowledge base', 'Agent and customer KB', 'Knowledge articles, Data Categories'],
            ['Real-time monitoring', 'Supervisor visibility', 'Omni Supervisor, Dashboards'],
            ['Reporting', 'KPI tracking', 'Reports, Dashboards, Historical Trending']
          ]},
          { t: 'h', x: 'Solution Design Considerations' },
          { t: 'list', items: [
            'Create separate Business Hours for each region (Americas, EMEA, APAC)',
            'Use Entitlement Types to differentiate SLA tiers by customer contract',
            'Configure Omni-Channel with region-specific queues and skills',
            'Build Knowledge articles in multiple languages for global agents',
            'Design a unified dashboard showing metrics across all regions',
            'Consider data residency requirements for different regions'
          ]},
          { t: 'selfcheck', q: 'What is the biggest challenge in a multi-region Service Cloud implementation?', a: 'Time zone management and SLA calculations across regions. Business Hours must be configured per region, and entitlement processes must account for when agents in different regions are available. This affects milestone calculations and escalation timing.' }
        ]
      },
      {
        title: 'UC2: Lifecycle Enterprise',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Scenario: MedDevice Corp' },
          { t: 'p', x: 'MedDevice Corp manufactures medical devices with complex service contracts. Each device has a warranty period, and extended service contracts can be purchased. They need to track device installations, maintenance schedules, warranty claims, and regulatory compliance. Support tiers range from basic phone support to on-site technician dispatch.' },
          { t: 'table', head: ['Requirement', 'Business Need', 'Service Cloud Feature'], rows: [
            ['Device tracking', 'Serial number, install date', 'Custom Object: Device__c'],
            ['Warranty management', 'Auto-expire warranty', 'Entitlement Processes, Milestones'],
            ['Service contracts', 'Extended coverage plans', 'ServiceContract, ContractLineItem'],
            ['Maintenance scheduling', 'Preventive maintenance', 'Scheduled Flows, Task creation'],
            ['Regulatory compliance', 'Audit trail, documentation', 'Case Comments, Feed Tracking'],
            ['Technician dispatch', 'Field service integration', 'Field Service Lightning']
          ]},
          { t: 'h', x: 'Architecture Approach' },
          { t: 'p', x: 'The solution requires a custom data model extending standard Case functionality. Device tracking, warranty periods, and maintenance schedules need custom objects linked to Cases and Accounts. Service Contracts define coverage terms, and Entitlements enforce SLA compliance.' },
          { t: 'code', lang: 'apex', x: '// Custom data model for MedDevice scenario\n// Device__c linked to Account and Case\nSELECT Id, Name, SerialNumber__c,\n       InstallDate__c, WarrantyExpiry__c,\n       Account.Name,\n       (SELECT Id, CaseNumber, Subject, Status,\n               CreatedDate, ClosedDate\n        FROM Cases__r\n        ORDER BY CreatedDate DESC)\nFROM Device__c\nWHERE AccountId = :accountId\n\n// Maintenance schedule via Scheduled Flow\n// Runs monthly to check devices due for maintenance\nSELECT Id, Name, NextMaintenanceDate__c,\n       MaintenanceInterval__c,\n       Account.Name, Account.Phone\nFROM Device__c\nWHERE NextMaintenanceDate__c <= NEXT_N_DAYS:30\nAND Status__c = \'Active\'' },
          { t: 'selfcheck', q: 'Why is a custom Device object needed instead of using the standard Product object?', a: 'The standard Product object represents products in the catalog, not individual installed instances. A custom Device__c object tracks each physical device with its serial number, installation date, warranty period, and maintenance schedule \u2014 attributes that Product doesn\'t support natively.' }
        ]
      },
      {
        title: 'UC3: AI-Powered Helpdesk',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Scenario: FastRetail Inc' },
          { t: 'p', x: 'FastRetail Inc is an e-commerce company processing 10,000 support contacts per day. 60% are order-related (tracking, returns, refunds). They want to deflect cases using AI, automate routine tasks, and provide agents with AI-powered recommendations. The goal is to reduce agent handle time by 30% and increase customer satisfaction to 95%.' },
          { t: 'table', head: ['Requirement', 'Business Need', 'Service Cloud Feature'], rows: [
            ['Case deflection', 'Reduce contact volume by 40%', 'Einstein Bots, Self-Service Portal'],
            ['AI recommendations', 'Suggest next best action', 'Einstein Case Classification'],
            ['Automation', 'Auto-resolve simple issues', 'Flows, Quick Actions, Macros'],
            ['Agent assistance', 'AI-powered suggestions', 'Knowledge One, Einstein Reply Recommendations'],
            ['Sentiment analysis', 'Detect unhappy customers', 'Einstein Sentiment'],
            ['Performance analytics', 'Track deflection and efficiency', 'Einstein Bots Analytics, Dashboards']
          ]},
          { t: 'h', x: 'AI Integration Strategy' },
          { t: 'num', items: [
            'Deploy Einstein Bots for order tracking and return initiations',
            'Configure Einstein Case Classification to auto-categorize cases',
            'Enable Einstein Case Routing for intelligent case assignment',
            'Set up Einstein Reply Recommendations for agent response suggestions',
            'Implement Einstein Knowledge for article suggestions',
            'Track bot deflection rate and agent handle time improvements',
            'Iterate on bot dialogs based on customer interaction data'
          ]},
          { t: 'code', lang: 'apex', x: '// AI-Powered Helpdesk: Einstein Case Classification\n// Cases are auto-classified by:\n// - Priority (based on content analysis)\n// - Type (based on subject/description)\n// - Category (based on product/issue keywords)\n\n// Query classification accuracy\nSELECT Id, CaseNumber, Subject,\n       PredictedPriority__c,\n       ActualPriority__c,\n       PredictedType__c,\n       ActualType__c,\n       ClassificationConfidence__c\nFROM Case\nWHERE CreatedDate = THIS_MONTH\nAND PredictedPriority__c != NULL\n\n// Calculate accuracy\nSELECT PredictedPriority__c,\n       COUNT(Id) TotalCases,\n       COUNT(CASE\n           WHEN PredictedPriority__c = ActualPriority__c\n           THEN 1\n       END) CorrectPredictions,\n       ROUND(\n           COUNT(CASE\n               WHEN PredictedPriority__c = ActualPriority__c\n               THEN 1\n           END) * 100.0 / COUNT(Id), 1\n       ) AccuracyPercent\nFROM Case\nWHERE CreatedDate = THIS_MONTH\nAND ActualPriority__c != NULL\nGROUP BY PredictedPriority__c' },
          { t: 'callout', kind: 'tip', x: 'AI features require sufficient data volume to be effective. Einstein Case Classification needs at least 1,000 historically classified cases to train the model. Start with data collection before enabling AI features.' },
          { t: 'selfcheck', q: 'What is the biggest risk of deploying Einstein Bots without proper testing?', a: 'Bots providing incorrect information or failing to escalate properly can damage customer satisfaction. Always test with real customer scenarios, monitor bot performance closely during initial deployment, and ensure robust escalation paths exist for when the bot cannot resolve an issue.' }
        ]
      }
    ],
    quiz: {
      title: 'Use Cases Quiz',
      mins: 10,
      questions: [
        { q: 'In the GlobalTech scenario, what is the most critical configuration for multi-region support?', opts: ['Multiple orgs per region', 'Region-specific Business Hours and Entitlement Processes', 'Separate Salesforce licenses per region', 'Different page layouts per region'], a: 1, why: 'Region-specific Business Hours ensure SLA calculations respect each region\'s working hours and holidays. Entitlement Processes with different milestone targets accommodate regional service level agreements.' },
        { q: 'Why does MedDevice Corp need a custom Device object?', opts: ['Standard objects cannot store data', 'To track individual installed devices with warranty and maintenance info', 'To replace the Account object', 'For regulatory compliance only'], a: 1, why: 'Each physical device needs tracking with serial number, installation date, warranty period, and maintenance schedule. The standard Product object represents catalog items, not individual installed instances.' },
        { q: 'What is the minimum data requirement for Einstein Case Classification?', opts: ['100 cases', '500 cases', '1,000 historically classified cases', '10,000 cases'], a: 2, why: 'Einstein Case Classification needs at least 1,000 historically classified cases to train the machine learning model effectively. Without sufficient training data, classification accuracy will be poor.' }
      ]
    }
  },
  {
    id: 'solutions',
    n: 17,
    title: 'Use Case Solutions',
    icon: '17',
    color: '#4338CA',
    tagline: 'Detailed implementation plans for each real-world use case.',
    guide: '17-Use-Case-Solutions.md',
    art: [
      { label: 'Implementation Roadmap', href: 'force-app/main/default/flows/Case_Assignment_Flow.flow-meta.xml' },
      { label: 'Architecture Decision Log', href: 'force-app/main/default/flows/Entitlement_Check_Flow.flow-meta.xml' }
    ],
    objectives: [
      'Design detailed implementation plans for global support centers',
      'Architect lifecycle enterprise solutions with complex data models',
      'Plan AI-powered helpdesk deployments with measurable outcomes',
      'Document architecture decisions and trade-offs',
      'Create phased rollout strategies for each use case',
      'Apply Salesforce best practices to implementation planning'
    ],
    lessons: [
      {
        title: 'UC1 Implementation: Global Support Center',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Implementation Plan: GlobalTech Solutions' },
          { t: 'p', x: 'The GlobalTech implementation follows a phased rollout approach. Phase 1 focuses on core case management and email intake. Phase 2 adds Omni-Channel and knowledge. Phase 3 deploys analytics and optimization.' },
          { t: 'table', head: ['Phase', 'Duration', 'Deliverables', 'Success Criteria'], rows: [
            ['Phase 1: Foundation', '4 weeks', 'Case management, Email-to-Case, Business Hours', 'Cases auto-routed to regional queues'],
            ['Phase 2: Channels', '4 weeks', 'Omni-Channel, Knowledge, Chat', 'Multi-channel routing active, KB searchable'],
            ['Phase 3: Intelligence', '3 weeks', 'Entitlements, Dashboards, Einstein Bots', 'SLA tracking, real-time dashboards'],
            ['Phase 4: Optimization', '2 weeks', 'Training, UAT, Go-Live', 'All agents onboarded, metrics baseline established']
          ]},
          { t: 'h', x: 'Key Architecture Decisions' },
          { t: 'list', items: [
            'Decision 1: Single org with regional Business Hours (vs. multi-org) \u2014 Chosen for unified reporting and simpler administration',
            'Decision 2: Enterprise Edition (vs. Unlimited) \u2014 Chosen for cost optimization with required features',
            'Decision 3: Queue-based routing initially, skills-based in Phase 3 \u2014 Reduces complexity during rollout',
            'Decision 4: Knowledge articles in English with translation workbench \u2014 Standardizes content with localized access',
            'Decision 5: Einstein Bots for FAQ deflection \u2014 Targets highest-volume contact reason first'
          ]},
          { t: 'code', lang: 'apex', x: '// UC1 Solution: Regional Business Hours setup\n// Create 3 Business Hours records:\n\n// Americas: Mon-Fri 8am-6pm EST\n// EMEA: Mon-Fri 9am-6pm GMT\n// APAC: Mon-Fri 9am-6pm JST\n\n// Query to verify regional routing\nSELECT CaseNumber, Owner.Name,\n       Entitlement.Name,\n       BusinessHours.Name,\n       CreatedDate\nFROM Case\nWHERE CreatedDate = LAST_7_DAYS\nORDER BY CreatedDate DESC\n\n// Verify SLA calculations per region\nSELECT Entitlement.Name,\n       AVG(DATEDIFF(FirstResponseDate, CreatedDate))\n           AvgFirstResponseHours,\n       COUNT(CASE WHEN MilestoneViolated__c = true\n             THEN 1 END) Violations\nFROM Case\nWHERE ClosedDate = LAST_7_DAYS\nGROUP BY Entitlement.Name' },
          { t: 'selfcheck', q: 'Why is a phased rollout recommended instead of a big-bang deployment?', a: 'A phased rollout reduces risk by allowing the team to validate each component before adding complexity. It also enables incremental training, so agents master core features before learning advanced capabilities. Issues can be caught and fixed early without disrupting the entire operation.' }
        ]
      },
      {
        title: 'UC2 Implementation: Lifecycle Enterprise',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Implementation Plan: MedDevice Corp' },
          { t: 'p', x: 'The MedDevice implementation requires extensive custom data modeling before any automation can be configured. The custom Device__c object and its relationships form the foundation of the entire solution.' },
          { t: 'table', head: ['Phase', 'Duration', 'Deliverables', 'Key Dependencies'], rows: [
            ['Phase 1: Data Model', '5 weeks', 'Custom objects, relationships, validation rules', 'Business requirements finalized'],
            ['Phase 2: Case Management', '3 weeks', 'Record types, entitlements, assignment rules', 'Data model complete'],
            ['Phase 3: Service Contracts', '3 weeks', 'Contract management, warranty tracking', 'Entitlement processes active'],
            ['Phase 4: Field Service', '4 weeks', 'FSL integration, technician dispatch', 'Case management stable'],
            ['Phase 5: Compliance', '2 weeks', 'Audit trail, regulatory reports', 'All features deployed']
          ]},
          { t: 'h', x: 'Custom Data Model Design' },
          { t: 'p', x: 'The MedDevice data model centers on the Device__c custom object, which represents individual physical devices installed at customer sites. Each device is linked to an Account and can have multiple Cases over its lifecycle.' },
          { t: 'code', lang: 'apex', x: '// UC2 Solution: Custom Device object schema\n// Device__c fields:\n// - SerialNumber__c (Text, External ID)\n// - InstallDate__c (Date)\n// - WarrantyExpiry__c (Date)\n// - MaintenanceInterval__c (Number, months)\n// - NextMaintenanceDate__c (Date)\n// - Status__c (Picklist: Active, Decommissioned)\n// - AccountId__c (Lookup to Account)\n\n// Relationships:\n// Device__c.AccountId__c â†’ Account (Lookup)\n// Case.DeviceId__c â†’ Device__c (Lookup)\n\n// Maintenance schedule query\nSELECT Id, Name, SerialNumber__c,\n       InstallDate__c, WarrantyExpiry__c,\n       NextMaintenanceDate__c,\n       Account.Name, Account.Phone,\n       Account.ShippingAddress\nFROM Device__c\nWHERE NextMaintenanceDate__c <= NEXT_N_DAYS:30\nAND Status__c = \'Active\'\nORDER BY NextMaintenanceDate__c ASC\n\n// Warranty claim tracking\nSELECT CaseNumber, Subject, Status,\n       DeviceId__r.SerialNumber__c,\n       DeviceId__r.WarrantyExpiry__c,\n       Entitlement.Name\nFROM Case\nWHERE Type = \'Warranty Claim\'\nAND DeviceId__r.WarrantyExpiry__c >= TODAY\nAND Status NOT IN (\'Closed\', \'Rejected\')' },
          { t: 'selfcheck', q: 'Why is Phase 1 (Data Model) the longest phase in the MedDevice implementation?', a: 'The custom data model is the foundation for all other features. Entitlements, case management, field service, and compliance reporting all depend on the Device__c object and its relationships being correctly designed. Errors in the data model cascade through the entire implementation.' }
        ]
      },
      {
        title: 'UC3 Implementation: AI-Powered Helpdesk',
        mins: 30,
        blocks: [
          { t: 'h', x: 'Implementation Plan: FastRetail Inc' },
          { t: 'p', x: 'The FastRetail implementation prioritizes AI-driven deflection first, then agent productivity improvements. The Einstein Bots deployment targets the 60% order-related contacts, aiming for 40% deflection within 3 months.' },
          { t: 'table', head: ['Phase', 'Duration', 'Deliverables', 'Target Metric'], rows: [
            ['Phase 1: Data Foundation', '3 weeks', 'Historical case analysis, AI training data prep', '1,000+ classified cases ready'],
            ['Phase 2: Bot Deployment', '4 weeks', 'Einstein Bot with order tracking and returns', '40% deflection rate'],
            ['Phase 3: Agent AI', '3 weeks', 'Case Classification, Reply Recommendations', '30% reduction in handle time'],
            ['Phase 4: Analytics', '2 weeks', 'Bot analytics, deflection tracking, CSAT monitoring', 'Real-time dashboards'],
            ['Phase 5: Optimization', '3 weeks', 'Bot dialog refinement, A/B testing, escalation tuning', '95% CSAT, 40% deflection']
          ]},
          { t: 'h', x: 'AI Training Data Preparation' },
          { t: 'p', x: 'Before deploying Einstein features, the historical case data must be cleaned and classified. This includes categorizing cases by type, priority, and resolution. The quality of training data directly impacts AI model accuracy.' },
          { t: 'num', items: [
            'Export 12 months of historical case data',
            'Clean and standardize case categorization (Type, Priority, Category)',
            'Remove duplicates and incomplete records',
            'Ensure at least 1,000 cases per classification category',
            'Verify case descriptions are detailed enough for NLP training',
            'Split data: 80% training, 20% validation'
          ]},
          { t: 'code', lang: 'apex', x: '// UC3 Solution: Einstein Bots analytics query\n// Track bot performance metrics\n\n// Deflection rate\nSELECT COUNT(Id) TotalBotConversations,\n       COUNT(CASE WHEN Resolution__c = \'Deflected\'\n             THEN 1 END) Deflected,\n       COUNT(CASE WHEN Resolution__c = \'Escalated\'\n             THEN 1 END) Escalated,\n       ROUND(\n           COUNT(CASE WHEN Resolution__c = \'Deflected\'\n                 THEN 1 END) * 100.0 / COUNT(Id), 1\n       ) DeflectionRate\nFROM BotConversation__c\nWHERE CreatedDate = THIS_MONTH\n\n// Bot dialog performance\nSELECT DialogName__c,\n       COUNT(Id) TotalInvocations,\n       AVG(ResolutionTime__c) AvgResolutionTime,\n       COUNT(CASE WHEN Outcome__c = \'Success\'\n             THEN 1 END) Successful,\n       ROUND(\n           COUNT(CASE WHEN Outcome__c = \'Success\'\n                 THEN 1 END) * 100.0 / COUNT(Id), 1\n       ) SuccessRate\nFROM BotConversation__c\nWHERE CreatedDate = THIS_MONTH\nGROUP BY DialogName__c\nORDER BY TotalInvocations DESC\n\n// Agent handle time comparison\nSELECT AVG(TotalHandleTime__c) AvgHandleTime\nFROM Case\nWHERE CreatedDate = THIS_MONTH\nAND HasBotInteraction__c = true\n\n// vs. cases without bot interaction\nSELECT AVG(TotalHandleTime__c) AvgHandleTime\nFROM Case\nWHERE CreatedDate = THIS_MONTH\nAND HasBotInteraction__c = false' },
          { t: 'callout', kind: 'tip', x: 'Measure bot success not just by deflection rate but by customer satisfaction. A bot that deflects cases but frustrates customers will increase churn. Always pair deflection metrics with CSAT scores.' },
          { t: 'selfcheck', q: 'What is the key success metric for an AI-powered helpdesk?', a: 'The combination of deflection rate and customer satisfaction. Deflecting 40% of contacts is only successful if CSAT remains above 90%. If deflection comes at the cost of customer satisfaction, the bot needs improvement in escalation handling or response quality.' }
        ]
      }
    ],
    quiz: {
      title: 'Use Case Solutions Quiz',
      mins: 10,
      questions: [
        { q: 'Why is a phased rollout recommended for the GlobalTech implementation?', opts: ['It costs less', 'It reduces risk and enables incremental validation', 'Salesforce requires it', 'It is faster than big-bang deployment'], a: 1, why: 'Phased rollout reduces risk by validating each component before adding complexity. It enables incremental training and catches issues early without disrupting the entire operation.' },
        { q: 'Why is the Data Model phase the longest in the MedDevice implementation?', opts: ['Custom objects take longer to build', 'All other features depend on the data model being correct first', 'It requires more testing', 'It involves more stakeholders'], a: 1, why: 'The custom data model is the foundation for entitlements, case management, field service, and compliance. Errors in the data model cascade through the entire implementation, so getting it right is critical.' },
        { q: 'What is the key success metric for FastRetail\'s AI-powered helpdesk?', opts: ['Number of bots deployed', 'Deflection rate AND customer satisfaction combined', 'Number of cases closed', 'Agent headcount reduction'], a: 1, why: 'Deflecting cases is only valuable if customers remain satisfied. The combination of deflection rate (targeting 40%) and CSAT (targeting 95%) ensures the bot actually improves the customer experience.' }
      ]
    }
  }
];



