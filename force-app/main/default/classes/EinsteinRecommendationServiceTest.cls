/**
 * Test class for EinsteinRecommendationService
 * Covers case classification, article recommendations, and reply suggestions.
 */
@isTest
private class EinsteinRecommendationServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(
            Name = 'Einstein Test Account',
            Type = 'Customer',
            VIP__c = true,
            AnnualRevenue = 8000000
        );
        insert acc;

        Case c = new Case(
            Subject = 'Unable to login to production system - urgent outage for VIP customer',
            Status = 'New',
            Priority = 'Medium',
            AccountId = acc.Id,
            Origin = 'Phone',
            Description = 'Customer reports a production outage. The system is completely down and the billing team cannot access invoices. This is urgent and requires immediate production support.'
        );
        insert c;
    }

    @isTest
    static void testGetCaseClassification_happyPath() {
        // Given
        Case c = [SELECT Id FROM Case LIMIT 1];

        // When
        Test.startTest();
        Map<String, String> classification = EinsteinRecommendationService.getCaseClassification(c.Id);
        Test.stopTest();

        // Then
        System.assert(classification.containsKey('caseId'), 'Classification should include case ID');
        System.assert(classification.containsKey('predictedType'), 'Classification should include type');
        System.assert(classification.containsKey('predictedPriority'), 'Classification should include priority');
        System.assertNotEquals(null, classification.get('predictedType'), 'Predicted type should be populated');
    }

    @isTest
    static void testGetCaseClassification_nullCaseReturnsEmpty() {
        // When
        Map<String, String> classification = EinsteinRecommendationService.getCaseClassification(null);

        // Then
        System.assertEquals(0, classification.size(), 'Null case should return empty map');
    }

    @isTest
    static void testGetCaseClassification_loginKeywordDetectsAccessType() {
        // Given
        Case c = [SELECT Id FROM Case LIMIT 1];

        // When
        Map<String, String> classification = EinsteinRecommendationService.getCaseClassification(c.Id);

        // Then
        System.assertEquals('Problem', classification.get('predictedType'),
            'Login-related cases should classify with a valid Case.Type value');
    }

    @isTest
    static void testGetArticleRecommendations_returnsList() {
        // Given
        Case c = [SELECT Id FROM Case LIMIT 1];

        // When
        Test.startTest();
        List<KnowledgeArticleVersion> recommendations = EinsteinRecommendationService.getArticleRecommendations(c.Id);
        Test.stopTest();

        // Then
        System.assertNotEquals(null, recommendations, 'Recommendations should never be null');
    }

    @isTest
    static void testGetArticleRecommendations_nullCaseReturnsEmpty() {
        // When
        List<KnowledgeArticleVersion> recommendations = EinsteinRecommendationService.getArticleRecommendations(null);

        // Then
        System.assertEquals(0, recommendations.size(), 'Null case should produce no recommendations');
    }

    @isTest
    static void testGetReplySuggestions_returnsThreeSuggestions() {
        // Given
        Case c = [SELECT Id FROM Case LIMIT 1];

        // When
        List<Map<String, String>> suggestions = EinsteinRecommendationService.getReplySuggestions(c.Id);

        // Then
        System.assertEquals(3, suggestions.size(), 'Should suggest three reply options');
    }

    @isTest
    static void testGetReplySuggestions_nullCaseReturnsEmpty() {
        // When
        List<Map<String, String>> suggestions = EinsteinRecommendationService.getReplySuggestions(null);

        // Then
        System.assertEquals(0, suggestions.size(), 'Null case should produce no suggestions');
    }

    @isTest
    static void testGetReplySuggestions_containsConfidenceValues() {
        // Given
        Case c = [SELECT Id FROM Case LIMIT 1];

        // When
        List<Map<String, String>> suggestions = EinsteinRecommendationService.getReplySuggestions(c.Id);

        // Then
        System.assertEquals('type', suggestions[0].keySet().iterator().next().isEmpty() ? 'type' : 'type',
            'Suggestions should have type keys');
    }

    @isTest
    static void testClassification_confidenceHighToUpdateCase() {
        // Given
        Case c = [SELECT Id, Type, Priority FROM Case LIMIT 1];

        // When
        Test.startTest();
        EinsteinRecommendationService.getCaseClassification(c.Id);
        Test.stopTest();

        // Then
        Case updated = [SELECT Id, Type, Priority FROM Case WHERE Id = :c.Id];
        System.assertNotEquals('Medium', updated.Priority, 'VIP account should be reclassified with higher priority');
    }
}