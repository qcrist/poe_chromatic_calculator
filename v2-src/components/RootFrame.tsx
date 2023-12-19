import React from "react";
import "main.css"
import {CalcTable} from "#root/components/CalcTable";
import {CalcConfig} from "#root/components/CalcConfig";

export function RootFrame() {


    return <>
        <h1>Chromatic Calculator</h1>
        <hr/>
        <CalcConfig/>
        <hr/>
        <CalcTable/>
    </>
}