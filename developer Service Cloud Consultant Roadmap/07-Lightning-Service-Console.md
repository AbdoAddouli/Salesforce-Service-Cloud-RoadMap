# Lightning Service Console

## Overview

The Lightning Service Console is the primary workspace for service agents in Service Cloud. It provides a unified interface for managing cases, viewing customer information, and accessing knowledge articles. This guide covers console configuration, utility bars, macros, quick text, split views, and productivity features that maximize agent efficiency.

The Service Console transforms the agent experience by consolidating all relevant information into a single, tabbed workspace. Proper console design directly impacts agent productivity and customer satisfaction.

## Core Concepts

### Console Components

| Component | Description | Purpose |
|-----------|-------------|---------|
| Navigation Bar | Primary navigation | Access to objects and lists |
| Workspace Tabs | Multi-tab interface | Handle multiple records |
| Split View | Side-by-side panels | Compare related records |
| Utility Bar | Bottom toolbar | Quick access to tools |
| Highlight Panel | Key record fields | At-a-glance information |
| Activity Panel | Timeline view | Communication history |
| Feed Panel | Collaborative feed | Internal communications |

### Console Layouts

| Layout Type | Description | Use Case |
|-------------|-------------|----------|
| Service Console | Standard agent workspace | General support |
| Omni-Channel Console | Chat/case focused | Omnichannel support |
| Custom Console | Organization-specific | Specialized workflows |

### Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Workspace Tabs | Open multiple records | Multi-tasking efficiency |
| Split View | Side-by-side comparison | Quick context gathering |
| Utility Bar | Quick-access tools | Reduced clicks |
| Macros | Automated task execution | Consistent workflows |
| Quick Text | Standardized responses | Faster communication |
| Path | Guided process flow | Consistent resolution |
| Feed Tracking | Activity timeline | Complete case history |
| Knowledge Sidebar | Article suggestions | Faster resolution |

## Step-by-Step: Console Configuration

### Step 1: Create Console Layout

```apex
// Console Layout Configuration
// Setup > Customize > User Interface > App Manager

// App Name: Service Console
// Description: Primary workspace for service agents
// Console Navigation Style: Workspace Tabs
// Utility Bar: Enabled

// Navigation Items:
// - Cases (Default)
// - Accounts
// - Contacts
// - Knowledge Articles
// - Reports
// - Dashboards
```

### Step 2: Configure Highlight Panel

```apex
// Highlight Panel Configuration
// Setup > Customize > Cases > Page Layouts

// Highlight Panel Fields:
// Row 1: Case Number, Status, Priority, Origin
// Row 2: Account Name, Contact Name, Entitlement
// Row 3: Product, Service Region, Created Date
// Row 4: Closed Date, Resolution Time, Owner

// Compact Layout Assignment:
// - Default: Service Console Compact Layout
// - Mobile: Service Console Mobile Layout
```

### Step 3: Set Up Utility Bar

```apex
// Utility Bar Configuration
// Setup > Customize > User Interface > Utility Bar

// Utility Items:
// 1. History - View recent records
// 2. Notes - Quick note-taking
// 3. Send Email - Email composition
// 4. Knowledge - Article search
// 5. Omni-Channel - Presence management
// 6. Macro - Task automation
// 7. Quick Text - Standardized responses
```

### Step 4: Configure Split View

```apex
// Split View Configuration
// Setup > Customize > Cases > Page Layouts

// Split View Settings:
// - Enable Split View: ✅
// - Default Split: Case Detail + Contact Detail
// - Maximum Split Panels: 2
// - Split View Orientation: Horizontal
```

## Step-by-Step: Macros and Quick Text

### Step 1: Create Macros

```apex
// Macro Configuration
// Setup > Customize > Cases > Macros

// Macro: Update Case Status
// Steps:
// 1. Set Status = 'Working'
// 2. Set Priority = 'Normal'
// 3. Add Comment: 'Case is being investigated'
// 4. Send Email: Status update to customer

// Macro: Escalate Case
// Steps:
// 1. Set Status = 'Escalated'
// 2. Set Priority = 'High'
// 3. Add Comment: 'Escalated to Tier 2 support'
// 4. Send Email: Escalation notification

// Macro: Close Case
// Steps:
// 1. Set Status = 'Closed'
// 2. Set Resolution = 'Issue resolved'
// 3. Add Comment: 'Case resolved and closed'
// 4. Send Email: Closure confirmation
```

### Step 2: Configure Quick Text

```apex
// Quick Text Configuration
// Setup > Customize > Cases > Quick Text

// Quick Text Templates:
// 1. Greeting: "Hello [Name], thank you for contacting support."
// 2. Request Info: "Could you please provide more details about [Issue]?"
// 3. Status Update: "Your case [#Number] is currently [Status]."
// 4. Resolution: "The issue has been resolved. [Resolution Details]"
// 5. Follow Up: "We'll follow up within [Timeframe] business hours."

// Quick Text Categories:
// - General
// - Technical
// - Billing
// - Account
```

### Step 3: Implement Macro Execution

```apex
// Apex: Macro execution service
public class MacroExecutionService {
    
    public static void executeMacro(Id caseId, String macroName) {
        // Get case
        Case c = [SELECT Id, CaseNumber, Status, Priority
                  FROM Case WHERE Id = :caseId];
        
        // Execute macro based on name
        if (macroName == 'Update Case Status') {
            updateCaseStatus(c);
        } else if (macroName == 'Escalate Case') {
            escalateCase(c);
        } else if (macroName == 'Close Case') {
            closeCase(c);
        }
    }
    
    private static void updateCaseStatus(Case c) {
        c.Status = 'Working';
        c.Priority = 'Normal';
        
        CaseComment comment = new CaseComment(
            ParentId = c.Id,
            CommentBody = 'Case is being investigated',
            IsPublished = false
        );
        
        insert comment;
        update c;
        
        sendEmailNotification(c, 'Status Update', 
            'Your case ' + c.CaseNumber + ' is being investigated.');
    }
    
    private static void escalateCase(Case c) {
        c.Status = 'Escalated';
        c.Priority = 'High';
        c.EscalationReason__c = 'Auto-escalated via macro';
        
        CaseComment comment = new CaseComment(
            ParentId = c.Id,
            CommentBody = 'Escalated to Tier 2 support',
            IsPublished = false
        );
        
        insert comment;
        update c;
        
        sendEmailNotification(c, 'Escalation', 
            'Your case ' + c.CaseNumber + ' has been escalated.');
    }
    
    private static void closeCase(Case c) {
        c.Status = 'Closed';
        c.Resolution__c = 'Issue resolved';
        c.ClosedDate = DateTime.now();
        
        CaseComment comment = new CaseComment(
            ParentId = c.Id,
            CommentBody = 'Case resolved and closed',
            IsPublished = false
        );
        
        insert comment;
        update c;
        
        sendEmailNotification(c, 'Case Closed', 
            'Your case ' + c.CaseNumber + ' has been resolved.');
    }
    
    private static void sendEmailNotification(Case c, String subject, String body) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setSubject(subject);
        email.setPlainTextBody(body);
        email.setTargetObjectId(c.ContactId);
        email.setWhatId(c.Id);
        
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
    }
}
```

## Step-by-Step: Console Customization

### Step 1: Custom Console Components

```apex
// Console Component Configuration
// Setup > Customize > User Interface > Console Components

// Component 1: Knowledge Sidebar
// Type: Visualforce Page
// Page: KnowledgeSidebar
// Height: 300px
// Location: Right sidebar

// Component 2: Case Metrics
// Type: Lightning Component
// Component: CaseMetricsPanel
// Height: 200px
// Location: Bottom panel

// Component 3: Customer Info
// Type: Visualforce Page
// Page: CustomerInfoPanel
// Height: 250px
// Location: Right sidebar
```

### Step 2: Feed Tracking

```apex
// Feed Tracking Configuration
// Setup > Customize > Cases > Feed Tracking

// Enable Feed Tracking: ✅
// Track Fields:
// - Status
// - Priority
// - Owner
// - Entitlement
// - Resolution

// Feed Items:
// - Case Comments
// - Email Messages
// - Task Activities
// - Knowledge Articles
```

### Step 3: Path Configuration

```apex
// Path Configuration
// Setup > Customize > Cases > Path

// Path: Case Resolution Path
// Stages:
// 1. New → 2. Working → 3. Escalated → 4. Resolved → 5. Closed

// Guidance for Each Stage:
// New: "Gather initial information and acknowledge customer"
// Working: "Investigate issue and identify root cause"
// Escalated: "Escalate to appropriate support tier"
// Resolved: "Confirm resolution with customer"
// Closed: "Document solution and close case"
```

## Step-by-Step: SOQL for Console Analytics

### Agent Productivity Metrics

```soql
-- Agent case handling metrics
SELECT Owner.Name as AgentName,
       COUNT() as TotalCases,
       AVG(DAYS_IN_MONTH(ClosedDate - CreatedDate)) as AvgResolutionDays,
       SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as ClosedCases,
       SUM(CASE WHEN Status = 'Escalated' THEN 1 ELSE 0 END) as EscalatedCases
FROM Case
WHERE CreatedDate = THIS_MONTH
GROUP BY Owner.Name
ORDER BY TotalCases DESC
```

### Console Usage Analytics

```soql
-- Recent console activity
SELECT Id, CaseNumber, Subject, Status,
       Owner.Name, LastModifiedDate,
       LAST_VIEWED_DATE as LastViewed
FROM Case
WHERE LAST_VIEWED_DATE = TODAY
ORDER BY LAST_VIEWED_DATE DESC
```

## Hands-On Tasks

1. **Create Console App**: Build a custom Service Console application
2. **Configure Highlight Panel**: Set up key fields for at-a-glance viewing
3. **Build Macros**: Create macros for common agent tasks
4. **Set Up Quick Text**: Create quick text templates for frequent responses
5. **Implement Split View**: Configure split view for case comparison
6. **Add Console Components**: Build custom Visualforce or Lightning components
7. **Test Productivity**: Measure agent productivity before and after console setup

## Self-Check Questions

1. What are the key components of the Lightning Service Console?
2. How do macros improve agent productivity?
3. What is the difference between macros and quick text?
4. How do you configure the highlight panel?
5. What are console components and when would you use them?

## Common Exam Traps

- **Trap**: Assuming the Service Console is available in all Salesforce editions — it requires Service Cloud licenses.
- **Trap**: Forgetting that macros require specific user permissions.
- **Trap**: Not considering console performance with many open tabs.
- **Trap**: Assuming quick text can include merge fields — they are static text.
- **Trap**: Overlooking that console layouts differ from standard page layouts.

## Related

- **Phase**: 07 - Lightning Service Console
- **Exam Domain**: Implementation Strategies (12%)
- **Previous Phase**: 06 - Knowledge Management
- **Next Phase**: 08 - Omni-Channel and Omni-Supervisor
- **Resources**: [Service Console Documentation](https://help.salesforce.com/s/articleView?id=sf.console_define.htm&type=5)
