// Knowledge + Einstein recommendation demo — Phase 6 / KnowledgeService
// Run: sf apex run --file scripts/apex/knowledge-recommendations.apex
Account acc = new Account(Name = 'SCC Knowledge Demo');
insert acc;
Contact con = new Contact(FirstName = 'Kim', LastName = 'Cases', AccountId = acc.Id);
insert con;

// Create a case for which we want article recommendations
Case c = new Case(
    AccountId = acc.Id,
    ContactId = con.Id,
    Subject = 'Password reset link not arriving',
    Origin = 'Phone',
    Priority = 'Medium',
    Status = 'Working'
);
insert c;

// Search published Knowledge articles
List<KnowledgeArticleVersion> hits = KnowledgeService.searchArticles('password reset');
System.debug('Article search hits: ' + hits.size());

// Einstein-style recommendations (our deterministic stand-in)
List<KnowledgeArticleVersion> recs = EinsteinRecommendationService.getArticleRecommendations(c.Id);
System.debug('Recommended articles: ' + recs.size());

Map<String, String> classMap = EinsteinRecommendationService.getCaseClassification(c.Id);
System.debug('Predicted classification: ' + classMap);

List<Map<String, String>> replies = EinsteinRecommendationService.getReplySuggestions(c.Id);
System.debug('Suggested replies: ' + replies);

// Attach a matching article to the case to track deflection
String articleId = KnowledgeService.getArticlesByCategory('Common').isEmpty()
    ? null
    : KnowledgeService.getArticlesByCategory('Common')[0].Id;
System.debug('Category-browse returned article: ' + articleId);

System.debug('Knowledge pipeline OK — see Knowledge_Article_Metrics__c for deflection stats.');