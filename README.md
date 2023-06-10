[Demo](https://tomvandig.github.io/ecs_ifc_structures/ifc5-ui/dist/)

# ecs_ifc_structures

![pic.](drawio_ecs.png)


```


commits group component adds/removes/edits
entities are never explicitly added or removed

entities are global, but components live in a hierarchy with paths seperated by /
    paths mainly serve as data partitioning, and rights boundaries

component types are explicitly added but never edited nor removed

For unqueryable binary contents, the blob type is used. 
    Blobs can be uploaded and downloaded as is but not inspected deeper by the ecs code.

!!! A user should be able to download commits scoped to his rights in terms of types and paths, and still contribute to the repository
Essentially, this means that commits don't have a strict "precedes" attribute 
    and instead are valid if they don't violate constraints, inserted in the order determined by the server
    
Component (c2n98e23981022, ifc2x3::cartesianpoint, 1) (human readable id) 
        <=> 
(9382,15,1) (internal numeric id) <=> 000024A6-000F-0001  (fused hex 64 bit, flip order to increase locality of reference)

maximum counts:
    entities: 4 billion
    types: 65k
    components of same type per entity: 65k 

Commit: Author:         bob@bob.com
        Message:        moved wall
        Date:           19/04/2023
        Application:    Revit
        Hash:           9cn823r09c123898
        Context:        [0cn924c81328c129, 49c82n30c283743]
        Scope: *
            Add type ifc2x3::cartesianpoint (x,y,z)
        Scope:          /project/files/arch.ifc
            modify:     Add Component 3819238



Path: (address: /project/files/arch.ifc, components: [3819238])

Entites: [13]

ComponentType {
    name: ifc2x3::cartesianpoint
    schema: {
        x: real,
        y: real,
        z: real,
        parent: optional reference ifc2x3::cartesianpoint,
        blob: blobid
    }
}

Component {
    ID: (entity: 13, type: ifc2x3::cartesianpoint, number: 1)
    hash: 2cm8r2c2389c09m2349023,
    labels: [clearance],
    deephash: 03298nc0293847cn092s,
    data: {
        x: 23,
        y: 10,
        z: 9,
        parent: 000024A6-000F-0001,
        blob: 40c298n43c9384c09384c
    }
}

Blob {
    ID: 40c298n43c9384c09384c                  // hash of the blob
    data: [...]
}

User: Name: Bob
      Email: bob@bob.com
      Token: 0r8932cn0r02938rc702938e9
      Rights: 
        Scopes: /project/files/*
        Types: ifc2x3::cartesianpoint

API:

 -- ledger
POST /ledger/commit 
GET /ledger/<commit_id>                        // get commit by id, filter on type
GET /ledger/scope/<path>/entity/<entity_id>    // get commits for scope/entity, filter on type, truncate to number or revision
WS  /ledger/scope/<path>                       // get notified of commits on path, filtered by types

 -- blobs
POST /blob/
GET /blob/<blob_id>                            // get blob by id 

 -- query
GET /ecs/<commit_id>/scope/<path>/entity/<entity_id>        // get components for scope/entity, filter on type
GET /ecs/<commit_id>/scope/<path>/components/<component_id> // get component by id, filter on sub-component properties
GET /ecs/components/types                                   // get all component types
GET /ecs/entities                                           // get all known entities

 -- remotes
POST /remote/read/<name>                        // create remote with <name>, include token and rights



important considerations:
 - shared ownership
 - ifc5 can represent ifc2/4
 - versioning
 - local data
 - exact schema not important
 - extensible
 - automation
 - auditing 
 - simplicity







versioned storage

query object X version Y

data itself in giant ever-increasing list with offset "dataIndex", revision, and link to previous revision

store tuples of:
{
    objectID: number
    changedRevision: number
    type: number
    dataIndex: number
}

(12 bytes per tuple, 100mil objects = 1.2GB)

on top of this, store tuples for last N commits (incrementally)

querying top N level elements is super fast, older means slower



objects can be interpreted if all their components and all of the referenced components of those components are available.
component references can only flow downstream in the object hierarchy
labels combined with component types are used to filter objects for querying and rights
having rights to a component implies having rights to interpreting that component, meaning rights to all downstream components

a "filter rule" is a tuple of [path, type, label],
a "filter" is a list of filter rules,
if something is not explicitly named in a filter it does not pass the filter,
multiple rules in a filter work as OR,
items within a filter rule work as AND,
right management is done by giving each user a "rights filter".

Example:
[/ids/*, *, *]
[/models/arc/*, *::furniture, *]
[/models/arc/*, *, exterior]
[/clashes/arc/*, *, clearance]

paths are for organizing data hierarchy in the project, NOT for organizing the hierarchy within the model itself
```
