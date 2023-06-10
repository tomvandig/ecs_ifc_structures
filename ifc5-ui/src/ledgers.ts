import { FilteredCommit, Ledger, Rights } from "./ifc5";

let main_ledger = new Ledger("main");

function commitLogger(name: string)
{
    return (c: FilteredCommit) => {
        console.log(`${name} ${c.commit.initiator}::${c.commit.ID}::${c.commit.data.message}`);
    }
}

main_ledger.Listen("listener_main", new Rights().all(), commitLogger("[MAIN]"));

let arc_ledger = new Ledger("arc");

arc_ledger.Mirror("arc::*::*", main_ledger);
arc_ledger.Listen("listener_arc", new Rights().all(), commitLogger("[ARC] "));

let mep_ledger = new Ledger("mep");

mep_ledger.Mirror("mep::*::*", main_ledger);
mep_ledger.Listen("listener_mep", new Rights().all(), commitLogger("[MEP] "));

{
    main_ledger.Mirror(new Rights().all(), arc_ledger);
    main_ledger.Mirror(new Rights().all(), mep_ledger);
}

let floorplan_ledger = new Ledger("floorplan");
floorplan_ledger.Mirror("*::*::*", main_ledger);


export const ARC_LEDGER = arc_ledger;
export const MEP_LEDGER = mep_ledger;
export const FLOORPLAN_LEDGER = floorplan_ledger;
