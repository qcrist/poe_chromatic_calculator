import React, {useEffect, useMemo, useState} from "react";
import {AppConfigParameter, AppConfigState, useAppState} from "#root/state";
import {Matrix, EVD} from "ml-matrix";

type calc_entry = {
    method: string,
} & method_result;

type method_result = {
    attempt_cost_chr: number,
    attempt_cost_jwl: number,
    attempts: number,
    // actions: number
}

type color_ch = {
    r: number, g: number, b: number
}

function color_chances(state: AppConfigState): color_ch {
    const {req_dex: dex, req_str: str, req_int: int} = state;

    let ord = [str, dex, int];
    let r1 = Math.max(...ord);
    let r2 = [...ord].sort((a, b) => a - b)[1]
    let is_mono = r2 === 0;

    if (str === dex && dex === int) {
        return {r: 1 / 3, g: 1 / 3, b: 1 / 3};
    }

    if (ord.indexOf(0) === -1 || r1 === 0)
        throw new Error("Unexpected coloring!");

    // console.log(ord)
    // console.log(ord.indexOf(r1))

    let r;
    if (is_mono) {
        let on_color = 0.9 * (r1 + 10) / (r1 + 20);
        let off_color = 0.05 + 4.5 / (r1 + 20);
        r = [off_color, off_color, off_color];
        r[ord.indexOf(r1)] = on_color;
    } else {
        let f = 0.9 / (r1 + r2);
        r = ord.map(k => k * f)
        // console.log(r1, r2, r)
        r[ord.indexOf(0)] = 0.1;
        // console.log(r1, r2, r)
    }

    // console.log(r)

    return {r: r[0], g: r[1], b: r[2]};
}

function comb(n: number, r: number) {
    return fact(n) / fact(r) / fact(n - r)
}

function fact(n: number): number {
    if (n <= 1) return 1;
    return fact(n - 1) * n;
}

function method_drop(config: AppConfigState, ch: color_ch): method_result {
    const {target_red: r, target_any: a, target_green: g, target_blue: b} = config;
    const {r: chr, g: chg, b: chb} = ch;

    let total = r + g + b + a;
    let sumP = 0;
    for (let bfR = r; bfR <= total - b; bfR++) {
        for (let bfG = g; bfG <= total - bfR - b; bfG++) {
            let bfB = total - bfR - bfG;
            let p = Math.pow(chr, bfR) * Math.pow(chg, bfG) * Math.pow(chb, bfB);
            let c = comb(total, bfR) * comb(total - bfR, bfG);
            sumP += p * c;
        }
    }
    let p = 1 / sumP;

    return {
        attempts: p,
        attempt_cost_chr: 0,
        attempt_cost_jwl: 0,
        // actions: 0
    }
}

function explodeRGB2(n: number) {
    const obj: { [k: string]: { colors: { r: number, g: number, b: number }, count: number } } = {};

    function gen(z: number): number[][] {
        //pretty inefficient, but fast enough for low n
        if (z <= 0) return [[0, 0, 0]];
        const m1 = gen(z - 1);
        return [
            ...m1.map(([r, g, b]) => [r + 1, g, b]),
            ...m1.map(([r, g, b]) => [r, g + 1, b]),
            ...m1.map(([r, g, b]) => [r, g, b + 1]),
        ]
    }

    for (const [r, g, b] of gen(n)) {
        const key = `${r}r${g}g${b}b`;
        if (!obj[key])
            obj[key] = {colors: {r, g, b}, count: 1};
        else
            obj[key].count++;
    }

    return obj;
}


function objMap<T, A>(obj: { [key: string]: T }, map: (key: string, v: T) => A) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, map(k, v)]));
}


function method_chromatic_orb(config: AppConfigState, ch: color_ch): method_result {
    const {target_red: r, target_any: a, target_green: g, target_blue: b} = config;

    let c = r + g + b + a;

    const explode = objMap(explodeRGB2(c), (k, v) => {
        const {r, g, b} = v.colors;
        const {target_red: tr, target_green: tg, target_blue: tb} = config;
        const p = Math.pow(ch.r, r) * Math.pow(ch.g, g) * Math.pow(ch.b, b);
        return ({
            ...v,
            test: r >= tr && b >= tb && g >= tg,
            prob_self: p * (v.count - 1),
            prob_group: p * v.count,
            prob_one: p,
        });
    });
    const explodeKeys = Object.keys(explode);

    const trans = new Matrix(
        explodeKeys.map(row =>
            explodeKeys.map(col => {
                if (row == col) return explode[row].prob_self / (1 - explode[col].prob_one);
                return explode[row].prob_group / (1 - explode[col].prob_one);
            })
        )
    )

    // const final = await mdup(trans, 20);
    // const chances = final.getColumn(0);

    const evd = new EVD(trans);
    const eigen_1 = evd.realEigenvalues.findIndex(x => x > .99)
    const eigen_col = evd.eigenvectorMatrix.getColumn(eigen_1);
    const eigen_col_sum = eigen_col.reduce((a, b) => a + b);
    const chances = eigen_col.map(x => x / eigen_col_sum);

    const fpSucc = explodeKeys
        .map((k, i) => (explode[k].test ? chances[i] : 0))
        .reduce((a, b) => a + b);
    const p = fpSucc / (1 - fpSucc); // we don't attempt on already successful, normalize that out

    return {
        attempts: 1 / p,
        // actions: 1 / p,
        attempt_cost_chr: 1,
        attempt_cost_jwl: 0
    }
}


function method_add_rem(config: AppConfigState, ch: color_ch): method_result | null {
    const {target_red: r, target_any: a, target_green: g, target_blue: b} = config;
    const {r: chr, g: chg, b: chb} = ch;

    let c = r + g + b;
    if (c < 3) return null;
    let ccht = [chr, chg, chb];
    let rarity = [[chr, 0], [chg, 1], [chb, 2]];
    rarity.sort()

    let bench_costs = [0, 0, 1, 3, 10, 70, 350];
    let left = [r, g, b];
    let leftSum = r + g + b;
    let costChr = 0;
    let costJwl = 0;
    let costJwlC = 0;

    function pop1Color() {
        for (let [_, i] of rarity) {
            if (left[i] > 0) {
                left[i]--;
                leftSum--;
                return i;
            }
        }
        throw new Error("no more colors!");
    }

    //2 socket + set first 2 colors
    costJwl += bench_costs[2];
    costJwlC += bench_costs[2];
    costChr += (pop1Color() === pop1Color()) ? 25 : 15;
    let crafts = 1;

    let socket_count = 2;
    for (; leftSum > 0; socket_count++) {
        //obtain additional sockets
        let cc = pop1Color();
        let cch = ccht[cc];
        let bench_cost = bench_costs[socket_count + 1];
        let estTake = (1 / cch);
        costJwl += bench_cost * estTake;
        costJwlC += bench_cost * Math.ceil(estTake);
        crafts += Math.ceil(estTake);
    }
    for (let aLeft = a; aLeft > 0; aLeft--, socket_count++) {
        costJwl += bench_costs[socket_count + 1];
        crafts++;
    }

    return {
        attempts: 1,
        attempt_cost_chr: costChr,
        attempt_cost_jwl: costJwl,
        // actions: crafts
    }
}

const methods = gen_methods();
type methods_t = { [key: string]: (state: AppConfigState, ch: color_ch) => method_result | null }

function gen_methods() {
    const result: methods_t = {
        "Drop": method_drop,
        "Add/Rem Sockets": method_add_rem,
        "Chromatic Orb": method_chromatic_orb,
    };

    const RGB: { [key: string]: AppConfigParameter } = {
        "R": "target_red",
        "G": "target_green",
        "B": "target_blue"
    }

    const craft_sizes = [
        [[1], 4],
        [[1, 1], 15],
        [[2], 25],
        [[2, 1], 100],
        [[3], 125]
    ] as const;

    for (let [sz, cost] of craft_sizes) {
        if (sz.length === 1) {
            let v = sz[0]
            for (let [i, c] of Object.entries(RGB)) {
                result["bench " + v + i] = (st, ch) => {
                    if (st[c] < v) return null;
                    const modified = {...st, [c]: st[c] - v}
                    const {attempts} = method_drop(modified, ch);
                    return {attempts, attempt_cost_jwl: 0, attempt_cost_chr: cost, actions: attempts};
                }
            }
        } else if (sz.length === 2) {
            let [vA, vB] = sz;
            for (const [iA, cA] of Object.entries(RGB)) {
                for (const [iB, cB] of Object.entries(RGB)) {
                    if (iA === iB || (vA == vB && iB < iA)) continue;
                    result["bench " + `${vA}${iA}${vB}${iB}`] = (st, ch) => {
                        if (st[cA] < vA || st[cB] < vB) return null;
                        const modified = {...st, [cA]: st[cA] - vA, [cB]: st[cB] - vB}
                        const {attempts} = method_drop(modified, ch);
                        return {attempts, attempt_cost_jwl: 0, attempt_cost_chr: cost, actions: attempts};
                    }
                }
            }
        }
    }

    return result;
}

function calcResults(config: AppConfigState) {
    const {
        target_red,
        target_any,
        target_blue,
        target_green,
    } = config;

    let sum = target_red + target_blue + target_green + target_any;
    if (sum == 0 || sum > 6)
        return [];

    const results: calc_entry[] = [];
    const color_chance = color_chances(config);

    for (let [method, v] of Object.entries(methods)) {
        const res = v(config, color_chance);
        if (!res) continue;
        results.push({method, ...res})
    }

    function value(e: calc_entry) {
        return e.attempts * (e.attempt_cost_chr + e.attempt_cost_jwl / config.jewels_per_chroma);
    }

    results.sort((a, b) => value(a) - value(b))

    return results;
}

function round(n: number, digits: number = 0) {
    const mult = Math.pow(10, digits);
    return Math.round(n * mult) / mult;
}

function describe_attempt_cost(e: calc_entry) {
    const parts = [];
    if (e.attempt_cost_chr)
        parts.push(`${round(e.attempt_cost_chr, 1)}chr`)
    if (e.attempt_cost_jwl)
        parts.push(`${round(e.attempt_cost_jwl, 1)}jwl`)
    if (parts.length === 0)
        return "Free"
    return parts.join(" ")
}

function describe_total_cost(e: calc_entry) {
    const parts = [];
    if (e.attempt_cost_chr)
        parts.push(`${round(e.attempt_cost_chr * e.attempts, 1)}chr`)
    if (e.attempt_cost_jwl)
        parts.push(`${round(e.attempt_cost_jwl * e.attempts, 1)}jwl`)
    if (parts.length === 0)
        return "Free"
    return parts.join(" ")
}

export function CalcTable() {
    const config = useAppState(s => s.config);
    const setRequirements = useAppState(s => s.setRequirements);

    const results = useMemo(() => calcResults(config), [config]);

    useEffect(() => {
        const controller = new AbortController();

        function inputItemClass(text: string) {
            let dat: { [str: string]: string } = {"Int": "0", "Dex": "0", "Str": "0"};
            for (let line of text.split(/\r?\n/g)) {
                let spl = line.trim().split(/:\s*/g);
                if (spl.length === 2) {
                    let [k, v] = spl;
                    dat[k] = v;
                }
            }

            function hZ(val: number) {
                if (val === 0 || isNaN(val))
                    return 0;
                return val;
            }

            setRequirements({
                req_str: hZ(+dat["Str"]),
                req_dex: hZ(+dat["Dex"]),
                req_int: hZ(+dat["Int"])
            })
        }

        window.addEventListener("paste", ev => {
            let data = ev.clipboardData;
            if (!data) return;
            let text = data.getData("text/plain");
            if (!text.startsWith("Item Class:")) {
                console.log("Not an item paste?", text)
                return;
            }
            inputItemClass(text)
        }, {signal: controller.signal});

        return () => controller.abort();
    }, []);

    return <>
        <div id="botH_table">
            <span>Method</span>
            <span>Total Cost</span>
            <span>Attempt Cost</span>
            <span>Attempts</span>
            {/*<span>Actions</span>*/}
        </div>
        <div id="bot_table">
            {results.map(e => <React.Fragment key={e.method}>
                <span>{e.method}</span>
                <span>{describe_total_cost(e)}</span>
                <span>{describe_attempt_cost(e)}</span>
                <span>{e.attempts > 1 ? round(e.attempts, 1) : "N/A"}</span>
                {/*<span>{round(e.actions, 1)}</span>*/}
            </React.Fragment>)}
        </div>
    </>
}