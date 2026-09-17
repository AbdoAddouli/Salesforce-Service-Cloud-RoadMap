# Knowledge Management

## Overview

Salesforce Knowledge is the knowledge management system integrated into Service Cloud. It provides a centralized repository for articles that help agents resolve cases faster and enable customers to self-serve through portals. This guide covers the knowledge data model, article lifecycle, authoring best practices, and integration with case management and Experience Cloud.

Knowledge articles are the building blocks of a successful self-service strategy. They reduce case volume, improve first-call resolution, and ensure consistent information delivery across all channels.

## Core Concepts

### Knowledge Article Types

| Article Type | Description | Use Case |
|--------------|-------------|----------|
| Standard Article | Single-type articles | General knowledge base |
| Q&A Article | Question and answer format | FAQ management |
| How-To Article | Step-by-step instructions | Process documentation |
| Reference Article | Detailed specifications | Product documentation |
| Custom Article Types | Organization-specific | Specialized content |

### Knowledge Data Model

| Object | Description | Key Fields |
|--------|-------------|------------|
| Knowledge__kav | Article metadata | Title, Summary, Article Number |
| KnowledgeArticleVersion | Version management | VersionNumber, PublishStatus |
| Knowledge__DataCategory | Classification | DataCategoryGroupName |
| KnowledgeArticleItem | Article content | ArticleBody__c |

### Article Lifecycle

| Status | Description | Visibility |
|--------|-------------|------------|
| Draft | Being authored | Author only |
| Published | Live and visible | All users |
| Archived | No longer active | Administrators |
| Expired | Past expiration date | Administrators |

### Data Categories

| Purpose | Description | Implementation |
|---------|-------------|----------------|
| Article Classification | Organize articles by topic | Data Category Groups |
| Search Filtering | Narrow search results | Category assignments |
| Access Control | Control article visibility | Category-based sharing |
| Reporting | Track article usage | Category-based reports |

## Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| Article Authoring | Rich text editing | Quality content creation |
| Version Control | Track changes | Content accuracy |
| Data Categories | Article classification | Organized knowledge base |
| Search Optimization | Full-text search | Quick article discovery |
| Case-to-Article Linking | Link articles to cases | Consistent resolution |
| Knowledge Metrics | Usage analytics | Content optimization |
| Multi-language | Article translations | Global support |
| Expiration Dates | Auto-archive old content | Fresh knowledge base |

## Step-by-Step: Knowledge Setup

### Step 1: Enable Knowledge

```
// Knowledge Setup
// Setup > Customize > Knowledge > Settings

// Enable Knowledge: ✅
// Article Versioning: ✅
// Multiple Languages: ✅ (if needed)
// Knowledge Fields: Configure custom fields
```

### Step 2: Create Article Types

```apex
// Knowledge Article Type Configuration
// Setup > Customize > Knowledge > Article Types

// Article Type: Troubleshooting Guide
// Fields:
// - Problem_Description__c (Long Text)
// - Root_Cause__c (Long Text)
// - Resolution_Steps__c (Long Text)
// - Affected_Products__c (Multi-Select Picklist)
// - Resolution_Time__c (Number)

// Article Type: How-To Guide
// Fields:
// - Prerequisites__c (Long Text)
// - Step_1__c through Step_10__c (Long Text)
// - Expected_Result__c (Long Text)
// - Troubleshooting__c (Long Text)

// Article Type: FAQ
// Fields:
// - Question__c (Long Text)
// - Answer__c (Long Text)
// - Related_Articles__c (Text)
```

### Step 3: Configure Data Categories

```apex
// Data Category Configuration
// Setup > Customize > Knowledge > Data Categories

// Category Group: Product Line
// Categories:
// - Enterprise Suite
//   - Enterprise CRM
//   - Enterprise ERP
// - Professional
//   - Professional CRM
//   - Professional Analytics
// - Basic
//   - Basic CRM
//   - Basic Support

// Category Group: Issue Type
// Categories:
// - Technical Issues
//   - Installation
//   - Configuration
//   - Performance
// - Billing Issues
//   - Payment
//   - Subscription
//   - Refund
// - Account Issues
//   - Access
//   - Permissions
//   - Data
```

### Step 4: Configure Knowledge Settings

```apex
// Knowledge Settings
// Setup > Customize > Knowledge > Settings

// Search Settings:
// - Enable Full-Text Search: ✅
// - Search Results per Page: 10
// - Search Highlighting: ✅

// Display Settings:
// - Show Article Ratings: ✅
// - Show View Counts: ✅
// - Show Article Version: ✅

// Validation Rules:
// - Require Summary: ✅
// - Require Data Category: ✅
// - Maximum Article Length: 100,000 characters
```

## Step-by-Step: Article Authoring

### Step 1: Create Article Template

```apex
// Apex: Create article from template
public class KnowledgeArticleTemplate {
    
    public static Knowledge__kav createFromTemplate(
        String templateType, 
        Map<String, String> fieldValues
    ) {
        Knowledge__kav article = new Knowledge__kav();
        
        // Set standard fields
        article.Title = fieldValues.get('Title');
        article.Summary = fieldValues.get('Summary');
        article.UrlName = fieldValues.get('UrlName');
        
        // Set custom fields based on template
        if (templateType == 'Troubleshooting') {
            article.Problem_Description__c = fieldValues.get('Problem');
            article.Root_Cause__c = fieldValues.get('RootCause');
            article.Resolution_Steps__c = fieldValues.get('Resolution');
            article.Affected_Products__c = fieldValues.get('Products');
        } else if (templateType == 'HowTo') {
            article.Prerequisites__c = fieldValues.get('Prerequisites');
            article.Step_1__c = fieldValues.get('Step1');
            article.Expected_Result__c = fieldValues.get('ExpectedResult');
        } else if (templateType == 'FAQ') {
            article.Question__c = fieldValues.get('Question');
            article.Answer__c = fieldValues.get('Answer');
        }
        
        return article;
    }
    
    public static void publishArticle(Knowledge__kav article) {
        // Validate article
        if (String.isBlank(article.Title)) {
            throw new KnowledgeException('Title is required');
        }
        
        if (String.isBlank(article.Summary)) {
            throw new KnowledgeException('Summary is required');
        }
        
        // Insert article
        insert article;
        
        // Publish article
        KbManagement.PublishingService.publishArticle(article.KnowledgeArticleId, true);
    }
}
```

### Step 2: Article Validation

```apex
// Apex: Article validation rules
public class KnowledgeValidation {
    
    public static void validateArticle(Knowledge__kav article) {
        List<String> errors = new List<String>();
        
        // Check required fields
        if (String.isBlank(article.Title)) {
            errors.add('Title is required');
        }
        
        if (String.isBlank(article.Summary)) {
            errors.add('Summary is required');
        }
        
        if (String.isBlank(article.UrlName)) {
            errors.add('URL Name is required');
        }
        
        // Check article length
        if (article.ArticleBody__c != null && 
            article.ArticleBody__c.length() > 100000) {
            errors.add('Article body exceeds maximum length');
        }
        
        // Check data categories
        // (Would need to query KnowledgeArticleItem for this)
        
        // Throw errors if any
        if (!errors.isEmpty()) {
            throw new KnowledgeException(
                'Validation failed: ' + String.join(errors, '; ')
            );
        }
    }
    
    public static void validatePublish(Knowledge__kav article) {
        // Additional validation for publishing
        validateArticle(article);
        
        // Check for duplicate articles
        List<Knowledge__kav> duplicates = [
            SELECT Id, Title, UrlName
            FROM Knowledge__kav
            WHERE UrlName = :article.UrlName
            AND Id != :article.Id
            AND PublishStatus = 'Online'
        ];
        
        if (!duplicates.isEmpty()) {
            throw new KnowledgeException(
                'Duplicate article found with URL: ' + article.UrlName
            );
        }
    }
}
```

### Step 3: Article Search Integration

```apex
// Apex: Search knowledge articles
public class KnowledgeSearch {
    
    public static List<Knowledge__kav> searchArticles(
        String searchQuery, 
        List<String> dataCategories,
        Integer maxResults
    ) {
        // Build SOQL query
        String query = 'SELECT Id, Title, Summary, ArticleNumber, ' +
                       'ArticleTotalViewCount, ArticleBody__c ' +
                       'FROM Knowledge__kav ' +
                       'WHERE PublishStatus = \'Online\' ' +
                       'AND Title LIKE \'%' + String.escapeSingleQuotes(searchQuery) + '%\'';
        
        // Add data category filter
        if (dataCategories != null && !dataCategories.isEmpty()) {
            query += ' AND Id IN (' +
                     'SELECT KnowledgeArticleId ' +
                     'FROM KnowledgeArticleItem ' +
                     'WHERE DataCategoryName IN (' +
                     String.join(dataCategories, ',') + '))';
        }
        
        query += ' ORDER BY ArticleTotalViewCount DESC ' +
                 'LIMIT ' + maxResults;
        
        return Database.query(query);
    }
    
    public static List<Knowledge__kav> getRelatedArticles(
        Id caseId, 
        Integer maxResults
    ) {
        // Get case details
        Case c = [
            SELECT Id, Subject, Description, Product__c
            FROM Case
            WHERE Id = :caseId
        ];
        
        // Search for related articles
        String searchQuery = c.Subject;
        if (String.isNotBlank(c.Product__c)) {
            searchQuery += ' ' + c.Product__c;
        }
        
        return searchArticles(searchQuery, null, maxResults);
    }
}
```

## Step-by-Step: SOQL for Knowledge Analytics

### Article Usage Analytics

```soql
-- Article performance metrics
SELECT Id, Title, ArticleNumber,
       ArticleTotalViewCount,
       ArticleViewCount,
       ArticleCaseCount,
       ArticleRating__c,
       LastPublishedDate
FROM Knowledge__kav
WHERE PublishStatus = 'Online'
ORDER BY ArticleTotalViewCount DESC
LIMIT 100
```

### Category-Based Analytics

```soql
-- Articles by data category
SELECT DataCategoryGroupName,
       DataCategoryName,
       COUNT() as ArticleCount
FROM KnowledgeArticleItem
WHERE Article__kav.PublishStatus = 'Online'
GROUP BY DataCategoryGroupName, DataCategoryName
ORDER BY ArticleCount DESC
```

### Case-to-Article Correlation

```soql
-- Cases resolved with knowledge articles
SELECT Id, CaseNumber, Subject,
       (SELECT Id, KnowledgeArticleId
        FROM CaseArticles)
FROM Case
WHERE Status = 'Closed'
AND ClosedDate = THIS_MONTH
AND Id IN (SELECT CaseId FROM CaseArticle)
```

## Hands-On Tasks

1. **Enable Knowledge**: Set up knowledge in your org
2. **Create Article Types**: Build troubleshooting and how-to templates
3. **Configure Categories**: Set up data category groups and categories
4. **Author Articles**: Create 5 knowledge articles with different types
5. **Implement Search**: Build Apex for knowledge article search
6. **Create Reports**: Build knowledge usage analytics reports
7. **Test Integration**: Link articles to cases and verify resolution tracking

## Self-Check Questions

1. What are the different knowledge article types?
2. How do data categories organize knowledge articles?
3. What is the knowledge article lifecycle?
4. How do you measure knowledge article effectiveness?
5. How does knowledge integrate with case management?

## Common Exam Traps

- **Trap**: Assuming knowledge articles are visible to all users by default — visibility depends on sharing settings.
- **Trap**: Forgetting that knowledge requires specific licenses.
- **Trap**: Not considering article expiration dates for content freshness.
- **Trap**: Assuming article search is always accurate — search optimization is needed.
- **Trap**: Overlooking that knowledge articles need version control.

## Related

- **Phase**: 06 - Knowledge Management
- **Exam Domain**: Knowledge Management (12%)
- **Previous Phase**: 05 - Service Process Automation
- **Next Phase**: 07 - Lightning Service Console
- **Resources**: [Knowledge Management Documentation](https://help.salesforce.com/s/articleView?id=sf.knowledge_article_view.htm&type=5)
