import {PenaltyRisk} from "./PenaltyRisk.js";
import {Settings} from "../settings/Settings.js";

// Increases risk as number of failed login attempts move to a certain threshold
export class LoginAttemptRiskPenalty extends PenaltyRisk{

    constructor() {
        super(Settings.get().weights.loginAttempts.weight);
    }

    #loginAttemptScore(tries, threshold, sensitivity) {
        if (tries < 0) tries = 0;
        if (tries > threshold) tries = threshold;
        return Math.log(1 + sensitivity * tries) / Math.log(1 + sensitivity * threshold);
    }

    calculateRisk(failedLogins24h, failedLogins15m) {
        const settings = Settings.get().failedLoginAttemptsThreshold;
        const risk15m = this.#loginAttemptScore(failedLogins15m, settings["15m"], settings.sensitivity);
        const risk24h = this.#loginAttemptScore(failedLogins24h, settings["24h"], settings.sensitivity)
        const risk = Math.max(0, risk15m, risk24h);
        return Math.round(risk * 100) / 100;
    }

    calculate(failedLogins24h, failedLogins15m) {
        const risk = this.calculateRisk(failedLogins24h, failedLogins15m);
        this.setRisk(risk);
    }

}
