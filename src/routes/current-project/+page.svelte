<script>
import { onMount } from 'svelte';
let gridSize = {x: 60, y: 80};
let gridArr = getNewGrid(gridSize.x, gridSize.y);
let mouseGridPos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};
let gridStart = {x: 0, y: 0};
let lastUsedId = 1;
let selectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0};
let items = [{name: "header 1", height: 5, width: 20, type: "text", id: 0}, 
    {name: "header 2", height: 4, width: 16, type: "text", id: 0}, 
    {name: "header 3", height: 3, width: 10, type: "text", id: 0},];
let itemsInGrid = [];
let scrollY = 0;
let mousedown = false;
let dragDirection = "none"; 
let gridElement;
let selectType = "none";

function getSelectedItem(item){
    let selected = items.find(i => i.name == item);
    selectedItem = {name: selected.name, height: selected.height, width: selected.width, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: selected.type, id: selected.id};
    selectType = "itemPlace";
}
function placeItem(item){
    selectedItem = calPos(item);
    if(selectedItem != null && selectedItem.name != "none"){
        itemsInGrid = [...itemsInGrid,selectedItem];
        selectedItem =  {name : "none", height: 0, width: 0 , start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id: 0};
        //console.log(itemsInGrid);
    }
    else{
        selectedItem =  {name : "none", height: 0, width: 0 , start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id: 0};
    }
}
function calPos(Item){
    let start = mouseGridPos;
    let end = {x: start.x + Item.width, y: start.y + Item.height};
    if (end.x < gridSize.x-1 && end.y < gridSize.y-1){
        let newId = Item.id;
        if(Item.id === 0){
            lastUsedId = lastUsedId + 1;
            newId = lastUsedId;
        }
        return {name: Item.name, height: Item.height, width: Item.width, start: start, end: end, type: Item.type, id: newId};
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
function updateMousePos(){
    let cellId = {x: 0, y: 0}; 
    cellId.x = Math.floor((mousePos.x - gridStart.x) / 20);
    cellId.y = Math.floor((mousePos.y - gridStart.y) / 20);
    mouseGridPos = cellId;


    if (selectType == "itemSize" && selectedItem.name != "none" && mousedown == true){
        let newStart = selectedItem.start;
        let newEnd = selectedItem.end;
        let newWidth = selectedItem.width;
        let newHeight = selectedItem.height;
        if (dragDirection == "upleft") {//copilot helped with bugfixing this
            newStart = cellId;
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
        } else if (dragDirection == "up") {
            newStart = { x: selectedItem.start.x, y: cellId.y };
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
        } else if (dragDirection == "upright") {
            newStart = { x: selectedItem.start.x, y: cellId.y };
            newEnd = { x: cellId.x, y: selectedItem.end.y };
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
            newWidth = cellId.x - selectedItem.start.x + 1;
        } else if (dragDirection == "left") {
            newStart = { x: cellId.x, y: selectedItem.start.y };
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
        } else if (dragDirection == "right") {
            newEnd = { x: cellId.x, y: selectedItem.end.y };
            newWidth = cellId.x - selectedItem.start.x + 1;
        } else if (dragDirection == "downleft") {
            newStart = { x: cellId.x, y: selectedItem.start.y };
            newEnd = { x: selectedItem.end.x, y: cellId.y };
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
            newHeight = cellId.y - selectedItem.start.y + 1;
        } else if (dragDirection == "down") {
            newEnd = { x: selectedItem.end.x, y: cellId.y };
            newHeight = cellId.y - selectedItem.start.y + 1;
        } else if (dragDirection == "downright") {
            newEnd = { x: cellId.x, y: cellId.y };
            newHeight = cellId.y - selectedItem.start.y + 1;
            newWidth = cellId.x - selectedItem.start.x + 1;
        }
        let index = itemsInGrid.indexOf(selectedItem);
        itemsInGrid[index] = {name : selectedItem.name , height: newHeight, width: newWidth, start: newStart, end: newEnd, type: selectedItem.type, id: selectedItem.id};
        itemsInGrid = [...itemsInGrid]
        selectedItem = itemsInGrid[index]
    }
}

function selectPlacedItem(item){
    if(selectedItem != item){// väljer vid ett click
        selectedItem = item;
        selectType = "itemSelect";
    }
    else if(selectedItem == item && selectType == "itemSelect"){// ändrar text vid ett till click
        changeText(item);
    }
}
function rePlaceItem(item) {
    if (selectType === "itemSelect") {
        selectType = "itemPlace";
        const index = itemsInGrid.findIndex(i => i === item);
        if (index !== -1) {
            itemsInGrid.splice(index, 1); 
            itemsInGrid = [...itemsInGrid];
        }
    }
}
function changeText(item){// ändrar text vid dubbel click
    selectedItem = item;
    selectType = "itemText"
    const input = document.getElementById(String(item.id)); //https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
    console.log(input);
    input.focus();
    input.select();}

function changeSize(item, Direction){
    selectedItem = item;
    selectType = "itemSize";
    dragDirection = Direction;
}


//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
onMount(() => {

    let animationFrame; //copilot suggested this to stop freezeing

function update() {
    if (mousedown) {
        updateMousePos();
        animationFrame = requestAnimationFrame(update);
    }
}
        window.addEventListener("mousemove", (event) => {
            mousePos = { x: event.clientX, y: event.clientY };
        });
        window.addEventListener("mousedown", (event) => {
            mousedown = true;
            if(selectType == "itemText"){
                var textElement = document.getElementById(String(selectedItem.id));
                if(document.activeElement === textElement){ // https://stackoverflow.com/questions/36430561/how-can-i-check-if-my-element-id-has-focus
                selectType = "itemText";}
                else if(document.activeElement !== textElement){
                    selectType = "itemSelect";
                }

            }
            animationFrame = requestAnimationFrame(update);
        });

        window.addEventListener("mouseup", (event) => {
            mousedown = false;
            cancelAnimationFrame(animationFrame);
            if (selectType == "itemPlace") {
                placeItem(selectedItem);
                selectType = "itemSelect";
            }
            else if(selectType == "itemSize"){
                selectType = "itemSelect";
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
            <div class = "cell" role = "region" tabindex="-1">
            </div>
            {/each}
        </section>
        <section style="height: 100%; width: 100%;">
            {#each itemsInGrid as item}
            <div class = "item" class:selected = {item == selectedItem} style="width:{item.width *20}px; height:{item.height*20}px; top: {(item.start.y*20) + gridStart.y}px; left: {(item.start.x *20) + gridStart.x}px;">
                <input type="button" on:mousedown={() => rePlaceItem(item)} style= "top: {-5}px; left: {- 5}px; width:{item.width *20+5}px; height:{item.height*20+5}px;" class = "border" class:invisible = {item != selectedItem}/>
                <input type="text" value={item.name} on:input={(e) => item.name = e.target.value} class = "textInput" id = {String(item.id)}/>
                <input type="button" on:mousedown={() => selectPlacedItem(item)} style="height: 100%; width: 100%; position: absolute;" on:dblclick={() => changeText(item)}/>   
                <div class:invisible = {item != selectedItem} style="height: 100%; width: 100%;">
                    <input type="button" on:mousedown={() => changeSize(item, "upleft")} style= "top: {- 5}px; left: {- 5}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "up")} style= "top: {- 5}px; left: {(item.width*20/2)}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "upright")} style= "top: {- 5}px; left: {- 8 + item.width*20}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "left")} style= "top: {item.height*10-8}px; left: {- 5}px;" class = "sizeButton"/>  
                    <input type="button" on:mousedown={() => changeSize(item, "right")} style= "top: { item.height*10-8}px; left: { -8 + item.width*20}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downleft")} style= "top: {+ item.height*20 -8}px; left: {- 5}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "down")} style= "top: {+ item.height*20 - 8}px; left: {+ item.width*10}px;" class = "sizeButton"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downright")} style= "top: {+ item.height*20 -8}px; left: {-8 + item.width*20}px;" class = "sizeButton" />
                </div>
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
    <h2>{selectedItem.name}</h2>
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
    .sizeButton{
        position: absolute;
        background-color: rgb(0, 17, 255);
        border: 1px solid black;
        width: 10px;
        height: 10px;
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
        border: 2px solid rgb(0, 17, 255);
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
    .item {
    position: absolute;
    background-color: lightblue;
    }
    .border{
        position: absolute;
        background-color: transparent;
        border: 5px solid black;
        width: 100%;
        height: 100%;
    }
    .border:hover{
        border: 5px solid rgb(0, 17, 255);
        cursor: move;
    }
</style>