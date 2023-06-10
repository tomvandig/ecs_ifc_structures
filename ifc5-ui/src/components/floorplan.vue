<script setup lang="ts">
import { CommitProposal, Component, FilteredCommit, Rights } from '@/ifc5';
import { FLOORPLAN_LEDGER } from '../ledgers';
import { ref, onMounted } from 'vue'

const props = defineProps({
  entityID: Number
})

let ctx: CanvasRenderingContext2D | false = false;
let width = 0;
let height = 0;
let dim = 0;
let random = `${Math.random()}`;
let shape1 = false;
let shape2 = false;

interface Pos {
    x: number,
    y: number
}

let pos1 = {
    x: 200,
    y: 0
};

let pos2 = {
    x: -200,
    y: 0
};

function TransformToView(p: Pos): Pos
{
    // world space is [-200, 200]
    // device space is [0, width]
    return {
        x: Math.floor(width*0.1 + (p.x + 200)/400 * dim),
        y: Math.floor(height*0.1 + (p.y + 200)/400 * dim), 
    }
}

function TransformSize(size: Pos): Pos
{
    // world space is [-200, 200]
    // device space is [0, width]
    return {
        x: Math.floor((size.x/400 * dim)),
        y: Math.floor((size.y/400 * dim)), 
    }
}

function drawObj(ctx: CanvasRenderingContext2D, loc: Pos, col: string, shape: boolean)
{
    let size = 100;
    let rectPoint: Pos = {
        x: loc.x - (size/2 * (shape ? 0 : 1)),
        y: loc.y - (size/2 * (shape ? 0 : 1))
    }
    let transformedRectPoint = TransformToView(rectPoint);

    let transformedSize = TransformSize({x: 100, y: 100})

    if (shape)
    {
        ctx.strokeStyle = col;
        ctx.lineWidth   = 5;
        ctx.beginPath();
        ctx.arc(transformedRectPoint.x, transformedRectPoint.y, transformedSize.x / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
    else
    {
        ctx.fillStyle = col;
        ctx.fillRect(transformedRectPoint.x, transformedRectPoint.y, transformedSize.x, transformedSize.y);
    }
}

function draw()
{
    if (ctx)
    {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        drawObj(ctx, pos1, "green", shape1);
        drawObj(ctx, pos2, "cyan", shape2);
    }
}

function changeShape()
{
    let data = false;
    if (props.entityID === 0)
    {
        shape1 = !shape1;
        data = shape1;
    }
    else
    {
        shape2 = !shape2;
        data = shape2;
    }

    let proposal = new CommitProposal();
    proposal.message = `Changed shape of ${props.entityID}`;
    proposal.paths = [
        {
            path: "shapes",
            added: [],
            updated: [
                new Component(props.entityID!, "shape", data)],
            removed: []
        }
    ]
    FLOORPLAN_LEDGER!.CommitProposal(proposal);

    draw();
}

FLOORPLAN_LEDGER.Listen("floorplan_view", new Rights().all(), (c: FilteredCommit) => {
    c.commit.data.paths.forEach((path) => {
        path.updated.forEach((comp) => {
            if (comp.ID.type === "position")
            {
                if (comp.ID.entity === 0)
                {
                    pos1 = comp.data;
                }
                else
                {
                    pos2 = comp.data;
                }
            }
            else if (comp.ID.type === "shape")
            {
                if (comp.ID.entity === 0)
                {
                    shape1 = comp.data;
                }
                else
                {
                    shape2 = comp.data;
                }
            }
        })
    });
    draw();
});


onMounted(() => {

    let canvas = document.getElementById(`${random}`);
    
    //@ts-ignore
    ctx = canvas.getContext("2d");
    
    canvas!.width = canvas!.getBoundingClientRect().width;
    canvas!.height = canvas!.getBoundingClientRect().height;

    //@ts-ignore
    width = canvas!.width;
    //@ts-ignore
    height = canvas!.height;

    dim = Math.floor(0.8 * Math.min(width, height));

    if (ctx)
    {
        draw();
    }
});


</script>

<template>
  <div class="canvasdiv">
    <canvas class="canvas" :id="random"></canvas>
    <button v-on:click="changeShape">Change shape</button>
  </div>
</template>

<style scoped>

.canvasdiv {
    width: 100%;
    height: 100%;
}
.canvas {
    width: 100%;
    height: 90%;
}
</style>
