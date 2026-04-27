import {DirectionalRisk} from "./DirectionalRisk.js";
import {Settings} from "../settings/Settings.js";

// increases risk if ASN or organization does not match what was already seen
export class ASNRiskDirectional extends DirectionalRisk {
    constructor() {
        super(Settings.get().weights.ip.weight);
    }

    calculateRisk(ip, asn, asnOrg, knownIPs, knownASNs, knowOrganizations) {
        if (asn === null || asnOrg === null)
            return 1;
        if (knownIPs.includes(ip))
            return -0.5;
        if (knownASNs.includes(asn))
            return 0.3;
        if (knowOrganizations.includes(asnOrg))
            return 0.75;
        return 1;
    }

    calculate(ip, asn, asnOrg, knownIPs, knownASNs, knowOrganizations) {
        const risk = this.calculateRisk(ip, asn, asnOrg, knownIPs, knownASNs, knowOrganizations);
        this.setRisk(risk);
    }
}
