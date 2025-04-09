<script>
import { onMount } from 'svelte';
let gridSize = {x: 60, y: 80};
let gridArr = getNewGrid(gridSize.x, gridSize.y);
let mouseGridPos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};
let gridStart = {x: 0, y: 0};
let selectedItem = {name : "none", height: 0, width: 0 , start: {x: 0, y: 0}, end: {x: 0, y: 0}}, type; "none";
let items = [{name: "header 1", height: 5, width: 20, type: "text"}, 
    {name: "header 2", height: 4, width: 16, type: "text"}, 
    {name: "header 3", height: 3, width: 10, type: "text"}];
let itemsInGrid = [];
let scrollY = 0;
let mousedown = false;
let gridElement;
let selectType = "none";

function getSelectedItem(item){
    let selected = items.find(i => i.name == item);
    selectedItem = {name: selected.name, height: selected.height, width: selected.width, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: selected.type};
    selectType = "itemPlace";
}
function placeItem(item){
    selectedItem = calPos(item);
    if(selectedItem != null && selectedItem.name != "none"){
        itemsInGrid = [...itemsInGrid,selectedItem];
        selectedItem =  {name : "none", height: 0, width: 0 , start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none"};
        console.log(itemsInGrid);
    }
    else{
        selectedItem =  {name : "none", height: 0, width: 0 , start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none"};
    }
}
function calPos(Item){
    let start = mouseGridPos;
    let end = {x: start.x + Item.width, y: start.y + Item.height};
    if (end.x < gridSize.x-1 && end.y < gridSize.y-1){
        return {name: Item.name, height: Item.height, width: Item.width, start: start, end: end, type: Item.type};
    }
    else{
        return null;}}


function getNewGrid(x,y){
    let gridArr = [];
    for(let i = 0; i < y; i++){
        for(let j = 0; j < x; j++){
        gridArr.push({x: j, y: i});
    }}
    return gridArr;}
function updateMousePos(cellId){
    mouseGridPos = cellId;}

function selectPlacedItem(item){
    if(selectedItem != item){// väljer vid ett click
        selectedItem = item;
        selectType = "itemSelect";}}
function changeText(item){// ändrar text vid dubbel click
    selectedItem = item;
    selectType = "itemText"
    const input = document.getElementById(item); //https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
    console.log(input);
    input.focus();
    input.select();}

//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
onMount(() => {
        window.addEventListener("mousemove", (event) => {
            mousePos = { x: event.clientX, y: event.clientY };
        });
        window.addEventListener("mousedown", (event) => {
            mousedown = true;
        });
        window.addEventListener("mouseup", (event) => {
            mousedown = false;
            if (selectType == "itemPlace") {
                placeItem(selectedItem);
                selectType = "none";
            }
            
        });
        
        if (gridElement) {//copilot suggested this
            const rect = gridElement.getBoundingClientRect();
            gridStart = { x: rect.left, y: rect.top }; // Store the grid's top-left corner coordinates
            console.log("Grid Start Coordinates:", gridStart);
        }
    });

</script>
<svelte:window bind:scrollY={scrollY} />
<main>
    <article class = "tools">
        <h1>Tools</h1>
        <section>
            <h2>Text</h2>
            <input type="button" value="Header 1" on:mousedown={() => getSelectedItem("header 1")}/>    
            <input type="button" value="Header 2" on:mousedown={() => getSelectedItem("header 2")}/>   
            <input type="button" value="Header 3" on:mousedown={() => getSelectedItem("header 3")}/>   
        </section>
    </article>
    <article style="height: 100%; width: 100%;">
        <section class = "websiteGrid" bind:this={gridElement}>
            {#each gridArr as cell}
            <div class = "cell" role = "region" on:mouseover={() =>updateMousePos(cell)} on:focus={() =>updateMousePos(cell)} tabindex="-1">
            </div>
            {/each}
        </section>
        <section style="height: 100%; width: 100%;">
            {#each itemsInGrid as item}
            <div class = "item" class:selected = {item == selectedItem} style="width:{item.width *20}px; height:{item.height*20}px; top: {(item.start.y*20) + gridStart.y}px; left: {(item.start.x *20) + gridStart.x}px; background-color: lightblue; position: absolute;">
                <input type="text" value={item.name} on:input={(e) => item.name = e.target.value} class = "textInput" id = {item}/>
                <input type="button" on:mousedown={() => selectPlacedItem(item)} style="height: 100%; width: 100%; position: absolute;" on:dblclick={() => changeText(item)}/>   
            </div>
            {/each}
        </section>
    </article>
    <article class = "settings">
        <h1>Settings</h1>
        <h2>Themes</h2>
    </article>
</main>

<aside class="selectedItem" class:invisible = {selectedItem.name == "none" || mousedown == false || selectType != "itemPlace"} style="top: {mousePos.y + scrollY}px; left: {mousePos.x}px; height: {selectedItem.height *20}px; width: {selectedItem.width*20}px;" >
    <h2>Selected Item</h2>
{#each Object.entries(mousePos) as [key, value]}
    <p>{key}: {value}</p>
{/each}
</aside>

<style>
    main {
        display: grid;
        height: 100%;
        width: 100%;
        background-color: darkgray;
        grid-template-columns: 200px 5fr 200px;
    }
    .websiteGrid {
        display: grid;
        grid-template-columns: repeat(60, 20px);
        grid-template-rows: repeat(80, 20px);
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: center;
        
    }

    .tools {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: lightblue;
        height: 100%;
        width: 100%;
    }
    .settings {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: lightblue;
        height: 100%;
        width: 100%;
    }
    .cell{
        border: 1px dashed black;
        width: 20px;
        height: 20px;
        
    }
    .cell:hover{
        background-color: lightblue;
        border: 1px solid black;

    }
    .selectedItem{
        background-color: lightblue;
        padding: 10px;
        display: flex;
        position: absolute;
    }
    .invisible{
        display: none;
    }
    .selected{
        border: 4px dashed black;
    }
    .textInput{
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: none;
        outline: none;
        font-size: 20px;
        position: absolute;
    }
</style>