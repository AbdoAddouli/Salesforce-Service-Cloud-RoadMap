# CTI and Telephony

## Overview

Computer Telephony Integration (CTI) connects your telephony system to the Salesforce Service Cloud. It enables screen-pops, click-to-dial, call logging, and softphone functionality directly within the agent workspace. This guide covers CTI architecture, Open CTI implementation, call center configuration, and best practices for telephony integration.

CTI integration transforms the agent experience by eliminating manual data entry around phone calls and enabling seamless call management from within Service Cloud.

## Core Concepts

### CTI Architecture

| Component | Description | Purpose |
|-----------|-------------|---------|
| CTI Adapter | Telephony connector | Links phone system to Salesforce |
| Softphone | In-app phone controls | Manage calls in Salesforce |
| Screen Pop | Auto-display customer info | Context-aware call handling |
| Click-to-Dial | Call initiation | One-click calling |
| Call Logging | Automatic case creation | Effortless record keeping |
| Open CTI | Standard integration API | Third-party telephony support |

### CTI Integration Options

| Option | Description | Use Case |
|--------|-------------|----------|
| Open CTI | API-based integration | Custom telephony systems |
| Service Cloud Voice | Native telephony | New deployments |
| Partner CTI | AppExchange solutions | Rapid deployment |
| Custom CTI | Custom adapter | Specific requirements |

### Call Center Configuration

| Element | Description | Purpose |
|---------|-------------|---------|
| Call Center | Phone system definition | Telephony connection |
| Call Center Record | System configuration | Routing and presence |
| CTI Adapter | Integration component | Phone system linkage |
| Routing | Call distribution | Queue management |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Screen Pop | Customer data display | Faster call handling |
| Click-to-Dial | Direct calling | Reduced dialing time |
| Softphone | In-app telephony | Full call management |
| Automated Call Logging | Call activity tracking | Complete history |
| IVR Integration | Automated menus | Caller self-service |
| Call Recording | Conversation capture | Quality assurance |
| Call Analytics | Performance reporting | Insight-driven decisions |
| Presence Sync | Availability tracking | Accurate routing |

## Step-by-Step: CTI Implementation

### Step 1: Configure Call Center

```
// Call Center Configuration
// Setup > Customize > Call Center > Call Centers

// Edit Call Center:
// Name: Global Support Center
// Internal Name: Global_Support_Center
// License Number: <provider license>
// Phone Number: <main support number>

// CTI Adapter:
// Type: Open CTI
// Integration: Custom adapter
// Version: Latest
```

### Step 2: Implement Open CTI Adapter

```apex
// Apex: Open CTI server callback implementation
public class CTICallbackController {
    
    // Handle call center events
    @AuraEnabled
    public static String handleInboundCall(String phoneNumber, String callerId) {
        // Check for existing caller
        Contact contact = findContactByPhone(phoneNumber);
        Account account = null;
        
        if (contact != null) {
            account = [SELECT Id, Name, Support_Tier__c 
                       FROM Account 
                       WHERE Id = :contact.AccountId];
        }
        
        // Create case for call
        Case caseRecord = createCaseFromCall(callerId, contact, account);
        
        return JSON.serialize(new Map<String, Object>{
            'caseId' => caseRecord.Id,
            'caseNumber' => caseRecord.CaseNumber,
            'contactId' => contact != null ? contact.Id : null,
            'accountName' => account != null ? account.Name : 'New Caller',
            'supportTier' => account != null ? account.Support_Tier__c : 'Standard'
        });
    }
    
    // Find contact by phone
    private static Contact findContactByPhone(String phone) {
        List<Contact> contacts = [
            SELECT Id, AccountId, Name, Phone, MobilePhone
            FROM Contact
            WHERE Phone = :phone OR MobilePhone = :phone
            LIMIT 1
        ];
        return contacts.isEmpty() ? null : contacts[0];
    }
    
    // Create case from phone call
    private static Case createCaseFromCall(String callerId, Contact contact, Account account) {
        Case c = new Case(
            Origin = 'Phone',
            Status = 'New',
            Priority = 'Normal',
            Subject = 'Phone call from ' + (contact != null ? contact.Name : callerId),
            Description = 'Inbound phone call received. Caller ID: ' + callerId
        );
        
        if (contact != null) {
            c.ContactId = contact.Id;
            c.AccountId = contact.AccountId;
        }
        
        // Auto-assign entitlement
        if (account != null) {
            List<Entitlement> entitlements = [
                SELECT Id FROM Entitlement
                WHERE AccountId = :account.Id
                AND Status = 'Active'
                LIMIT 1
            ];
            if (!entitlements.isEmpty()) {
                c.EntitlementId = entitlements[0].Id;
            }
        }
        
        insert c;
        return c;
    }
}
```

### Step 3: Configure Screen Pop

```
// Screen Pop Configuration
// Setup > Customize > Call Center > Screen Pops

// Screen Pop Types:
// 1. Inbound: Display Contact or Account record
//    - Match on phone number
//    - Fallback to case creation

// 2. Outbound: Display New Call page
//    - Auto-capture call details

// 3. Hold: Display customer loyalty info
//    - Show account history
//    - Show open cases
```

### Step 4: Configure Call Routing

```apex
// Call Routing Configuration
// Setup > Customize > Call Center > Routing

// Routing Rules:
// - Premium Accounts → Premium Support Queue
// - Enterprise Products → Enterprise Support Queue
// - All Others → General Support Queue

// IVR Options:
// - Press 1 for Billing
// - Press 2 for Technical Support
// - Press 3 for Account Management
```

## Step-by-Step: SOQL for Telephony Analytics

### Call Activity Report

```soql
-- Call tracking analytics
SELECT Id, Description, CreatedDate,
       Call_Type__c, Call_Duration__c,
       Contact.Name, Account.Name,
       RecordType.Name as CallRecordType
FROM Case
WHERE Origin = 'Phone'
AND CreatedDate = THIS_MONTH
ORDER BY CreatedDate DESC
```

### Call Volume Analysis

```soql
-- Call volume by day and time
SELECT DAY_ONLY(CreatedDate) as CallDay,
       HOUR_IN_DAY(CreatedDate) as CallHour,
       COUNT() as CallCount
FROM Case
WHERE Origin = 'Phone'
AND CreatedDate = LAST_30_DAYS
GROUP BY DAY_ONLY(CreatedDate), HOUR_IN_DAY(CreatedDate)
ORDER BY CallDay, CallHour
```

### First Call Resolution Metrics

```soql
-- First call resolution tracking
SELECT CASE 
           WHEN DATEDIFF(CreatedDate, ClosedDate) <= 1 
           THEN 'Resolved in 1 Day'
           WHEN DATEDIFF(CreatedDate, ClosedDate) <= 3 
           THEN 'Resolved in 3 Days'
           ELSE 'Resolved in > 3 Days'
       END as ResolutionBucket,
       COUNT() as CaseCount
FROM Case
WHERE Origin = 'Phone'
AND Status = 'Closed'
AND ClosedDate = THIS_QUARTER
GROUP BY CASE 
           WHEN DATEDIFF(CreatedDate, ClosedDate) <= 1 
           THEN 'Resolved in 1 Day'
           WHEN DATEDIFF(CreatedDate, ClosedDate) <= 3 
           THEN 'Resolved in 3 Days'
           ELSE 'Resolved in > 3 Days'
       END
```

## Best Practices for Telephony

### CTI Design Principles

1. **Screen Pop Match Logic**: Match on most specific phone number first
2. **Fallback Strategy**: Always have a fallback when no contact matches
3. **Softphone Customization**: Tailor softphone layout to agent workflows
4. **Call Logging**: Auto-create cases for all inbound calls
5. **Presence Integration**: Sync call status with Omni-Channel presence
6. **Error Handling**: Graceful handling of telephony failures

### CTI Configuration Best Practices

| Best Practice | Description |
|---------------|-------------|
| Test in Sandbox | Validate integration before production |
| Define Match Keys | Clear rules for contact matching |
| Configure Fallbacks | Handle unknown callers gracefully |
| Monitoring | Track call quality and volume |
| Security | Protect customer phone data |

## Hands-On Tasks

1. **Research CTI Options**: Compare Open CTI vs. partner solutions
2. **Configure Call Center**: Set up a call center record
3. **Build Screen Pop**: Implement contact lookup on inbound calls
4. **Create Call Cases**: Auto-generate cases from calls
5. **Implement Click-to-Dial**: Configure outbound call initiation
6. **Analyze Call Data**: Create reports on call volume and resolution
7. **Test Integration**: Verify all call scenarios work correctly

## Self-Check Questions

1. What are the main CTI integration options?
2. How does screen pop improve agent efficiency?
3. What is the role of IVR in call routing?
4. How do you track first call resolution?
5. What are common CTI implementation challenges?

## Common Exam Traps

- **Trap**: Assuming CTI is native to Salesforce — it requires an adapter or partner solution.
- **Trap**: Forgetting that Open CTI uses JavaScript APIs, not Apex.
- **Trap**: Not considering screen pop match quality for accuracy.
- **Trap**: Assuming all calls should create cases — some are account inquiries.
- **Trap**: Overlooking that CTI requires specific licenses and permissions.

## Related

- **Phase**: 10 - CTI and Telephony
- **Exam Domain**: Intake & Interaction Channels (13%)
- **Previous Phase**: 09 - Einstein Bots and Messaging
- **Next Phase**: 11 - Case Management Best Practices
- **Resources**: [CTI Documentation](https://help.salesforce.com/s/articleView?id=sf.cti_overview.htm&type=5)