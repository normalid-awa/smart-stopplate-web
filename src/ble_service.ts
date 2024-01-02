import { BuzzerWaveformType } from "./buzzer";

const SERVICE_UUID = "7a0247e7-8e88-409b-a959-ab5092ddb03e";
const START_SIGNAL_CHARACTERISTIC_UUID = "3c224d84-566d-4f13-8b1c-2117021ff1a2";
const STOP_SIGNAL_CHARACTERISTIC_UUID = "57b92756-3df4-4038-b825-fc8e1c2fdb5b";
const TIME_SYNC_REQUEST_CHARACTERISTIC_UUID =
    "840a0941-55e9-44e4-bfff-1c3c27bf6af0";
const TIME_SYNC_WRITE_CHARACTERISTIC_UUID =
    "e0832e3e-f1e1-43b1-9569-109e2770e3ed";
const SETTING_CHARACTERISTIC_UUID = "798f2478-4c44-417f-bb6e-ee2a826cc17c";
export interface StopplateCharacteristic {
    start_signal_char: BluetoothRemoteGATTCharacteristic;
    time_sync_request_char: BluetoothRemoteGATTCharacteristic;
    time_sync_write_char: BluetoothRemoteGATTCharacteristic;
    stopplate_signal_char: BluetoothRemoteGATTCharacteristic;
    setting_store_char: BluetoothRemoteGATTCharacteristic;
}

function time(text: string) {
    console.log("[" + new Date().toJSON().substr(11, 8) + "] " + text);
}
function exponentialBackoff(
    max: number,
    delay: number,
    toTry: () => any,
    success: (event: any) => void,
    fail: () => void
) {
    toTry()
        .then((result: any) => success(result))
        .catch((_: any) => {
            if (max === 0) {
                return fail();
            }
            time("Retrying in " + delay + "s... (" + max + " tries left)");
            setTimeout(function () {
                exponentialBackoff(--max, delay * 2, toTry, success, fail);
            }, delay * 1000);
        });
}

export interface StopplateSettingDTO {
    indicator_light_up_duration: number;
    countdown_random_time_min: number;
    countdown_random_time_max: number;
    buzzer_duration: number;
    buzzer_frequency: number;
    buzzer_waveform: number;
}

export type HitCallbackID = number;
export type HitCallback = (event: Event, value: string) => void;
export class NotConnectException extends Error {
    message: string = "Not Connected";
    constructor(message: string) {
        super(message);
    }
}
export class BLEStopplateService {
    static instance: BLEStopplateService;

    public static getInstance(): BLEStopplateService {
        if (!BLEStopplateService.instance) {
            BLEStopplateService.instance = new BLEStopplateService();
        }
        return BLEStopplateService.instance;
    }

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    private _is_connected: boolean = false;
    public bluetooth_device?: BluetoothDevice;
    public bluetooth_gatt_server?: BluetoothRemoteGATTServer;
    public bluetooth_gatt_service?: BluetoothRemoteGATTService;
    public start_signal_char?: BluetoothRemoteGATTCharacteristic;
    public time_sync_request_char?: BluetoothRemoteGATTCharacteristic;
    public time_sync_write_char?: BluetoothRemoteGATTCharacteristic;
    public stopplate_signal_char?: BluetoothRemoteGATTCharacteristic;
    public setting_store_char?: BluetoothRemoteGATTCharacteristic;
    public on_hit_listener: HitCallback[] = [];

    public get is_connected() {
        return this.bluetooth_gatt_server?.connected || false;
    }

    private async scan_stopplate() {
        let ble_ui = await navigator.bluetooth.getAvailability();
        if (!ble_ui) return;
        let bluetooth_device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE_UUID] }],
        });
        if (!bluetooth_device?.gatt) return;
        return bluetooth_device;
    }

    private async connect_stopplate(ble_device: BluetoothDevice) {
        if (!ble_device?.gatt) return;
        console.log("Connecting to GATT Server...");
        ble_device.addEventListener(
            "gattserverdisconnected",
            this.on_device_disconnect
        );
        this._is_connected = true;
        return await ble_device.gatt.connect();
    }
    private on_device_disconnect() {
        if (this._is_connected) {
            this.reconnect();
        }
    }

    private async retrive_stopplate_services(
        ble_gatt_server: BluetoothRemoteGATTServer
    ) {
        console.log("Getting Service...");
        return await ble_gatt_server.getPrimaryService(SERVICE_UUID);
    }

    private async retrive_stopplate_characteristic(
        ble_service: BluetoothRemoteGATTService
    ): Promise<StopplateCharacteristic> {
        console.log("Getting characteristic...");
        let stopplate_signal_char = await ble_service.getCharacteristic(
            STOP_SIGNAL_CHARACTERISTIC_UUID
        );

        let start_signal_char = await ble_service.getCharacteristic(
            START_SIGNAL_CHARACTERISTIC_UUID
        );
        let time_sync_request_char = await ble_service.getCharacteristic(
            TIME_SYNC_REQUEST_CHARACTERISTIC_UUID
        );
        let time_sync_write_char = await ble_service.getCharacteristic(
            TIME_SYNC_WRITE_CHARACTERISTIC_UUID
        );
        let setting_store_char = await ble_service.getCharacteristic(
            SETTING_CHARACTERISTIC_UUID
        );

        return {
            stopplate_signal_char,
            setting_store_char,
            start_signal_char,
            time_sync_request_char,
            time_sync_write_char,
        };
    }
    public async scan_and_connect_stopplate() {
        this.bluetooth_device = await this.scan_stopplate();
        if (!this.bluetooth_device) return;
        this.bluetooth_gatt_server = await this.connect_stopplate(
            this.bluetooth_device
        );
        if (!this.bluetooth_gatt_server) return;
        this.bluetooth_gatt_service = await this.retrive_stopplate_services(
            this.bluetooth_gatt_server
        );
        let {
            start_signal_char,
            stopplate_signal_char,
            setting_store_char,
            time_sync_request_char,
            time_sync_write_char,
        } = await this.retrive_stopplate_characteristic(
            this.bluetooth_gatt_service
        );
        if (
            !time_sync_request_char ||
            !time_sync_write_char ||
            !stopplate_signal_char ||
            !setting_store_char ||
            !start_signal_char
        ) {
            this.disconnect();
            return;
        }
        this.start_signal_char = start_signal_char;
        this.time_sync_request_char = time_sync_request_char;
        this.time_sync_write_char = time_sync_write_char;
        this.stopplate_signal_char = stopplate_signal_char;
        this.setting_store_char = setting_store_char;
        await stopplate_signal_char.startNotifications();
        stopplate_signal_char.addEventListener(
            "characteristicvaluechanged",
            (event: Event) => {
                let val = new TextDecoder().decode(
                    (
                        event as unknown as {
                            target: { value: BufferSource };
                        }
                    ).target.value as BufferSource
                );
                console.log("Hit data: %s current %s", val, Date.now());
                this.on_hit_listener.forEach((cb) => {
                    cb(event, val);
                });
            }
        );
        await time_sync_request_char.startNotifications();
        time_sync_request_char.addEventListener(
            "characteristicvaluechanged",
            (event: Event) => {
                time_sync_write_char.writeValue(
                    new TextEncoder().encode(
                        this.get_precision_time().toString()
                    )
                );
            }
        );
        this.perform_time_sync();
        console.log("BLE connect succes");
    }

    disconnect() {
        this.normal_disconnect();
    }

    reconnect() {
        return new Promise<void>((resolve, reject) => {
            exponentialBackoff(
                10 /* max retries */,
                3 /* seconds delay */,
                () => {
                    time("Connecting to Bluetooth Device... ");
                    return this.bluetooth_device?.gatt?.connect();
                },
                async () => {
                    console.log(
                        "> Bluetooth Device connected. Try disconnect it now."
                    );
                    if (typeof this.bluetooth_gatt_service === undefined)
                        reject();
                    await this.retrive_stopplate_characteristic(
                        this
                            .bluetooth_gatt_service as BluetoothRemoteGATTService
                    );
                    resolve();
                },
                () => {
                    time("Failed to reconnect.");
                    this.normal_disconnect();
                    reject();
                }
            );
        });
    }

    async perform_time_sync() {
        await this.time_sync_request_char?.writeValue(
            new TextEncoder().encode("INIT")
        );
    }

    private normal_disconnect() {
        console.log("Disconnected");
        this._is_connected = false;
        this.bluetooth_gatt_server?.disconnect();
        delete this.bluetooth_device;
        delete this.bluetooth_gatt_server;
        delete this.bluetooth_gatt_service;
        delete this.start_signal_char;
        delete this.time_sync_request_char;
        delete this.time_sync_write_char;
        delete this.stopplate_signal_char;
        delete this.setting_store_char;
    }
    async write_setting(
        indicator_light_up_duration: number,
        countdown_random_time_min: number,
        countdown_random_time_max: number,
        buzzer_duration: number,
        buzzer_frequency: number,
        buzzer_waveform: BuzzerWaveformType
    ) {
        indicator_light_up_duration = Math.round(indicator_light_up_duration);
        buzzer_duration = Math.round(buzzer_duration);
        buzzer_frequency = Math.round(buzzer_frequency);
        console.log(
            JSON.stringify({
                indicator_light_up_duration,
                countdown_random_time_min,
                countdown_random_time_max,
                buzzer_duration,
                buzzer_frequency,
                buzzer_waveform,
            })
        );
        await this.setting_store_char?.writeValue(
            new TextEncoder().encode(
                JSON.stringify({
                    indicator_light_up_duration,
                    countdown_random_time_min,
                    countdown_random_time_max,
                    buzzer_duration,
                    buzzer_frequency,
                    buzzer_waveform,
                })
            )
        );
    }
    async get_settings() {
        let settingChar: DataView | undefined;
        settingChar = await this.setting_store_char?.readValue();
        return JSON.parse(
            new TextDecoder().decode(settingChar)
        ) as StopplateSettingDTO;
    }
    checkConnectionState() {
        return this.is_connected;
    }

    register_hit_callback(
        callback: (event: Event, value: string) => void
    ): HitCallbackID {
        let cbid = Math.round(Math.random() * 10000);
        this.on_hit_listener[cbid] = callback;
        return cbid;
    }
    remove_hit_callback(cb_id: HitCallbackID) {
        delete this.on_hit_listener[cb_id];
    }

    start_timer() {
        this.start_signal_char?.writeValue(
            new TextEncoder().encode(this.get_precision_time().toString())
        );
    }

    private get_precision_time() {
        return Date.now() * 0.001;
    }
}
