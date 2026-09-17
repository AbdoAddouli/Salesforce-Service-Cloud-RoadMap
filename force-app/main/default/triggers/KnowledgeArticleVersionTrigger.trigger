/**
 * KnowledgeArticleVersionTrigger - Validates publish state transitions for
 * Knowledge articles. Articles cannot jump directly from Draft to Archived,
 * and archived articles should be routed through the proper lifecycle.
 *
 * EXAM TOPIC: Knowledge Management (Blueprint 13%)
 */
trigger KnowledgeArticleVersionTrigger on KnowledgeArticleVersion (before insert, before update) {

    if (TriggerHandlerService.shouldRun('KnowledgeArticleVersionTrigger')) {
        switch on Trigger.operationType {
            when BEFORE_INSERT {
                // Keep only validated drafts and published versions in the KB
                for (KnowledgeArticleVersion article : Trigger.new) {
                    if (String.isBlank(article.Title)) {
                        article.addError('Knowledge articles require a title.');
                    }
                }
            }
            when BEFORE_UPDATE {
                Map<Id, SObject> oldMap = Trigger.oldMap;
                for (KnowledgeArticleVersion article : Trigger.new) {
                    KnowledgeArticleVersion oldArticle = (KnowledgeArticleVersion) oldMap.get(article.Id);
                    if (oldArticle == null) continue;

                    // Prevent invalid state transition: Archived cannot go back to Published directly
                    if (oldArticle.PublishStatus == 'Archived' && article.PublishStatus == 'Online') {
                        article.addError('Archived articles cannot be republished. Create a new article version instead.');
                    }
                }
            }
        }
    }
}