
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export class ID {
    entity: number;
    type: string;
    number: number;

    constructor(entity: number, type: string, number: number)
    {
        this.entity = entity;
        this.type = type;
        this.number = number;
    }
}

export class Component {
    ID: ID;
    labels: string[];
    data: any;

    constructor(entity: number, type: string, data: any)
    {
        this.ID = new ID(entity, type, 0);
        this.labels = [];
        this.data = data;
    }
}

interface CommitPath
{
    path: string;
    added: Component[];
    updated: Component[];
    removed: Component[];
}

export class CommitProposal {
    context: number[];
    message: string;
    paths: CommitPath[];
}

interface Commit {
    ID: string;
    initiator: string;
    data: CommitProposal;
}

export class Filter
{
    constructor(path?: string, label?: string, type?: string)
    {
        this.path = path ? path : "*",
        this.label = label ? label : "*",
        this.type = type ? type : "*"
    }

    Parse(str: string)
    {
        let parts = str.split("::");
        if (parts.length !== 3)
        {
            throw new Error(`Couldn't parse filter ${str}`);
        }
        this.path = parts[0];
        this.label = parts[1];
        this.type = parts[2];

        return this;
    }

    path: string;
    label: string;
    type: string;    
}

function PassesFilter(filter: Filter, comp: Component)
{
    if (filter.label !== "*" && comp.labels.indexOf(filter.label) === -1)
    {
        return false;
    }
    if (filter.type !== "*" && comp.ID.type !== filter.type)
    {
        return false;
    }

    return true;
}

function FilterCommitPath(inputCPath: CommitPath, outputCPath: CommitPath, filter: Filter)
{
    if (filter.path !== "*" && inputCPath.path !== filter.path)
    {
        // path mismatch
        return false;
    }


    // TODO: this is stupid
    outputCPath.added = outputCPath.added.concat(inputCPath.added.filter(c => PassesFilter(filter, c)));
    outputCPath.updated = outputCPath.updated.concat(inputCPath.updated.filter(c => PassesFilter(filter, c)));
    outputCPath.removed = outputCPath.removed.concat(inputCPath.removed.filter(c => PassesFilter(filter, c)));

    // TODO: see above
    inputCPath.added = inputCPath.added.filter(c => !PassesFilter(filter, c));
    inputCPath.updated = inputCPath.updated.filter(c => !PassesFilter(filter, c));
    inputCPath.removed = inputCPath.removed.filter(c => !PassesFilter(filter, c));
}

export class FilteredCommit
{
    commit: Commit;
}

export class Rights
{
    filters: Filter[] = [];

    constructor(filters?: Filter[])
    {
        this.filters = filters ? filters : [];
    }

    parse(str: string)
    {
        this.filters = str.split("|").map((str) => new Filter().Parse(str));
        return this;
    }

    all()
    {
        this.filters.push(new Filter());

        return this;
    }

    FilterCommit(inputCommitPath: CommitPath)
    {
        let outputCPath: CommitPath = {
            path: inputCommitPath.path,
            added: [],
            updated: [],
            removed: []
        }
        let inputCPath: CommitPath = {
            path: inputCommitPath.path,
            added: inputCommitPath.added,
            updated: inputCommitPath.updated,
            removed: inputCommitPath.removed,
        }
        this.filters.forEach((filter) => {
            FilterCommitPath(inputCPath, outputCPath, filter);
        });

        if (outputCPath.added.length === 0 && outputCPath.removed.length === 0 && outputCPath.updated.length === 0)
        {
            return false;
        }

        return outputCPath;
    }

    CopyCommitWithoutPaths(commit: Commit)
    {
        return {
            ID: commit.ID,
            initiator: commit.initiator,
            data: {
                context: commit.data.context,
                message: commit.data.message,
                paths: []
            }
        } as Commit
    }

    ApplyRightsFilter(commit: Commit): FilteredCommit | false
    {
        let filteredCommit = this.CopyCommitWithoutPaths(commit);
        commit.data.paths.forEach(element => {
            let cm = this.FilterCommit(element);
            if (cm)
            {
                filteredCommit.data.paths.push(cm);            
            }
        });

        if (filteredCommit.data.paths.length === 0)
        {
            return false;
        }

        return { commit: filteredCommit };
    }
}

class Listener
{
    ID: string;
    rights: Rights;
    cb: (c: FilteredCommit) => void;
}

export class Ledger
{
    ledgerID: string;
    list: Commit[] = [];
    listeners: Listener[] = [];
    IDs: {} = {};

    constructor(id: string)
    {
        this.ledgerID = id;
    }

    id()
    {
        return this.ledgerID;
    }

    CommitProposal(proposal: CommitProposal, id? : string, initiator?: string)
    {
        // this is a stupid check, solve in a different way in the future
        if (id && this.IDs[id])
        {
            console.log(`Dupliate commit received ${initiator}::${id}`)
            return false;
        }
        
        if (!this.CheckValid(proposal))
        {
            return false;
        }

        let c: Commit = {
            ID: id ? id : generateUUID(),
            initiator: initiator ? initiator : this.ledgerID,
            data: proposal
        } 

        this.IDs[c.ID] = true;
        this.list.push(c);
        this.Notify(c);

        return true;
    }
    
    CheckValid(proposal: CommitProposal)
    {
        // TODO: check
        return true;
    }

    Notify(commit: Commit)
    {
        this.listeners.forEach((listener) => {
            if (listener.ID === commit.initiator)
            {
                // we got this commit from this node
                return;
            }
            let filteredCommit = listener.rights.ApplyRightsFilter(commit);
            if (filteredCommit)
            {
                listener.cb(filteredCommit);
            }
        });
    }

    

    Listen(ID: string, rights: Rights | string, cb: (c: FilteredCommit) => void)
    {
        this.listeners.push({
            ID,
            rights: typeof rights === "string" ? new Rights().parse(rights) : rights,
            cb
        } as Listener);
    }

    Mirror(rights: Rights | string, ledger: Ledger)
    {
        ledger.Listen(this.ledgerID, rights, (c: FilteredCommit) => {
            // console.log(`${this.ledgerID} Received from ${ledger.ledgerID} commit with initiator ${c.commit.initiator}`)
            this.CommitProposal(c.commit.data, c.commit.ID, ledger.ledgerID);
        });
    }
};