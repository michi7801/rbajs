import {PenaltyRisk} from "./PenaltyRisk.js";
import {Settings} from "../settings/Settings.js";

// increases risk if a useragent is unknown or not an explainable increment of what was already seen
export class UserAgentRiskPenalty extends PenaltyRisk{

    constructor() {
        super(Settings.get().weights.userAgent.weight);
    }

    isVersionSafe(newVersion, oldVersion) {
        const components = ['major', 'minor', 'patch', 'build'];
        for (const comp of components) {
            const newVerNr = newVersion?.[comp];
            const oldVerNr = oldVersion?.[comp];
            // Rule 1: new is null, old isn't => negativ, potential spoof
            if (newVerNr == null && oldVerNr != null) return false;
            // Rule 2: old is null, new isn't => neutral, more info than before is never bad
            // Rule 3: new >= old => neutral, could be a version update
            // Rule 4: new < old => negativ, typical user does not downgrade version
            if (newVerNr != null && oldVerNr != null && newVerNr < oldVerNr) return false;
        }
        // Rule 5: if both null or equal => neutral
        return true;
    }

    /**
     * @param {{ major: Number|null, minor: Number|null, patch: Number|null, build: Number|null }} newVersion
     * @param {[{ major: Number|null, minor: Number|null, patch: Number|null, build: Number|null }]} matchVersions
     * @returns {boolean}
     */
    hasSafeVersionIncrement(newVersion, matchVersions) {
        if (matchVersions.length > 0) {
            for (const oldVersion of matchVersions) {
                // check each safed version for a safe increment, if at least one is found => decrease risk
                if (this.isVersionSafe(newVersion, oldVersion)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {UserAgent} ua
     * @param {[UserAgent]} knownUAs
     * @returns {number}
     */
    calculateRisk(ua, knownUAs) {
        const matchOSVersions = [];
        const matchBrowserVersions = [];

        // find all UAs that have matching OS and matching browser
        for (const knownUA of knownUAs) {
            if (knownUA.getFullString() === ua.getFullString())
                return 0;

            if (knownUA.getOS() === ua.getOS()) {
                matchOSVersions.push(knownUA.getOSVersion());
            }
            if (knownUA.getBrowser() === ua.getBrowser()) {
                matchBrowserVersions.push(knownUA.getBrowserVersion());
            }
        }
        const hasSafeOsVersionIncrement = this.hasSafeVersionIncrement(ua.getOSVersion(), matchOSVersions);
        if (hasSafeOsVersionIncrement) {
            const hasSafeBrowserVersionIncrement = this.hasSafeVersionIncrement(ua.getBrowserVersion(), matchBrowserVersions);
            if (hasSafeBrowserVersionIncrement)
                return 0.5;
        }

        return 1;
    }

    calculate(ua, knownUAs) {
        const risk = this.calculateRisk(ua, knownUAs);
        this.setRisk(risk);
    }

}
