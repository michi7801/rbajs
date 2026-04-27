export class PenaltyRisk {
    #weight;
    #risk;

    constructor(weight) {
        this.#weight = weight;
    }

    setRisk(risk) {
        if (risk >= 0 && risk <= 1)
            this.#risk = risk;
        else throw new Error(`Penalty risk can only be between 0 and 1, was ${risk}`);
    }

    getRisk() {
        return this.#risk;
    }

    setWeight(weight) {
        this.#weight = weight;
    }

    getWeight() {
        return this.#weight;
    }
}
