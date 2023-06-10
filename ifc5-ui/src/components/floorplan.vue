<script setup lang="ts">
import { FilteredCommit, Rights } from '@/ifc5';
import { FLOORPLAN_LEDGER } from '../ledgers';
import { ref, onMounted } from 'vue'

let ctx: CanvasRenderingContext2D | false = false;
let width = 0;
let height = 0;
let random = `${Math.random()}`;

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
        x: Math.floor((p.x + 300)/600 * width),
        y: Math.floor((p.y + 300)/600 * height), 
    }
}

function TransformSize(size: Pos): Pos
{
    // world space is [-200, 200]
    // device space is [0, width]
    return {
        x: Math.floor((size.x/600 * width)),
        y: Math.floor((size.y/600 * height)), 
    }
}

function drawObj(ctx: CanvasRenderingContext2D, loc: Pos, col: string)
{
    ctx.fillStyle = col;
    let size = 100;
    let rectPoint: Pos = {
        x: loc.x - size/2,
        y: loc.y - size/2
    }
    let transformedRectPoint = TransformToView(rectPoint);

    let transformedSize = TransformSize({x: 100, y: 100})

    ctx.fillRect(transformedRectPoint.x, transformedRectPoint.y, transformedSize.x, transformedSize.y);
}

function draw()
{
    if (ctx)
    {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        drawObj(ctx, pos1, "green");
        drawObj(ctx, pos2, "cyan");
    }
}

FLOORPLAN_LEDGER.Listen("floorplan_view", new Rights().all(), (c: FilteredCommit) => {
    c.commit.data.paths.forEach((path) => {
        path.updated.forEach((comp) => {
            if (comp.ID.entity === 0)
            {
                pos1 = comp.data;
            }
            else
            {
                pos2 = comp.data;
            }
        })
    });
    draw();
});


onMounted(() => {

    let canvas = document.getElementById(`${random}`);
    
    //@ts-ignore
    ctx = canvas.getContext("2d");

    //@ts-ignore
    width = canvas!.width;
    //@ts-ignore
    height = canvas!.height;

    if (ctx)
    {
        draw();
    }
});


</script>

<template>
  <div class="canvasdiv">
    <canvas class="canvas" :id="random"></canvas>
  </div>
</template>

<style scoped>

.canvasdiv {
    width: 100%;
    height: 100%;
}
.canvas {
    width: 100%;
    height: 100%;
}
</style>
