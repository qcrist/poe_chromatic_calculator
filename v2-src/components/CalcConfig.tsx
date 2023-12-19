import React from "react";
import {AppConfigParameter, useAppState} from "#root/state";


type AppStateVarProps = {
    className: string,
    prop_name: AppConfigParameter
}

const AppStateNumberVarInputHover = {
    "jewels_per_chroma": "For sorting, how many jewelers is a chromatic worth",
    "req_dex": "Target item required dexterity",
    "req_int": "Target item required intelligence",
    "req_str": "Target item required strength",
    target_blue: "Number of required blue sockets",
    target_green: "Number of required green sockets",
    target_red: "Number of required red sockets",
    target_any: "Number of additional sockets that can be any color"
} satisfies { [K in AppConfigParameter]: string }

function AppStateNumberVarInput({className, prop_name}: AppStateVarProps) {
    const initialValue = useAppState.getState().config[prop_name];
    const {setConfigParameter} = useAppState()

    function onInput(e: React.FormEvent<HTMLInputElement>) {
        setConfigParameter(prop_name, Number(e.currentTarget.value || "0"))
    }

    const value = initialValue != 0 ? String(initialValue) : "";

    return <input className={className} type="text" value={value} placeholder="0" onInput={onInput}
                  title={AppStateNumberVarInputHover[prop_name]}
    />
}


export function CalcConfig() {
    return <>
        <div className="toptable">
            <span>Jewels per Chroma</span>
            <AppStateNumberVarInput className={"cell jwl"} prop_name={"jewels_per_chroma"}/>
            <span></span>
            <span></span>
            <span></span>
            <span>Requirements</span>
            <AppStateNumberVarInput className={"cell red"} prop_name={"req_str"}/>
            <AppStateNumberVarInput className={"cell green"} prop_name={"req_dex"}/>
            <AppStateNumberVarInput className={"cell blue"} prop_name={"req_int"}/>
            <span></span>
            <span></span>
            <span className="sockets">Sockets</span>
            <AppStateNumberVarInput className={"cell red"} prop_name={"target_red"}/>
            <AppStateNumberVarInput className={"cell green"} prop_name={"target_green"}/>
            <AppStateNumberVarInput className={"cell blue"} prop_name={"target_blue"}/>
            <AppStateNumberVarInput className={"cell any"} prop_name={"target_any"}/>
        </div>
    </>
}