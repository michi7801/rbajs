export class DirectionalRisk {
    #risk;
    #weight;

    constructor(weight) {
        this.#weight = weight;
    }

    setRisk(risk) {
        if (risk <= 1 && risk >= -0.5)
            this.#risk = risk;
        else throw new Error(`Direction risk can only be between -0.5 and 1, was ${risk}`);
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
