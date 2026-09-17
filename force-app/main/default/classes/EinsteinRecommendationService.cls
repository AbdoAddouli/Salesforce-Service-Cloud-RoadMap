/**
 * Service Cloud Consultant Learning Project - Einstein Recommendation Service
 * ============================================================================
 * EXAM CONCEPT: Einstein AI for Service (Blueprint Domain: 13%)
 *
 * This class demonstrates how Einstein AI features enhance Service Cloud.
 * Einstein for Service uses artificial intelligence to improve agent
 * productivity, boost case deflection, and provide personalized support.
 *
 * KEY EINSTEIN FOR SERVICE FEATURES:
 * 1. Intent & Sentiment Analysis: Classifies incoming service requests and
 *    detects customer sentiment
 * 2. Article Recommendations: Recommends relevant knowledge articles
 * 3. Reply Suggestions: Provides recommended responses to agents
 * 4. Service Replies: Automates responses using Einstein language models
 * 5. Conversation Mining: Analyzes service conversations to surface insights
 * 6. Next Best Action: Recommends the best next step for each interaction
 *
 * EXAM TOPICS:
 * - Einstein Case Classification
 * - Einstein Reply Recommendations
 * - Einstein Article Recommendations
 * - Einstein Conversation Insights
 * - Service Replies setup
 * - Managing Einstein AI accuracy and confidence thresholds
 * - Omni-Channel integration with Einstein
 * ============================================================================
 */
public with sharing class EinsteinRecommendationService {

    private static final Integer CONFIDENCE_THRESHOLD = 70;

    /**
     * Classifies a case using Einstein Case Classification.
     * Einstein automatically assigns a subject, type, and priority to cases
     * based on historical patterns. This dramatically reduces agent
     * classification time and improves routing accuracy.
     *
     * Classification of Einstein Case Classification:
     * - Subtype and subject suggestions based on historical cases
     * - Type and priority assignments based on Einstein predictions
     * - Works with Omni-Channel for intelligent routing
     *
     * @param caseId The case to classify
     * @return Map containing classification result (type, priority, subject)
     */
    public static Map<String, String> getCaseClassification(Id caseId) {
        Map<String, String> classification = new Map<String, String>();

        if (caseId == null) {
            return classification;
        }

        Case c = [SELECT Id, Subject, Description, Type, Priority, Origin FROM Case WHERE Id = :caseId LIMIT 1];

        // Simulate Einstein prediction logic based on case attributes
        // In a real implementation, this would call the Einstein Prediction API
        String predictedType = classifyCaseType(c);
        String predictedPriority = predictPriority(c);

        classification.put('caseId', caseId);
        classification.put('predictedType', predictedType);
        classification.put('predictedPriority', predictedPriority);
        classification.put('origin', c.Origin);
        classification.put('confidence', String.valueOf(getConfidenceScore(c)));

        // If Einstein prediction is confident, update the case (simulating
        // Einstein Case Classification auto-apply behavior)
        if (getConfidenceScore(c) >= CONFIDENCE_THRESHOLD) {
            List<Case> casesToUpdate = new List<Case>();
            c.Type = predictedType;
            c.Priority = predictedPriority;
            casesToUpdate.add(c);

            if (Schema.sObjectType.Case.isUpdateable()) {
                update casesToUpdate;
            }
        }

        return classification;
    }

    /**
     * Gets Einstein Article Recommendations for a case.
     * Einstein analyzes the case content and recommends the best knowledge
     * articles to help resolve the issue quickly. This is a core feature
     * of Knowledge + Einstein integration.
     *
     * @param caseId The case to get recommendations for
     * @return List of recommended KnowledgeArticleVersion records
     */
    public static List<KnowledgeArticleVersion> getArticleRecommendations(Id caseId) {
        List<KnowledgeArticleVersion> recommendations = new List<KnowledgeArticleVersion>();

        if (caseId == null) {
            return recommendations;
        }

        Case c = [SELECT Id, Subject, Description, Type FROM Case WHERE Id = :caseId LIMIT 1];

        // Extract search terms from case data
        String searchTerm = c.Subject;
        if (String.isNotBlank(c.Description)) {
            searchTerm += ' ' + c.Description;
        }

        if (String.isBlank(searchTerm)) {
            return recommendations;
        }

        // Simulate Einstein recommendation by searching matching articles
        String query = '%';
        List<String> keywords = searchTerm.split('\\s+');
        for (Integer i = 0; i < Math.min(3, keywords.size()); i++) {
            if (keywords[i].length() > 2) {
                query += keywords[i] + '% ';
            }
        }

        if (query.length() > 1) {
            query = query.substringBeforeLast('% ') + '%';
        }

        recommendations = [
            SELECT Id, Title, Summary, ArticleNumber, VersionNumber
            FROM KnowledgeArticleVersion
            WHERE Title LIKE :query
            AND PublishStatus = 'Online'
            ORDER BY LastPublishedDate DESC
            LIMIT 5
        ];

        return recommendations;
    }

    /**
     * Gets Einstein Reply Suggestions for a case.
     * Einstein suggests replies RGA (Response Generation Assistant) style,
     * providing agents with recommended responses they can quickly customize
     * and send to customers, improving handle time and consistency.
     *
     * @param caseId The case to generate reply suggestions for
     * @return List of suggested reply templates with confidence
     */
    public static List<Map<String, String>> getReplySuggestions(Id caseId) {
        List<Map<String, String>> suggestions = new List<Map<String, String>>();

        if (caseId == null) {
            return suggestions;
        }

        Case c = [SELECT Id, Subject, Agent_Name__c, ContactId FROM Case WHERE Id = :caseId LIMIT 1];

        // Simulate Einstein-generated reply recommendations
        Map<String, String> suggestion1 = new Map<String, String>();
        suggestion1.put('type', 'Initial greeting');
        suggestion1.put('confidence', '87');
        suggestion1.put('message', 'Hello, thank you for contacting us about "' + c.Subject + '". ' +
            'I have reviewed your issue and will be happy to help resolve it.');

        Map<String, String> suggestion2 = new Map<String, String>();
        suggestion2.put('type', 'Request for more info');
        suggestion2.put('confidence', '76');
        suggestion2.put('message', 'To better assist you with this issue, could you please provide ' +
            'additional details about the problem you are experiencing?');

        Map<String, String> suggestion3 = new Map<String, String>();
        suggestion3.put('type', 'Resolution confirmation');
        suggestion3.put('confidence', '71');
        suggestion3.put('message', 'Thank you for confirming. Your issue has been resolved. ' +
            'Please let us know if you need further assistance.');

        suggestions.add(suggestion1);
        suggestions.add(suggestion2);
        suggestions.add(suggestion3);

        return suggestions;
    }

    /**
     * Classifies a case type based on the case description.
     * This simulates the Einstein intent recognition capability.
     * Returned values are valid Case.Type standard picklist values.
     *
     * @param c The case to classify
     * @return The predicted case type (standard Case.Type value)
     */
    private static String classifyCaseType(Case c) {
        String normalizedText = (c.Subject + ' ' + c.Description).toLowerCase();

        if (normalizedText.contains('invoice') || normalizedText.contains('bill') || normalizedText.contains('payment')) {
            return 'Prospect Billing Question';
        } else if (normalizedText.contains('login') || normalizedText.contains('password') || normalizedText.contains('access')) {
            return 'Problem';
        } else if (normalizedText.contains('error') || normalizedText.contains('bug') || normalizedText.contains('crash')) {
            return 'Problem';
        } else if (normalizedText.contains('order') || normalizedText.contains('shipping') || normalizedText.contains('delivery')) {
            return 'Other';
        }

        return 'Question';
    }

    /**
     * Predicts the case priority based on case attributes and sentiment.
     *
     * @param c The case to predict priority for
     * @return The predicted priority
     */
    private static String predictPriority(Case c) {
        // VIP accounts and urgent keywords escalate priority
        if (c.AccountId != null) {
            List<Account> accounts = [SELECT Id, VIP__c, AnnualRevenue FROM Account WHERE Id = :c.AccountId LIMIT 1];
            if (!accounts.isEmpty() && (accounts[0].VIP__c == true ||
                (accounts[0].AnnualRevenue != null && accounts[0].AnnualRevenue >= 5000000))) {
                return 'High';
            }
        }

        String normalizedText = (c.Subject + ' ' + c.Description).toLowerCase();
        if (normalizedText.contains('urgent') || normalizedText.contains('emergency') ||
            normalizedText.contains('production down') || normalizedText.contains('outage')) {
            return 'Critical';
        }

        return 'Medium';
    }

    /**
     * Simulates a confidence score for Einstein predictions based on
     * how much data is available for the case.
     *
     * @param c The case to score
     * @return Confidence percentage
     */
    private static Integer getConfidenceScore(Case c) {
        Integer baseConfidence = 60;

        if (String.isNotBlank(c.Subject) && c.Subject.length() > 20) {
            baseConfidence += 10;
        }

        if (String.isNotBlank(c.Description) && c.Description.length() > 50) {
            baseConfidence += 15;
        }

        if (c.Origin != null) {
            baseConfidence += 5;
        }

        return Math.min(95, baseConfidence);
    }
}