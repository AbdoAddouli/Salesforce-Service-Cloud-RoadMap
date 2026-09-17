/**
 * Service Cloud Consultant Learning Project - Case Routing Service
 * ============================================================================
 * EXAM CONCEPT: Case Management & Assignment Rules (Blueprint Domain: 16%)
 *
 * This class demonstrates how to programmatically implement case routing
 * logic similar to what Salesforce provides out-of-the-box with Case
 * Assignment Rules. In real-world Service Cloud implementations, custom
 * routing is needed when:
 *   - Complex routing criteria exceed standard assignment rule capabilities
 *   - Region-based or skills-based routing is required
 *   - Dynamic queue assignment based on real-time conditions is needed
 *
 * KEY LEARNING POINTS:
 * 1. Understanding Case Assignment Rules vs custom routing logic
 * 2. Queue-based routing and how public groups/security model works
 * 3. Priority-based case management and its impact on SLA timers
 * 4. Region/product-based routing for enterprise support models
 * 5. Bulk-safe DML patterns in trigger/service contexts
 *
 * RELATED EXAM TOPICS:
 * - Case assignment rules and escalation rules
 * - Queues and public groups
 * - Case priority and its effect on entitlements
 * - Omni-Channel routing vs assignment rules
 * ============================================================================
 */
public with sharing class CaseRoutingService {

    private static final String HIGH_PRIORITY_QUEUE = 'High_Priority_Support';
    private static final String MEDIUM_PRIORITY_QUEUE = 'Standard_Support';
    private static final String LOW_PRIORITY_QUEUE = 'General_Support';
    private static final String ENTERPRISE_QUEUE = 'Enterprise_Support';
    private static final String LUMA_QUEUE = 'LUMA_Support';

    /**
     * Routes a batch of cases to the appropriate queue based on priority level.
     * This mirrors how Case Assignment Rules evaluate entry criteria sequentially.
     *
     * In the Salesforce Service Cloud exam, you need to know:
     * - Assignment rules are processed in order; first matching rule wins
     * - Default assignment rules can be set per object
     * - Cases can be reassigned manually or via escalation rules
     *
     * @param cases List of incoming cases to route
     * @return List of cases with QueueId set for DML
     */
    public static List<Case> routeByPriority(List<Case> cases) {
        List<Case> routedCases = new List<Case>();

        if (cases == null || cases.isEmpty()) {
            return routedCases;
        }

        // Build a map of queue names to queue IDs for efficient lookup
        Map<String, Id> queueMap = getQueueNameToIdMap();

        for (Case c : cases) {
            if (c == null) continue;

            String queueName;
            if (c.Priority == 'High' || c.Priority == 'Critical') {
                queueName = HIGH_PRIORITY_QUEUE;
            } else if (c.Priority == 'Medium') {
                queueName = MEDIUM_PRIORITY_QUEUE;
            } else {
                queueName = LOW_PRIORITY_QUEUE;
            }

            if (queueMap.containsKey(queueName)) {
                c.OwnerId = queueMap.get(queueName);
            }

            c.Routing_Exception__c = false;
            routedCases.add(c);
        }

        return routedCases;
    }

    /**
     * Assigns a case to a region-specific support queue.
     * Demonstrates the concept of territory-based case routing, which is
     * critical for global Service Cloud implementations with multiple
     * support centers operating in different time zones.
     *
     * Exam note: Territory management and territory-based routing are
     * distinct concepts. Territory management is for sales; for service,
     * queue assignment based on region is the standard approach.
     *
     * @param c The case to assign
     * @param region The geographic region (e.g., 'NA', 'EMEA', 'APAC')
     * @return The case with updated OwnerId
     */
    public static Case assignToQueue(Case c, String region) {
        if (c == null || String.isBlank(region)) {
            return c;
        }

        Map<String, Id> queueMap = getQueueNameToIdMap();
        String queueKey = region + '_Support';

        if (queueMap.containsKey(queueKey)) {
            c.OwnerId = queueMap.get(queueKey);
        } else if (queueMap.containsKey(MEDIUM_PRIORITY_QUEUE)) {
            // Fallback to standard queue if region-specific queue doesn't exist
            c.OwnerId = queueMap.get(MEDIUM_PRIORITY_QUEUE);
        }

        // Log routing decision for audit purposes
        logRoutingDecision(c.Id, c.OwnerId, 'Region-based: ' + region);

        return c;
    }

    /**
     * Assigns cases to the appropriate product-based queue.
     * Demonstrates how product-specific support teams handle cases
     * related to their product area - a key concept for managing
     * enterprise support organizations.
     *
     * @param cases List of cases to route by product
     * @param productQueueMap Map of product names to queue IDs
     * @return List of routed cases
     */
    public static List<Case> routeByProduct(List<Case> cases, Map<String, Id> productQueueMap) {
        List<Case> routedCases = new List<Case>();

        if (cases == null || cases.isEmpty() || productQueueMap == null || productQueueMap.isEmpty()) {
            return routedCases;
        }

        for (Case c : cases) {
            if (c == null) continue;

            if (c.Product__c != null && productQueueMap.containsKey(c.Product__c)) {
                c.OwnerId = productQueueMap.get(c.Product__c);
            }

            routedCases.add(c);
        }

        return routedCases;
    }

    /**
     * Bulk route cases using combined priority, product, and region logic.
     * This demonstrates the real-world scenario where multiple routing
     * criteria are evaluated together to determine the best queue.
     *
     * @param cases List of cases to route
     * @return List of routed cases with owner assignments
     */
    public static List<Case> routeCases(List<Case> cases) {
        List<Case> routedCases = new List<Case>();

        if (cases == null || cases.isEmpty()) {
            return routedCases;
        }

        Map<String, Id> queueMap = getQueueNameToIdMap();

        for (Case c : cases) {
            if (c == null) continue;

            // First, check for VIP account routing
            if (c.AccountId != null && isVIPAccount(c.AccountId)) {
                if (queueMap.containsKey(ENTERPRISE_QUEUE)) {
                    c.OwnerId = queueMap.get(ENTERPRISE_QUEUE);
                }
            }
            // Then, check product-based routing
            else if (c.Product__c == 'Luma') {
                if (queueMap.containsKey(LUMA_QUEUE)) {
                    c.OwnerId = queueMap.get(LUMA_QUEUE);
                }
            }
            // Fall back to priority-based routing
            else {
                routedCases.addAll(routeByPriority(new List<Case>{c}));
                continue;
            }

            routedCases.add(c);
        }

        return routedCases;
    }

    private static Map<String, Id> getQueueNameToIdMap() {
        Map<String, Id> queueMap = new Map<String, Id>();
        for (Group q : [SELECT Id, Name FROM Group WHERE Type = 'Queue' LIMIT 200]) {
            queueMap.put(q.Name, q.Id);
        }
        return queueMap;
    }

    private static Boolean isVIPAccount(Id accountId) {
        List<Account> accounts = [SELECT Id, VIP__c FROM Account WHERE Id = :accountId LIMIT 1];
        return !accounts.isEmpty() && accounts[0].VIP__c == true;
    }

    private static void logRoutingDecision(Id caseId, Id queueId, String routingType) {
        Service_Routing_Log__c log = new Service_Routing_Log__c();
        log.Case__c = caseId;
        log.Queue__c = String.valueOf(queueId);
        log.Routing_Type__c = routingType;
        log.Routed_At__c = System.now();

        if (Schema.sObjectType.Service_Routing_Log__c.isCreateable()) {
            insert log;
        }
    }
}
