/**
 * Service Cloud Consultant Learning Project - Trigger Handler Framework
 * ============================================================================
 * EXAM CONCEPT: Triggers & Bulk Apex Best Practices (Blueprint Domain: 8%)
 *
 * This utility class provides a standard TriggerHandlerService.shouldRun()
 * guard used by all of the learning triggers. The guard pattern ensures:
 *
 * 1. Trigger execution can be disabled during batch processes or data migrations
 * 2. Recursion is prevented with a static flag
 * 3. Only one trigger per object pattern is followed
 * 4. Triggers can be bypassed in tests where needed
 *
 * EXAM TOPICS:
 * - Trigger framework design patterns
 * - Static variable behavior across triggers and tests
 * - Recursion protection with static flags
 * - Bulk-safe trigger design (>200 records)
 * - Calling automation from triggers (with/without sharing concerns)
 * ============================================================================
 */
public inherited sharing class TriggerHandlerService {

    /**
     * All trigger names configured to run their handlers normally.
     * Set to empty during tests/batches when bypass is needed.
     * Adding a static list of bypassed triggers uses the "Disabled Trigger" pattern.
     */
    @TestVisible
    private static Set<String> bypassedTriggers = new Set<String>();
    @TestVisible
    private static Boolean isRunningTest = false;
    @TestVisible
    private static Boolean bypassedTriggersEnabled = false;

    /**
     * Guard method used by every trigger before delegating to its service.
     * Returns false to skip processing when the trigger is bypassed.
     *
     * Usage in trigger body:
     *   if (TriggerHandlerService.shouldRun('CaseTrigger')) {
     *       CaseTriggerHandlerService.handleBeforeInsert(Trigger.new);
     *   }
     *
     * @param triggerName The name of the executing trigger
     * @return true if the handler should run
     */
    public static Boolean shouldRun(String triggerName) {
        if (String.isBlank(triggerName)) {
            return false;
        }

        // Skip if all triggers are globally disabled (batch load / migration)
        if (bypassedTriggersEnabled) {
            return false;
        }

        // Skip if this trigger has been explicitly bypassed
        if (bypassedTriggers.contains(triggerName)) {
            return false;
        }

        return true;
    }

    /**
     * Globally disables all triggers. Useful for batch loads, data migration,
     * and integration scenarios where trigger logic should not fire.
     */
    public static void bypassAllTriggers() {
        // Maintain a cleared set state semantically; bypass checks consult the flag
        bypassedTriggersEnabled = true;
    }

    /**
     * Re-enables all triggers after bypassAllTriggers() was called.
     */
    public static void clearAllBypasses() {
        bypassedTriggersEnabled = false;
    }

    /**
     * Bypasses a specific trigger by name.
     *
     * @param triggerName The trigger to bypass
     */
    public static void bypass(String triggerName) {
        if (String.isNotBlank(triggerName)) {
            bypassedTriggers.add(triggerName);
        }
    }

    /**
     * Clears the bypass for a specific trigger.
     *
     * @param triggerName The trigger to un-bypass
     */
    public static void clearBypass(String triggerName) {
        if (String.isNotBlank(triggerName)) {
            bypassedTriggers.remove(triggerName);
        }
    }

    /**
     * Reports whether DML from triggers should be allowed to recurse.
     * Used to prevent recursion loops when handlers perform updates.
     */
    public static Boolean isBatchOrTestPhase() {
        // Returns true during unit tests to allow test isolation behavior
        return isRunningTest;
    }

    @TestVisible
    private static Boolean isRunningTest = false;
    @TestVisible
    private static Boolean bypassedTriggersEnabled = false;
}