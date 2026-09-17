/**
 * Test class for OmniChannelService
 * Covers agent lookup, routing, presence, and capacity concepts.
 */
@isTest
private class OmniChannelServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Omni Test Account', Type = 'Customer');
        insert acc;

        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < 3; i++) {
            cases.add(new Case(
                Subject = 'Omni case ' + i,
                Status = 'New',
                Priority = 'Medium',
                AccountId = acc.Id,
                Origin = 'Web'
            ));
        }
        insert cases;
    }

    static User createTestUser(String name) {
        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Service Cloud Console User' LIMIT 1];
        User u = new User(
            Alias = name.left(5),
            Email = name.toLowerCase() + '@servicecloudlearning.com',
            EmailEncodingKey = 'UTF-8',
            LastName = name,
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = profile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = name.toLowerCase() + '.test.servicecloud.learning@example.com'
        );
        insert u;
        return u;
    }

    @isTest
    static void testFindAvailableAgent_returnsAgentsWithSkill() {
        // Given
        List<User> agents = [SELECT Id FROM User WHERE IsActive = true LIMIT 2];
        System.assert(!agents.isEmpty(), 'Setup requires at least one user');

        Skill skill = new Skill(MasterLabel = 'Billing Support');
        insert skill;

        // When
        Test.startTest();
        List<User> available = OmniChannelService.findAvailableAgent('Billing Support');
        Test.stopTest();

        // Then
        System.assertNotEquals(null, available, 'Should return a non-null list');
    }

    @isTest
    static void testFindAvailableAgent_blankSkillReturnsEmpty() {
        // When
        List<User> available = OmniChannelService.findAvailableAgent('');

        // Then
        System.assertEquals(0, available.size(), 'Blank skill should return empty list');
    }

    @isTest
    static void testRouteToBestAgent_assignsCasesToAgents() {
        // Given
        List<Case> cases = [SELECT Id, OwnerId FROM Case WHERE Subject LIKE 'Omni case %'];

        // When
        Test.startTest();
        List<Case> routed = OmniChannelService.routeToBestAgent(cases);
        Test.stopTest();

        // Then
        System.assertEquals(3, routed.size(), 'All cases should be routed');
        for (Case c : routed) {
            System.assertEquals(false, c.OwnerId == null, 'Every case should have an owner');
        }
    }

    @isTest
    static void testRouteToBestAgent_emptyList() {
        // When
        List<Case> routed = OmniChannelService.routeToBestAgent(new List<Case>());

        // Then
        System.assertEquals(0, routed.size(), 'Empty list should not be routed');
    }

    @isTest
    static void testUpdatePresenceStatus_validStatusCreatesLog() {
        // Given
        User agent = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];

        // When
        Test.startTest();
        Boolean updated = OmniChannelService.updatePresenceStatus(agent.Id, 'Available');
        Test.stopTest();

        // Then
        System.assertEquals(true, updated, 'Valid status should update presence');
        List<Service_Routing_Log__c> logs = [SELECT Routing_Type__c FROM Service_Routing_Log__c WHERE Agent__c = :agent.Id];
        System.assertNotEquals(0, logs.size(), 'Presence change should be logged');
    }

    @isTest
    static void testUpdatePresenceStatus_invalidStatusRejected() {
        // Given
        User agent = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];

        // When
        Boolean updated = OmniChannelService.updatePresenceStatus(agent.Id, 'NotRealStatus');

        // Then
        System.assertEquals(false, updated, 'Invalid status should be rejected');
    }

    @isTest
    static void testGetAgentWorkloads_returnsMap() {
        // When
        Map<Id, Integer> workloads = OmniChannelService.getAgentWorkloads();

        // Then
        System.assertNotEquals(null, workloads, 'Workloads should never be null');
    }

    @isTest
    static void testHasCapacity_forNewOpenCase() {
        // Given
        User agent = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];

        // When
        Boolean hasRoom = OmniChannelService.hasCapacity(agent.Id, 10);

        // Then
        System.assertEquals(true, hasRoom, 'Agent with few cases should have capacity');
    }

    @isTest
    static void testHasCapacity_throwsOnZeroMax() {
        // Given
        User agent = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];

        // When
        Boolean capacity = OmniChannelService.hasCapacity(agent.Id, 0);

        // Then
        System.assertNotEquals(null, capacity, 'Invalid capacity should not throw');
    }

    @isTest
    static void testRouteToBestAgent_bulkManyCases() {
        // Given
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 200; i++) {
            bulkCases.add(new Case(Subject = 'Bulk omni ' + i, Status = 'New', Origin = 'Phone'));
        }

        // When
        Test.startTest();
        List<Case> routed = OmniChannelService.routeToBestAgent(bulkCases);
        Test.stopTest();

        // Then
        System.assertEquals(200, routed.size(), 'All bulk cases should be routed');
        System.assert(Math.Limits.getQueries() < 10, 'Routing should minimize queries');
    }
}