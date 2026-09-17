# Einstein Bots and Messaging

## Overview

Einstein Bots are AI-powered chatbots that automate customer conversations in Service Cloud. They handle common inquiries, gather case information, and escalate complex issues to human agents. Combined with Einstein Messaging channels (SMS, WhatsApp, Facebook Messenger), they create a comprehensive conversational service experience. This guide covers bot building, dialog customization, channel configuration, and Einstein AI integration.

Bots and messaging channels transform customer service by providing instant responses, 24/7 availability, and seamless escalation to human agents when needed.

## Core Concepts

### Einstein Bot Architecture

| Component | Description | Purpose |
|-----------|-------------|---------|
| Einstein Bot | Conversational AI | Automates customer interactions |
| Chat Dialogs | Conversation flows | Guides customer journeys |
| Bot Steps | Conversation nodes | Defines bot behavior |
| Bot Variables | Conversation data | Stores participant data |
| Bot Action | External function calls | Integrates with systems |
| Channel | Delivery platform | Connects to messaging |
| Conversation | Individual interaction | Full dialog history |

### Einstein Messaging Channels

| Channel | Type | Use Case |
|---------|------|----------|
| Chat | Live web chat | Real-time website support |
| SMS/Text | Mobile messaging | Text-based support |
| WhatsApp | Mobile messaging | Global messaging support |
| Facebook Messenger | Social messaging | Social media support |
| Custom Channels | API-based | Organization-specific |

### Bot Dialog Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| Information Gathering | Collect case details | Case creation |
| FAQ Resolution | Answer common questions | Self-service |
| Case Creation | Direct case submission | Quick intake |
| Escalation | Transfer to agent | Complex issues |
| Authentication | Identity verification | Sensitive data |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Einstein Bots | AI-powered conversations | 24/7 automation |
| Chat Dialogs | Configurable conversation flows | Customized experiences |
| Bot Actions | External system integration | Process automation |
| Dialogs | Multi-step conversations | Complex use cases |
| Einstein Case Classification | AI case categorization | Faster routing |
| Article Recommendations | AI knowledge suggestions | Better resolution |
| Einstein Messaging | Multi-channel messaging | Omnichannel support |

## Step-by-Step: Building Einstein Bots

### Step 1: Create Bot Dialog

```
// Einstein Bot Configuration
// Setup > Einstein Bots > Your Bot

// Step 1: Define Bot Goal
// Goal: Resolve common customer inquiries

// Step 2: Create Dialogs
// Dialog 1: Greeting
//   Trigger: "Hi", "Hello", "Help"
//   Message: "Hello! I'm your virtual assistant. How can I help?"
//   
// Dialog 2: Technical Support
//   Trigger: "Technical", "Problem", "Error"
//   Message: "Let me help with your technical issue."
//   Steps: 
//     - Ask for product name
//     - Ask for issue description
//     - Create case
//     - Offer article recommendations

// Dialog 3: Billing
//   Trigger: "Bill", "Invoice", "Payment"
//   Message: "Let me help with billing questions."
//   Steps:
//     - Ask for account details
//     - Look up billing status
//     - Escalate to billing agent if needed

// Dialog 4: Generic Fallback
//   Message: "I'm not sure about that. Let me connect you with an agent."
//   Steps:
//     - Route to agent queue
//     - Pass context information
```

### Step 2: Configure Bot Actions

```apex
// Apex: Bot invocable actions for Einstein Bot
public class BotActions {
    
    @InvocableMethod(
        label='Create Case from Bot'
        description='Creates case from bot conversation'
        category='Bots'
    )
    public static List<CaseResult> createCaseFromBot(
        List<BotRequest> requests
    ) {
        List<CaseResult> results = new List<CaseResult>();
        List<Case> casesToCreate = new List<Case>();
        
        for (BotRequest req : requests) {
            Case c = new Case(
                Subject = req.subject,
                Description = req.description,
                Origin = 'Chat',
                Status = 'New',
                Priority = 'Normal'
            );
            
            // Match contact
            if (req.contactEmail != null) {
                Contact contact = findContact(req.contactEmail);
                if (contact != null) {
                    c.ContactId = contact.Id;
                    c.AccountId = contact.AccountId;
                }
            }
            casesToCreate.add(c);
        }
        
        if (!casesToCreate.isEmpty()) {
            insert casesToCreate;
        }
        
        for (Case c : casesToCreate) {
            CaseResult result = new CaseResult();
            result.caseId = c.Id;
            result.caseNumber = c.CaseNumber;
            result.status = c.Status;
            results.add(result);
        }
        
        return results;
    }
    
    @InvocableMethod(
        label='Get Recommended Articles'
        description='Returns knowledge article recommendations'
        category='Bots'
    )
    public static List<ArticleResult> getRecommendedArticles(
        List<ArticleRequest> requests
    ) {
        List<ArticleResult> results = new List<ArticleResult>();
        
        for (ArticleRequest req : requests) {
            ArticleResult result = new ArticleResult();
            
            // Search knowledge base
            List<Knowledge__kav> articles = [
                SELECT Id, Title, Summary, ArticleNumber
                FROM Knowledge__kav
                WHERE PublishStatus = 'Online'
                AND Title LIKE :('%' + req.keyword + '%')
                LIMIT 3
            ];
            
            result.articleTitles = new List<String>();
            result.articleIds = new List<String>();
            
            for (Knowledge__kav article : articles) {
                result.articleTitles.add(article.Title);
                result.articleIds.add(article.Id);
            }
            
            results.add(result);
        }
        
        return results;
    }
    
    private static Contact findContact(String email) {
        List<Contact> contacts = [
            SELECT Id, AccountId, Name, Email
            FROM Contact
            WHERE Email = :email
            LIMIT 1
        ];
        return contacts.isEmpty() ? null : contacts[0];
    }
    
    public class BotRequest {
        @InvocableVariable(label='Subject' required=true)
        public String subject;
        
        @InvocableVariable(label='Description' required=true)
        public String description;
        
        @InvocableVariable(label='Contact Email')
        public String contactEmail;
        
        @InvocableVariable(label='Account ID')
        public String accountId;
    }
    
    public class CaseResult {
        @InvocableVariable(label='Case ID')
        public String caseId;
        
        @InvocableVariable(label='Case Number')
        public String caseNumber;
        
        @InvocableVariable(label='Status')
        public String status;
    }
    
    public class ArticleRequest {
        @InvocableVariable(label='Search Keyword' required=true)
        public String keyword;
    }
    
    public class ArticleResult {
        @InvocableVariable(label='Article Titles')
        public List<String> articleTitles;
        
        @InvocableVariable(label='Article IDs')
        public List<String> articleIds;
    }
}
```

### Step 3: Configure Einstein Case Classification

```
// Einstein Case Classification Setup
// Setup > Search: Einstein Case Classification

// Enable Einstein Case Classification: ✅
// Training Data: 500+ historical cases recommended
// Categories: Based on case subject and description

// Integration:
// - Predicts case category on creation
// - Recommends article suggestions
// - Routes cases based on predictions
```

### Step 4: Configure Bot Handoff to Agent

```
// Bot Handoff Configuration
// Setup > Einstein Bots > Your Bot > Routing

// Handoff Settings:
// - Handoff to Agent: ✅
// - Queue: General Support Queue
// - Routing: Omni-Channel
// - Context: Pass conversation data

// Handoff Triggers:
// - Customer requests human agent
// - Bot cannot answer
// - Conversation exceeds 10 minutes
// - Multiple failed attempts
```

## Step-by-Step: Messaging Setup

### Step 1: Enable Messaging

```
// Messaging Setup
// Setup > Messaging Settings

// Enable Messaging: ✅
// Channel Types:
// - SMS: ✅
// - WhatsApp: ✅
// - Facebook Messenger: ✅

// SMS Provider: Twilio or other
// WhatsApp Business Account: Configured
// Facebook Page: Connected
```

### Step 2: Configure SMS Channel

```
// SMS Channel Configuration
// Setup > Messaging > Channels > SMS

// Number: +1-555-0100
// Verification: Completed
// Business Hours: Standard Support Hours
// Auto-Response: ✅
// Default Routing: General Support Queue
```

### Step 3: Create Messaging Flows

```
// Messaging Conversation Flow
// Flow Type: Autolaunched Flow
// Starting Element: Message

// Flow Logic:
// 1. Receive inbound message
// 2. Einstein Bot greets customer
// 3. Collect case information
// 4. Create case or resolve inquiry
// 5. Offer article recommendations
// 6. Escalate to agent if needed
```

## Step-by-Step: SOQL for Bot Analytics

### Bot Performance Analytics

```soql
-- Bot conversation analytics
SELECT Channel.Name,
       COUNT() as ConversationCount,
       AVG(ConversationDuration) as AvgDuration,
       SUM(CASE WHEN EscalatedToAgent = true THEN 1 ELSE 0 END) as Escalations
FROM ConversationEntry
WHERE CreatedDate = THIS_MONTH
GROUP BY Channel.Name
ORDER BY ConversationCount DESC
```

### Chat Session Metrics

```soql
-- Chat session performance
SELECT LiveChatTranscript.Queue.Name as QueueName,
       LiveChatTranscript.Status as ChatStatus,
       COUNT() as ChatCount,
       AVG(DATEDIFF(LiveChatTranscript.StartTime, LiveChatTranscript.EndTime)) as AvgDuration
FROM LiveChatTranscript
WHERE StartTime = THIS_WEEK
GROUP BY LiveChatTranscript.Queue.Name, LiveChatTranscript.Status
ORDER BY ChatCount DESC
```

### Case Deflection Analytics

```soql
-- Cases created from bot conversations
SELECT Origin as Channel,
       COUNT() as CaseCount,
       SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as ClosedCount,
       (SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) / COUNT()) * 100 as ResolutionRate
FROM Case
WHERE CreatedDate = THIS_QUARTER
AND Origin IN ('Chat', 'Social', 'Email')
GROUP BY Origin
ORDER BY CaseCount DESC
```

## Hands-On Tasks

1. **Create Einstein Bot**: Build a bot with greeting and FAQ dialogs
2. **Design Bot Actions**: Create Apex invocable actions for case creation
3. **Configure Handoff**: Set up bot-to-agent handoff with context
4. **Enable Messaging**: Configure SMS and chat messaging channels
5. **Test Bot Flows**: Simulate conversations and verify routing
6. **Analyze Performance**: Create reports on bot deflection rate
7. **Optimize Dialogs**: Refine bot dialogs based on analytics

## Self-Check Questions

1. What is the role of Einstein bots in Service Cloud?
2. How do bot dialogs guide customer conversations?
3. What is the difference between bot deflection and escalation?
4. How does Einstein Case Classification improve routing?
5. What channels are supported by Einstein Messaging?

## Common Exam Traps

- **Trap**: Assuming Einstein bots can handle all conversations — some need agent escalation.
- **Trap**: Forgetting that bot dialogs are triggered by specific keywords.
- **Trap**: Not considering handoff context when transferring to agents.
- **Trap**: Overlooking that case classification requires training data.
- **Trap**: Assuming messaging channels are included in all Service Cloud editions.

## Related

- **Phase**: 09 - Einstein Bots and Messaging
- **Exam Domain**: Intake & Interaction Channels (13%)
- **Previous Phase**: 08 - Omni-Channel and Omni-Supervisor
- **Next Phase**: 10 - CTI and Telephony
- **Resources**: [Einstein Bot Documentation](https://help.salesforce.com/s/articleView?id=sf.bots_parent.htm&type=5)