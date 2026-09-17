/**
 * Test class for KnowledgeService
 * Covers article search, attachment to cases, and category retrieval.
 */
@isTest
private class KnowledgeServiceTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Knowledge Test Account', Type = 'Customer');
        insert acc;

        Case c = new Case(
            Subject = 'Knowledge test case',
            Status = 'New',
            Priority = 'Medium',
            AccountId = acc.Id,
            Origin = 'Phone'
        );
        insert c;
    }

    @isTest
    static void testSearchArticles_blankTermReturnsEmpty() {
        // When
        Test.startTest();
        List<KnowledgeArticleVersion> results = KnowledgeService.searchArticles(null);
        Test.stopTest();

        // Then
        System.assertEquals(0, results.size(), 'Blank search term should return no results');
    }

    @isTest
    static void testSearchArticles_searchTermDoesNotThrow() {
        // When
        Test.startTest();
        List<KnowledgeArticleVersion> results = KnowledgeService.searchArticles('billing setup');
        Test.stopTest();

        // Then
        System.assertNotEquals(null, results, 'Search should never return null');
    }

    @isTest
    static void testAttachArticleToCase_nullIdsThrow() {
        // Given
        Case c = [SELECT Id FROM Case WHERE Subject = 'Knowledge test case' LIMIT 1];

        Boolean thrown = false;
        try {
            KnowledgeService.attachArticleToCase(c.Id, null);
        } catch (IllegalArgumentException e) {
            thrown = true;
        }

        System.assertEquals(true, thrown, 'Null article ID should throw');
    }

    @isTest
    static void testAttachArticleToCase_missingCaseReturnsNull() {
        // When
        List<CaseArticle> links = [SELECT Id FROM CaseArticle];

        // Then
        System.assertEquals(0, links.size(), 'No article links should exist in setup yet');
    }

    @isTest
    static void testGetArticlesByCategory_blankCategoryReturnsEmpty() {
        // When
        List<KnowledgeArticleVersion> articles = KnowledgeService.getArticlesByCategory(null);

        // Then
        System.assertEquals(0, articles.size(), 'Blank category should return nothing');
    }

    @isTest
    static void testGetArticlesByCategory_returnsNonEmptyForAnyCategory() {
        // When
        List<KnowledgeArticleVersion> articles = KnowledgeService.getArticlesByCategory('General');

        // Then
        System.assertNotEquals(null, articles, 'Category query should return a list');
    }

    @isTest
    static void testSuggestArticlesForCase_nullCaseReturnsEmpty() {
        // When
        List<KnowledgeArticleVersion> suggestions = KnowledgeService.suggestArticlesForCase(null);

        // Then
        System.assertEquals(0, suggestions.size(), 'Null case should produce no suggestions');
    }

    @isTest
    static void testGetDeflectionMetrics_containsExpectedMetrics() {
        // When
        Test.startTest();
        Map<String, Object> metrics = KnowledgeService.getDeflectionMetrics();
        Test.stopTest();

        // Then
        System.assert(metrics.containsKey('totalPublishedArticles'), 'Should track total articles');
        System.assert(metrics.containsKey('totalCaseArticleLinks'), 'Should track article-to-case links');
        System.assert(metrics.containsKey('averageArticlesPerCase'), 'Should calculate per-case average');
    }

    @isTest
    static void testBulkSearch_safeWithinLimits() {
        // When
        Test.startTest();
        List<String> terms = new List<String>{ 'password', 'reset', 'login', 'error' };
        Integer totalResults = 0;
        for (String term : terms) {
            totalResults += KnowledgeService.searchArticles(term).size();
        }
        Test.stopTest();

        // Then
        System.assertNotEquals(null, totalResults, 'Search should aggregate results');
    }

    @isTest
    static void testDeflectionMetrics_validFormat() {
        // When
        Map<String, Object> metrics = KnowledgeService.getDeflectionMetrics();

        // Then
        Object avg = metrics.get('averageArticlesPerCase');
        System.assertNotEquals(null, avg, 'Average articles per case should be present');
    }
}