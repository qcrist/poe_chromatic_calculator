import {create} from 'zustand'
import {produce, Immutable} from "immer";

export type AppConfigState = {
    jewels_per_chroma: number,
    req_str: number,
    req_dex: number,
    req_int: number,
    target_red: number,
    target_green: number,
    target_blue: number,
    target_any: number,
};
export type AppConfigParameter = keyof AppConfigState;
export type AppConfigStateRequirements = Pick<AppConfigState, "req_str" | "req_dex" | "req_int">

export type AppState = {
    config: AppConfigState,
    setConfigParameter<T extends AppConfigParameter>(param: T, value: AppConfigState[T]): void,
    setRequirements(arg: AppConfigStateRequirements): void,

};


export const useAppState = create<Immutable<AppState>>((set) => ({
    config: {
        jewels_per_chroma: 3,
        req_str: 0,
        req_dex: 0,
        req_int: 0,
        target_red: 0,
        target_green: 0,
        target_blue: 0,
        target_any: 0,
    },
    setConfigParameter(param, value) {
        set(produce<AppState>(state => {
            state.config[param] = value
        }))
    },
    setRequirements(arg: AppConfigStateRequirements) {
        set(produce<AppState>(state => {
            state.config.req_dex = arg.req_dex;
            state.config.req_int = arg.req_int;
            state.config.req_str = arg.req_str;
        }))
    }
}));

