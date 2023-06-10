import { CommitProposal, Component, Filter, FilteredCommit, Ledger, Rights } from "./ifc5";

// SETUP
let main = new Ledger("main");

function commitLogger(name: string)
{
    return (c: FilteredCommit) => {
        console.log(`${name} ${c.commit.initiator}::${c.commit.ID}::${c.commit.data.message}`);
    }
}

main.Listen("listener_main", new Rights().all(), commitLogger("[MAIN]"));

let arc_mesh = new Ledger("arc");

arc_mesh.Mirror("arc::*::*", main);
arc_mesh.Listen("listener_arc", new Rights().all(), commitLogger("[ARC] "));

let arc_mep = new Ledger("mep");

arc_mep.Mirror("mep::*::*", main);
arc_mep.Listen("listener_mep", new Rights().all(), commitLogger("[MEP] "));

{
    main.Mirror(new Rights().all(), arc_mesh);
    main.Mirror(new Rights().all(), arc_mep);
}


// COMMIT
{
    let proposal = new CommitProposal();
    proposal.context = [];
    proposal.message = "new commit to arc";
    proposal.paths = [
        {
            path: "arc",
            added: [
                new Component()
            ],
            updated: [],
            removed: []
        }
    ]
    main.CommitProposal(proposal);
}

{
    let proposal = new CommitProposal();
    proposal.context = [];
    proposal.message = "new commit to mep";
    proposal.paths = [
        {
            path: "mep",
            added: [
                new Component()
            ],
            updated: [],
            removed: []
        }
    ]
    main.CommitProposal(proposal);
}