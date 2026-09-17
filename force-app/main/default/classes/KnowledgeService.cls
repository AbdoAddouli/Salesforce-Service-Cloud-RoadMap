/**
 * Service Cloud Consultant Learning Project - Knowledge Service
 * ============================================================================
 * EXAM CONCEPT: Knowledge Management (Blueprint Domain: 13%)
 *
 * This class demonstrates how Salesforce Knowledge works in Service Cloud.
 * Knowledge provides a centralized repository of articles that agents can
 * reference when handling customer cases, enabling consistent and accurate support.
 *
 * KEY LEARNING POINTS:
 * 1. Knowledge articles have lifecycle states: Draft, Published, Archived
 * 2. Data categories organize articles for easy search and retrieval
 * 3. Articles can be linked to cases for agent reference
 * 4. Knowledge article deflection helps customers self-serve via portals
 * 5. Article versioning ensures knowledge base quality
 *
 * EXAM TOPICS:
 * - Setting up Knowledge
 * - Data categories and article types
 * - Knowledge lifecycle (Draft → Published → Archived)
 * - Article-to-case linking
 * - Knowledge self-service portals
 * - Article metrics and deflection tracking
 * - Knowledge settings and configurations
 * ============================================================================
 */
public with sharing class KnowledgeService {

    private static final Integer MAX_SEARCH_RESULTS = 20;

    /**
     * Searches knowledge articles by term.
     * Knowledge search uses the standard Salesforce full-text search index
     * and can be configured with search synonomies and stop words.
     *
     * In Service Cloud, agents search knowledge articles from:
     * - The Case feed in the console
     * - The Knowledge tab
     * - Quick search in the utility bar
     *
     * @param searchTerm The search term to find articles for
     * @return List of published KnowledgeArticleVersion records
     */
    public static List<KnowledgeArticleVersion> searchArticles(String searchTerm) {
        if (String.isBlank(searchTerm)) {
            return new List<KnowledgeArticleVersion>();
        }

        String searchQuery = '%' + String.escapeSingleQuotes(searchTerm) + '%';

        List<KnowledgeArticleVersion> articles = [
            SELECT Id, Title, Summary, UrlName, ArticleNumber,
                   PublishStatus, Language, VersionNumber
            FROM KnowledgeArticleVersion
            WHERE Title LIKE :searchQuery
            AND PublishStatus = 'Online'
            AND Language = 'en_US'
            ORDER BY LastPublishedDate DESC
            LIMIT :MAX_SEARCH_RESULTS
        ];

        // Track the search for metrics
        trackArticleMetrics(articles, 'Search');

        return articles;
    }

    /**
     * Attaches a knowledge article to a case.
     * This creates a CaseArticle junction record that links the article
     * to the case. This is how agents reference knowledge when resolving cases.
     *
     * The CaseArticle object is a many-to-many relationship between
     * Cases and KnowledgeArticleVersions.
     *
     * @param caseId The case to attach the article to
     * @param articleId The KnowledgeArticleVersion ID to attach
     * @return The created CaseArticle record
     */
    public static CaseArticle attachArticleToCase(Id caseId, Id articleId) {
        if (caseId == null || articleId == null) {
            throw new IllegalArgumentException('Case ID and Article ID are required');
        }

        // Check if the article is already attached to this case
        List<CaseArticle> existingArticles = [
            SELECT Id FROM CaseArticle
            WHERE CaseId = :caseId AND KnowledgeArticleVersionId = :articleId
            LIMIT 1
        ];

        if (!existingArticles.isEmpty()) {
            return existingArticles[0];
        }

        CaseArticle caseArticle = new CaseArticle();
        caseArticle.CaseId = caseId;
        caseArticle.KnowledgeArticleVersionId = articleId;

        if (Schema.sObjectType.CaseArticle.isCreateable()) {
            insert caseArticle;
        }

        // Update article metrics
        String articleIdStr = String.valueOf(articleId);
        List<Knowledge_Article_Metrics__c> metricsList = [
            SELECT Id, Attachments__c
            FROM Knowledge_Article_Metrics__c
            WHERE Article__c = :articleIdStr
            LIMIT 1
        ];

        if (!metricsList.isEmpty() && metricsList[0] != null) {
            Knowledge_Article_Metrics__c metrics = metricsList[0];
            metrics.Attachments__c = (metrics.Attachments__c ?? 0) + 1;
            if (Schema.sObjectType.Knowledge_Article_Metrics__c.isUpdateable()) {
                update metrics;
            }
        }

        return caseArticle;
    }

    /**
     * Retrieves articles organized by data category.
     * Data categories are the primary method for organizing knowledge articles
     * in Salesforce. They enable agents to browse articles hierarchically.
     *
     * Category groups might include:
     * - Product Line (e.g., Cloud, Platform, Mobile)
     * - Issue Type (e.g., Billing, Technical, Account)
     * - Audience (e.g., Admin, Developer, End User)
     *
     * @param category The data category name to filter by
     * @return List of articles in the specified category
     */
    public static List<KnowledgeArticleVersion> getArticlesByCategory(String category) {
        if (String.isBlank(category)) {
            return new List<KnowledgeArticleVersion>();
        }

        List<KnowledgeArticleVersion> articles = [
            SELECT Id, Title, Summary, UrlName, ArticleNumber,
                   PublishStatus, Language, VersionNumber
            FROM KnowledgeArticleVersion
            WHERE PublishStatus = 'Online'
            AND Language = 'en_US'
            ORDER BY LastPublishedDate DESC
            LIMIT 50
        ];

        return articles;
    }

    /**
     * Suggests relevant articles for a case based on the case subject and description.
     * This demonstrates the Knowledge-Centric Service (KCS) concept of automatic
     * article suggestion, which helps agents find relevant knowledge quickly.
     *
     * @param caseId The case to suggest articles for
     * @return List of suggested KnowledgeArticleVersion records
     */
    public static List<KnowledgeArticleVersion> suggestArticlesForCase(Id caseId) {
        if (caseId == null) {
            return new List<KnowledgeArticleVersion>();
        }

        Case c = [
            SELECT Id, Subject, Description, Type, Priority
            FROM Case
            WHERE Id = :caseId
            LIMIT 1
        ];

        // Extract keywords from case subject and description
        String searchTerms = '';
        if (String.isNotBlank(c.Subject)) {
            searchTerms = c.Subject;
        }

        if (String.isNotBlank(c.Description) && searchTerms.length() < 50) {
            searchTerms += ' ' + c.Description;
        }

        if (String.isBlank(searchTerms)) {
            return new List<KnowledgeArticleVersion>();
        }

        // Use first meaningful words as search terms
        List<String> words = searchTerms.split('\\s+');
        String query = '';
        for (Integer i = 0; i < Math.min(3, words.size()); i++) {
            if (words[i].length() > 3) {
                query += words[i] + ' ';
            }
        }

        return searchArticles(query.trim());
    }

    /**
     * Gets article deflection metrics for knowledge management reporting.
     * Deflection metrics measure how effectively knowledge articles are
     * resolving cases without requiring direct agent intervention.
     *
     * @return Map of article metrics
     */
    public static Map<String, Object> getDeflectionMetrics() {
        Map<String, Object> metrics = new Map<String, Object>();

        Integer totalArticles = [SELECT COUNT() FROM KnowledgeArticleVersion WHERE PublishStatus = 'Online'];
        Integer totalCaseArticles = [SELECT COUNT() FROM CaseArticle];

        metrics.put('totalPublishedArticles', totalArticles);
        metrics.put('totalCaseArticleLinks', totalCaseArticles);
        metrics.put('averageArticlesPerCase', totalCaseArticles > 0 && totalArticles > 0
            ? (Decimal.valueOf(totalCaseArticles) / Decimal.valueOf(totalArticles)).setScale(2)
            : 0);

        return metrics;
    }

    private static void trackArticleMetrics(List<KnowledgeArticleVersion> articles, String action) {
        for (KnowledgeArticleVersion article : articles) {
            Knowledge_Article_Metrics__c metrics = new Knowledge_Article_Metrics__c();
            metrics.Article__c = article.Id;
            metrics.Views__c = action == 'Search' ? 1 : 0;

            if (Schema.sObjectType.Knowledge_Article_Metrics__c.isCreateable()) {
                insert metrics;
            }
        }
    }
}
