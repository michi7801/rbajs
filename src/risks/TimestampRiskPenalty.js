import {PenaltyRisk} from "./PenaltyRisk.js";
import {Settings} from "../settings/Settings.js";

// increases risk if weekday or time of day do not match what was already seen
export class TimestampRiskPenalty extends PenaltyRisk{

    constructor() {
        super(Settings.get().weights.timeOfDay.weight);
    }

    /**
     *
     * @param {Date} timestamp
     * @param {[Date]} allowedTimestamps
     * @returns {number}
     */
    calculateRisk(timestamp, allowedTimestamps) {
        const gracePeriod = Settings.get().timeOfDay.graceMinutesToFullRisk;
        const graceMs = gracePeriod * 60 * 1000; // convert minutes to milliseconds
        const curve = Settings.get().timeOfDay.graceCalculation;
        const sensitivity = Settings.get().timeOfDay.sensitivity;
        const weekday = timestamp.getUTCDay();
        const ts = this.#getMillisecondsSinceMidnight(timestamp);
        let earliest = Infinity;
        let latest = -Infinity;
        const allowedWeekdays = [];

        if (!allowedTimestamps || allowedTimestamps.length === 0)
            return 1;

        for (const t of allowedTimestamps) {
            const timeOfDay = this.#getMillisecondsSinceMidnight(t);
            allowedWeekdays.push(t.getUTCDay());
            if (timeOfDay < earliest) earliest = timeOfDay;
            if (timeOfDay > latest) latest = timeOfDay;
        }


        // If within allowed range
        if (ts >= earliest && ts <= latest)
            return 0;

        // If beyond grace period
        if (ts < earliest - graceMs || ts > latest + graceMs)
            return 1;

        // Calculate distance to nearest boundary
        const distance = ts < earliest ? earliest - ts : ts - latest;
        const normalized = Math.max(1, distance / graceMs);

        // Calculate risk based on curve type
        let risk;
        switch (curve) {
            case 'lin':
                risk = normalized; break;
            case 'exp':
                risk = Math.min(1, (Math.exp(sensitivity * normalized) - 1) / (Math.exp(sensitivity) - 1)); break;
            case 'log':
                risk = Math.min(1, Math.log1p(sensitivity * normalized) / Math.log1p(sensitivity)); break;
            default:
                throw new Error("Invalid curve type. Use 'lin', 'exp', or 'log'.");
        }

        if (!allowedWeekdays.includes(weekday))
            risk = risk + Settings.get().timeOfDay.atypicalWeekdayPenalty;

        risk = Math.min(Math.max(risk, 0), 1);
        return Math.round(risk * 100) / 100;
    }

    #getMillisecondsSinceMidnight(d) {
        return d.getUTCHours() * 3600000 +
                d.getUTCMinutes() * 60000 +
                d.getUTCSeconds() * 1000 +
                d.getUTCMilliseconds();
    }

    calculate(timestamp, allowedTimestamps) {
        const risk = this.calculateRisk(timestamp, allowedTimestamps);
        this.setRisk(risk);
    }

}
