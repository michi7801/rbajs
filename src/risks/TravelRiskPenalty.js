import {PenaltyRisk} from "./PenaltyRisk.js";
import {Settings} from "../settings/Settings.js";

// Increases risk the less likely it is that certain distance was traveled
export class TravelRiskPenalty extends PenaltyRisk{

    constructor() {
        super(Settings.get().weights.travelSpeed.weight);
    }

    // Haversine formula (Earth curvature distance)
    #haversine(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const toRad = deg => deg * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    #getSpeed(long1, lat1, long2, lat2, time1, time2) {
        const distance = this.#haversine(lat1, long1, lat2, long2);

        const timeDiffHours = Math.abs((time2 - time1) / (1000 * 60 * 60));
        if (timeDiffHours === 0 && distance !== 0)
            return { distance, speed: Infinity };
        else if (timeDiffHours === 0)
            return { distance: 0, speed: 0 }

        const speed = distance / timeDiffHours;

        return { distance, speed };
    }

    calculateRisk(long1, lat1, long2, lat2, time1, time2) {
        if (!lat1 || !long1 || !lat2 || !long2)
            return 1;

        const { speed } = this.#getSpeed(long1, lat1, long2, lat2, time1, time2);

        const points = [
            {speed: 0, penalty: 0.0},
            Settings.get().travelSpeed.normalCarSpeed,
            Settings.get().travelSpeed.maxCarSpeed,
            Settings.get().travelSpeed.maxNonFlyingSpeed,
            Settings.get().travelSpeed.maxRealisticSpeed,
            Settings.get().travelSpeed.maxSpeed,
        ];

        if (speed >= Settings.get().travelSpeed.maxSpeed.speed) return 1.0;

        for (let i = 0; i < points.length - 1; i++) {
            const {speed: speedBoundary1, penalty: penaltyBoundary1} = points[i];
            const {speed: speedBoundary2, penalty: penaltyBoundary2} = points[i + 1];

            if (speed >= speedBoundary1 && speed <= speedBoundary2) {
                const speedBoundaryDiff = speedBoundary2 - speedBoundary1;
                const penaltyBoundaryDiff = penaltyBoundary2 - penaltyBoundary1;
                const travelSpeedDiff = speed - speedBoundary1;
                const risk = penaltyBoundary1 + travelSpeedDiff * penaltyBoundaryDiff / speedBoundaryDiff;
                return Math.round(risk * 100) / 100;
            }
        }
    }

    calculate(long1, lat1, long2, lat2, time1, time2) {
        const risk = this.calculateRisk(long1, lat1, long2, lat2, time1, time2);
        this.setRisk(risk);
    }

}
