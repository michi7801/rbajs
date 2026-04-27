import {PenaltyRisk} from "./PenaltyRisk.js";
import {Settings} from "../settings/Settings.js";

export class RoundTripRiskPenalty extends PenaltyRisk{

    constructor() {
        super(Settings.get().weights.roundTripTime.weight);
    }

    calculateRisk(rtt, medianRtt) {
        if (rtt === null || medianRtt === null) return 1;
        const graceToFullRisk = Settings.get().roundTripTime.graceToFullRisk;
        const rawRisk = Math.abs(Number(medianRtt) - rtt) / graceToFullRisk
        const risk = Math.min(1, rawRisk);
        return Math.round(risk * 100) / 100;
    }
T
    calculate(rtt, medianRtt) {
        const risk = this.calculateRisk(rtt, medianRtt);
        this.setRisk(risk);
    }

}
