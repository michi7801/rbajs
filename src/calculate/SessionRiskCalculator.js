import {ASNRiskDirectional} from "../risks/ASNRiskDirectional.js";
import {TravelRiskPenalty} from "../risks/TravelRiskPenalty.js";
import {LoginAttemptRiskPenalty} from "../risks/LoginAttemptRiskPenalty.js";
import {UserAgentRiskPenalty} from "../risks/UserAgentRiskPenalty.js";
import {TimestampRiskPenalty} from "../risks/TimestampRiskPenalty.js";
import {RoundTripRiskPenalty} from "../risks/RoundTripRiskPenalty.js";
import {LoginSessionRisk} from "./LoginSessionRisk.js";
import {Settings} from "../settings/Settings.js";

export class SessionRiskCalculator {
    /**
     * @param {LoginSession} currentSession
     * @param {[LoginSession]} knownSessions
     *
     * @return {LoginSessionRisk}
     */
    calculate(currentSession, knownSessions) {
        // finds the most recent session with a successful login attempt
        const mostRecentSession = knownSessions.findLast(ks => ks.isLoginSuccessful())

        const asns = [];
        const asnOrgs = [];
        const ips = [];
        const timestamps = [];
        const userAgents = [];
        const rtts = [];

        for (const ks of knownSessions) {
            if (ks.isLoginSuccessful()) {
                asns.push(ks.getAsn());
                asnOrgs.push(ks.getAsnOrganization());
                ips.push(ks.getIp());
                timestamps.push(ks.getTimestamp());
                userAgents.push(ks.getUserAgent());
                rtts.push(ks.getRtt());
            }
        }

        const medianRtt = this.#median(rtts);

        const hasKnownSessions = ips.length > 0;

        const penalties = [];
        const directionals = [];

        if (Settings.get().weights.ip.enabled) {
            const asnRiskDirectional = new ASNRiskDirectional();
            asnRiskDirectional.calculate(currentSession.getIp(), currentSession.getAsn(), currentSession.getAsnOrganization(), ips, asns, asnOrgs);
            directionals.push(asnRiskDirectional);
        }

        if (Settings.get().weights.travelSpeed.enabled) {
            const travelRiskPenalty = new TravelRiskPenalty();
            travelRiskPenalty.calculate(
                currentSession.getLongitude(),
                currentSession.getLatitude(),
                mostRecentSession?.getLongitude() ?? null,
                mostRecentSession?.getLatitude() ?? null,
                currentSession.getTimestamp(),
                mostRecentSession?.getTimestamp() ?? null
            );
            penalties.push(travelRiskPenalty);
        }

        if (Settings.get().weights.loginAttempts.enabled) {
            const loginAttemptRiskPenalty = new LoginAttemptRiskPenalty();
            const failed24h = hasKnownSessions ? currentSession.getFailedLogins24h() : Number.MAX_SAFE_INTEGER;
            const failed15min = hasKnownSessions ? currentSession.getFailedLogins15min() : Number.MAX_SAFE_INTEGER;
            loginAttemptRiskPenalty.calculate(failed24h, failed15min);
            penalties.push(loginAttemptRiskPenalty);
        }

        if (Settings.get().weights.timeOfDay.enabled) {
            const timestampRiskPenalty = new TimestampRiskPenalty();
            timestampRiskPenalty.calculate(currentSession.getTimestamp(), timestamps);
            penalties.push(timestampRiskPenalty);
        }

        if (Settings.get().weights.roundTripTime.enabled) {
            const roundTripTimeRiskPenalty = new RoundTripRiskPenalty();
            roundTripTimeRiskPenalty.calculate(currentSession.getRtt(), medianRtt)
            penalties.push(roundTripTimeRiskPenalty);
        }

        if (Settings.get().weights.userAgent.enabled) {
            const userAgentRiskPenalty = new UserAgentRiskPenalty();
            userAgentRiskPenalty.calculate(currentSession.getUserAgent(), userAgents);
            penalties.push(userAgentRiskPenalty);
        }

        return new LoginSessionRisk(0, penalties, directionals, !hasKnownSessions);
    }

    #median(arr) {
        if (arr.length === 0) return null;

        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
}
