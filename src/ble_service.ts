export class BLEStopplateService {
    private static instance: BLEStopplateService;

    public static getInstance(): BLEStopplateService {
        if (!BLEStopplateService.instance) {
            BLEStopplateService.instance = new BLEStopplateService();
        }
        return BLEStopplateService.instance;
    }

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public async scan_stopplate() {
        await navigator.bluetooth.getAvailability();
    }
}
