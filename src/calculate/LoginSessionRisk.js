import {Settings} from "../settings/Settings.js";

export class LoginSessionRisk {
    #baseRisk;
    #penaltyRisks;
    #directionalRisks;
    #directionalRiskSumRaw;
    #directionalRiskSum;
    #penaltyRiskSum;
    #maxRiskOffset;
    #riskSum;
    #squashedRisk;
    #riskClass;
    #maxRisk;
    #isFirstKnownLogin;

    constructor(baseRisk, penaltyRisks, directionalRisks, first) {
        this.#penaltyRisks = penaltyRisks;
        this.#directionalRisks = directionalRisks;
        this.#baseRisk = baseRisk;
        this.#isFirstKnownLogin = first;

        const maxRisk = Object.values(Settings.get().weights)
            .filter(w => w.enabled)
            .map(w => w.weight)
            .reduce((total, num) => total + num, 0) + this.#baseRisk;
        this.#maxRisk = this.#round(maxRisk);

        this.#calculate();
    }

    #calculate() {
        this.#penaltyRiskSum = 0;
        this.#directionalRiskSumRaw = 0;

        for (const penaltyRisk of this.#penaltyRisks) {
            this.#penaltyRiskSum += penaltyRisk.getRisk() * penaltyRisk.getWeight();
        }
        this.#penaltyRiskSum = this.#round(this.#penaltyRiskSum);

        for (const directionalRisk of this.#directionalRisks) {
            this.#directionalRiskSumRaw += directionalRisk.getRisk() * directionalRisk.getWeight();
        }
        this.#directionalRiskSumRaw = this.#round(this.#directionalRiskSumRaw);

        this.#maxRiskOffset = -Settings.get().maxDirectionalRiskOffsetPercent * this.#penaltyRiskSum;
        this.#directionalRiskSum = Math.max(this.#directionalRiskSumRaw, this.#maxRiskOffset);

        // can never be smaller than 0 (happens only if baseRisk is negativ)
        this.#riskSum = this.#round(Math.max(this.#baseRisk + this.#penaltyRiskSum + this.#directionalRiskSum, 0));



        this.#squashedRisk = this.#squash(this.#riskSum, 0 , this.#maxRisk);

        const riskThresholds = Settings.get().riskThresholds;
        if (this.#squashedRisk >= riskThresholds.veryHigh) this.#riskClass = "veryHigh";
        else if (this.#squashedRisk >= riskThresholds.high) this.#riskClass = "high";
        else if (this.#squashedRisk >= riskThresholds.medium) this.#riskClass = "medium";
        else if (this.#squashedRisk >= riskThresholds.low) this.#riskClass = "low";
        else if (this.#squashedRisk >= riskThresholds.none) this.#riskClass = "none";
        else this.#riskClass = "unknown";
    }

    #round(v) {
        return Math.round(v * 100) / 100;
    }

    #squash(value, minVal, maxVal) {
        return this.#round((value - minVal) / (maxVal - minVal))
    }

    getDirectionalRiskSumRaw() {
        return this.#directionalRiskSumRaw;
    }

    getDirectionalRiskSum() {
        return this.#directionalRiskSum;
    }

    getPenaltyRiskSum() {
        return this.#penaltyRiskSum;
    }

    getMaxRiskOffset() {
        return this.#maxRiskOffset;
    }

    getRiskSum() {
        return this.#riskSum;
    }

    getSquashedRisk() {
        return this.#squashedRisk;
    }

    getBaseRisk() {
        return this.#baseRisk;
    }

    getPenaltyRisks() {
        return this.#penaltyRisks;
    }

    getDirectionalRisks() {
        return this.#directionalRisks;
    }

    getRiskClass() {
        return this.#riskClass;
    }

    getMaxRisk() {
        return this.#maxRisk;
    }

    isFirstKnownLogin() {
        return this.#isFirstKnownLogin;
    }

    toJson() {
        return {
            risks: [
                ...this.#penaltyRisks.map(pr => ({name: pr.constructor.name,risk: pr.getRisk()})),
                ...this.#directionalRisks.map(dr => ({name: dr.constructor.name,risk: dr.getRisk()}))
            ],
            baseRisk: this.#baseRisk,
            directionalRiskRaw: this.#directionalRiskSumRaw,
            maxRiskOffset: this.#maxRiskOffset,
            directionalRisk: this.#directionalRiskSum,
            penaltyRisk: this.#penaltyRiskSum,
            riskRaw: this.#riskSum,
            risk: this.#squashedRisk,
            riskClass: this.#riskClass,
            maxRisk: this.#maxRisk,
            isFirstKnownLogin: this.#isFirstKnownLogin
        }
    }
}
