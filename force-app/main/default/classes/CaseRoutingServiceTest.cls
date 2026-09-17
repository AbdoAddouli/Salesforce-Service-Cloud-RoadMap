/**
 * Test class for CaseRoutingService
 * Covers happy path, edge cases, and bulk operations.
 */
@isTest
private class CaseRoutingServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(
            Name = 'Routing Test Account',
            Type = 'Customer',
            VIP__c = true,
            AnnualRevenue = 2500000
        );
        insert acc;

        // Create queues for routing targets
        Group highQueue = new Group(Name = 'High_Priority_Support', Type = 'Queue');
        insert highQueue;

        Group standardQueue = new Group(Name = 'Standard_Support', Type = 'Queue');
        insert standardQueue;

        Group generalQueue = new Group(Name = 'General_Support', Type = 'Queue');
        insert generalQueue;

        Group enterpriseQueue = new Group(Name = 'Enterprise_Support', Type = 'Queue');
        insert enterpriseQueue;

        Group lumaQueue = new Group(Name = 'LUMA_Support', Type = 'Queue');
        insert lumaQueue;
    }

    @isTest
    static void testRouteByPriority_setsHighPriorityQueue() {
        // Given
        List<Case> cases = new List<Case>{
            new Case(Subject = 'Urgent outage', Status = 'New', Priority = 'High', Origin = 'Phone')
        };

        // When
        Test.startTest();
        List<Case> routed = CaseRoutingService.routeByPriority(cases);
        Test.stopTest();

        // Then
        System.assertEquals(1, routed.size(), 'One case should be routed');
        Id expectedQueue = [SELECT Id FROM Group WHERE Name = 'High_Priority_Support' LIMIT 1].Id;
        System.assertEquals(expectedQueue, routed[0].OwnerId, 'High priority case should route to high priority queue');
    }

    @isTest
    static void testRouteByPriority_routesLowPriorityToGeneralQueue() {
        // Given
        List<Case> cases = new List<Case>{
            new Case(Subject = 'Minor question', Status = 'New', Priority = 'Low', Origin = 'Email')
        };

        // When
        List<Case> routed = CaseRoutingService.routeByPriority(cases);

        // Then
        Id expectedQueue = [SELECT Id FROM Group WHERE Name = 'General_Support' LIMIT 1].Id;
        System.assertEquals(expectedQueue, routed[0].OwnerId, 'Low priority case should route to general queue');
    }

    @isTest
    static void testRouteByPriority_emptyListReturnsEmpty() {
        // When
        List<Case> routed = CaseRoutingService.routeByPriority(new List<Case>());
        List<Case> nullResult = CaseRoutingService.routeByPriority(null);

        // Then
        System.assertEquals(0, routed.size(), 'Empty list should produce empty result');
        System.assertEquals(0, nullResult.size(), 'Null should be handled safely');
    }

    @isTest
    static void testAssignToQueue_withRegion() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Routing Test Account' LIMIT 1];
        Case c = new Case(Subject = 'Region test', Status = 'New', Priority = 'Medium', AccountId = acc.Id);

        // When
        Case assigned = CaseRoutingService.assignToQueue(c, 'NA');

        // Then
        System.assertNotEquals(null, assigned.OwnerId, 'Case should be assigned to a queue');
        System.assertEquals(true, assigned.Routing_Exception__c == false, 'No routing exception should occur');
    }

    @isTest
    static void testAssignToQueue_withNullRegionDoesNotThrow() {
        // Given
        Case c = new Case(Subject = 'No region', Status = 'New');

        // When
        Case assigned = CaseRoutingService.assignToQueue(c, null);

        // Then
        System.assertNotEquals(null, assigned, 'Case should be returned even with null region');
        System.assertEquals(null, assigned.OwnerId, 'Owner should remain unchanged for null region');
    }

    @isTest
    static void testRouteByProduct_routesToProductQueue() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Routing Test Account' LIMIT 1];
        List<Case> cases = new List<Case>{
            new Case(Subject = 'Product issue', Status = 'New', AccountId = acc.Id, Product__c = 'Luma')
        };

        Id lumaQueueId = [SELECT Id FROM Group WHERE Name = 'LUMA_Support' LIMIT 1].Id;
        Map<String, Id> productMap = new Map<String, Id>{ 'Luma' => lumaQueueId };

        // When
        List<Case> routed = CaseRoutingService.routeByProduct(cases, productMap);

        // Then
        System.assertEquals(1, routed.size(), 'One case should route');
        System.assertEquals(lumaQueueId, routed[0].OwnerId, 'Luma cases route to LUMA queue');
    }

    @isTest
    static void testRouteByProduct_vipAccountGoesToEnterpriseQueue() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Routing Test Account' LIMIT 1];
        List<Case> cases = new List<Case>{
            new Case(Subject = 'VIP issue', Status = 'New', AccountId = acc.Id, Product__c = 'Luma')
        };

        Id enterpriseQueueId = [SELECT Id FROM Group WHERE Name = 'Enterprise_Support' LIMIT 1].Id;

        // When
        List<Case> routed = CaseRoutingService.routeCases(cases);

        // Then
        System.assertEquals(enterpriseQueueId, routed[0].OwnerId, 'VIP accounts route to enterprise queue first');
    }

    @isTest
    static void testBulkRouting_routesManyCases() {
        // Given
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 250; i++) {
            bulkCases.add(new Case(
                Subject = 'Bulk case ' + i,
                Status = 'New',
                Priority = i < 100 ? 'High' : 'Medium',
                Origin = 'Phone'
            ));
        }

        Id highQueueId = [SELECT Id FROM Group WHERE Name = 'High_Priority_Support' LIMIT 1].Id;

        // When
        Test.startTest();
        List<Case> routed = CaseRoutingService.routeByPriority(bulkCases);
        Test.stopTest();

        // Then
        System.assertEquals(250, routed.size(), 'All 250 cases should be routed');
        Integer highCount = 0;
        for (Case c : routed) {
            if (c.OwnerId == highQueueId) highCount++;
        }
        System.assertEquals(100, highCount, '100 high priority cases routed to high queue');
        System.assert(Math.Limits.getQueries() < 150, 'Should not exceed query governor in bulk');
    }

    @isTest
    static void testRoutingLog_createdForRegionRouting() {
        // Given
        Account acc = [SELECT Id FROM Account WHERE Name = 'Routing Test Account' LIMIT 1];
        insert new Case(Subject = 'Log test', Status = 'New', AccountId = acc.Id, Priority = 'Medium');

        // When
        Case c = [SELECT Id, OwnerId FROM Case WHERE Subject = 'Log test' LIMIT 1];
        CaseRoutingService.assignToQueue(c, 'EMEA');

        // Then
        List<Service_Routing_Log__c> logs = [SELECT Id, Routing_Type__c, Case__c FROM Service_Routing_Log__c];
        System.assert(logs.size() > 0, 'Routing log should exist');
        System.assertEquals('Region-based: EMEA', logs[0].Routing_Type__c, 'Routing type should record region');
    }
}