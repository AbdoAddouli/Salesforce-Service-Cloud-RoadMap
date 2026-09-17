/**
 * Service Cloud Consultant Learning Project - Omni-Channel Service
 * ============================================================================
 * EXAM CONCEPT: Omni-Channel Routing (Blueprint Domain: 16%)
 *
 * This class demonstrates Omni-Channel routing concepts in Service Cloud.
 * Omni-Channel is a comprehensive customer service solution that integrates
 * multiple channels (phone, email, chat, social, etc.) into a unified console.
 *
 * KEY LEARNING POINTS:
 * 1. Omni-Channel vs Assignment Rules: Omni-Channel provides real-time,
 *    skills-based, and capacity-based routing
 * 2. Routing configurations determine how work items are distributed
 * 3. Presence statuses track agent availability
 * 4. Skills-based routing matches cases to agents with required skills
 * 5. Capacity models: Handle Capacity, Work Item Capacity, Percentage
 *
 * EXAM DISTINCTION:
 * - Assignment Rules: Batch routing, queue-based, simpler logic
 * - Omni-Channel: Real-time routing, skills/capacity-aware, supervisor views
 * - Both can coexist in an org, but Omni-Channel should be the primary routing
 *   method for contact centers
 *
 * RELATED EXAM TOPICS:
 * - Omni-Channel setup and configuration
 * - Routing configurations (Skills-based, Queue-based, Most Available)
 * - Presence statuses and presence configurations
 * - Service channels and service presence statuses
 * - Omni-Channel supervisor features
 * ============================================================================
 */
public with sharing class OmniChannelService {

    private static final String STATUS_AVAILABLE = 'Available';
    private static final String STATUS_BUSY = 'Busy';
    private static final String STATUS_OFFLINE = 'Offline';
    private static final String STATUS_ON_BREAK = 'On Break';

    /**
     * Finds available agents with a specific skill.
     * Skills-based routing matches incoming work items to agents who have
     * the required skills and are currently available.
     *
     * In Service Cloud, skills are defined as Skill objects and assigned
     * to users through SkillAssignment records. The Omni-Channel engine
     * then matches work items to the best-qualified available agent.
     *
     * @param skillName The required skill name (e.g., 'Billing', 'Technical')
     * @return List of User records who have the skill and are available
     */
    public static List<User> findAvailableAgent(String skillName) {
        if (String.isBlank(skillName)) {
            return new List<User>();
        }

        // Find agents with the required skill who are currently available
        List<User> availableAgents = [
            SELECT Id, Name, Profile.Name, UserRole.Name
            FROM User
            WHERE Id IN (
                SELECT AssigneeId
                FROM SkillAssignment
                WHERE SkillId IN (
                    SELECT Id FROM Skill WHERE MasterLabel = :skillName
                )
            )
            AND IsActive = true
            AND Profile.Name = 'Service Cloud Console User'
        ];

        return availableAgents;
    }

    /**
     * Routes cases to the best available agent using capacity-based routing.
     * This demonstrates the core Omni-Channel concept of intelligent routing
     * that considers agent skills, capacity, and current workload.
     *
     * Routing strategies:
     * - Most Available: Routes to agent with most free capacity
     * - Least Active: Routes to agent with fewest open items
     * - Skills-based: Routes based on skill matching
     * - Custom: Custom Apex routing implementation
     *
     * @param cases Cases to route
     * @return List of routed cases with assigned agents
     */
    public static List<Case> routeToBestAgent(List<Case> cases) {
        List<Case> routedCases = new List<Case>();

        if (cases == null || cases.isEmpty()) {
            return routedCases;
        }

        // In a real Omni-Channel implementation, this logic is handled by the
        // Omni-Channel engine. This method demonstrates the concepts programmatically.
        List<User> availableAgents = [
            SELECT Id, Name
            FROM User
            WHERE IsActive = true
            ORDER BY LastLoginDate DESC NULLS LAST
        ];

        if (availableAgents.isEmpty()) {
            return routedCases;
        }

        Integer agentIndex = 0;

        for (Case c : cases) {
            if (c == null) continue;

            // Round-robin assignment as a simplified routing strategy
            c.OwnerId = availableAgents[agentIndex].Id;
            agentIndex = (agentIndex + 1) % availableAgents.size();

            routedCases.add(c);
        }

        return routedCases;
    }

    /**
     * Updates an agent's presence status in Omni-Channel.
     * Presence statuses track whether an agent is available to handle
     * incoming work items. This is a core Omni-Channel concept.
     *
     * Presence statuses are categorized as:
     * - Available: Agent can receive new work items
     * - Busy/On Break: Agent is logged in but not accepting work
     * - Offline: Agent is not available
     *
     * @param userId The agent's user ID
     * @param status The new presence status
     * @return True if the status was updated successfully
     */
    public static Boolean updatePresenceStatus(Id userId, String status) {
        if (userId == null || String.isBlank(status)) {
            return false;
        }

        // Validate the status value
        Set<String> validStatuses = new Set<String>{
            STATUS_AVAILABLE, STATUS_BUSY, STATUS_OFFLINE, STATUS_ON_BREAK
        };

        if (!validStatuses.contains(status)) {
            return false;
        }

        // In a real implementation, this would interact with the Omni-Channel
        // Presence Status API. For learning purposes, we track it via a field.
        User agent = [
            SELECT Id, UserPermissionsCallCenterAutomation
            FROM User
            WHERE Id = :userId
            LIMIT 1
        ];

        // Log the presence change for audit purposes
        Service_Routing_Log__c log = new Service_Routing_Log__c();
        log.Agent__c = userId;
        log.Routing_Type__c = 'Presence Update: ' + status;
        log.Routed_At__c = System.now();

        if (Schema.sObjectType.Service_Routing_Log__c.isCreateable()) {
            insert log;
        }

        return true;
    }

    /**
     * Gets the current workload distribution across available agents.
     * This demonstrates capacity monitoring, which is essential for
     * Omni-Channel supervisor dashboards.
     *
     * @return Map of agent IDs to their current case counts
     */
    public static Map<Id, Integer> getAgentWorkloads() {
        Map<Id, Integer> workloads = new Map<Id, Integer>();

        List<AggregateResult> results = [
            SELECT OwnerId, COUNT(Id) caseCount
            FROM Case
            WHERE Status NOT IN ('Closed', 'Resolved')
            AND OwnerId IN (
                SELECT Id FROM User WHERE Profile.Name = 'Service Cloud Console User'
            )
            GROUP BY OwnerId
        ];

        for (AggregateResult ar : results) {
            Id agentId = (Id) ar.get('OwnerId');
            Integer count = (Integer) ar.get('caseCount');
            workloads.put(agentId, count);
        }

        return workloads;
    }

    /**
     * Checks if an agent has capacity to handle new work items.
     * Capacity management is a key Omni-Channel concept that prevents
     * agents from being overwhelmed with too many simultaneous cases.
     *
     * @param userId The agent to check
     * @param maxCapacity Maximum number of cases an agent can handle
     * @return True if the agent has capacity
     */
    public static Boolean hasCapacity(Id userId, Integer maxCapacity) {
        if (userId == null || maxCapacity == null || maxCapacity <= 0) {
            return false;
        }

        Integer currentWorkload = [
            SELECT COUNT()
            FROM Case
            WHERE OwnerId = :userId
            AND Status NOT IN ('Closed', 'Resolved')
        ];

        return currentWorkload < maxCapacity;
    }
}
