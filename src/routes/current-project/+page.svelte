<script>
import { onMount } from 'svelte';
import {currentTheme} from '$lib/theme-storage'; //https://www.reddit.com/r/sveltejs/comments/15p6t4w/how_do_i_use_different_themes_with_skeleton_ui/
import textFit from 'textfit'; //
let gridSize = {x: 60, y: 80};
let gridArr = getNewGrid(gridSize.x, gridSize.y);
let mouseGridPos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};
let gridStart = {x: 0, y: 0};
let placementOffset = {x: 0, y: 0};
let lastUsedId = 1;
let selectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false};
let resetSelectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false};
let items = [{name: "header 1", height: 5, width: 20, type: "text", id: 0, fontSize: "95px"}, 
    {name: "header 2", height: 4, width: 16, type: "text", id: 0, fontSize: "75px", changeFontManually: false}, 
    {name: "header 3", height: 3, width: 10, type: "text", id: 0, fontSize: "45px", changeFontManually: false}];
let itemsInGrid = [];
let scrollY = 0;
let mousedown = false;
let dragDirection = "none"; 
let gridElement;
let selectType = "none";

function getSelectedItem(item){
    let selected = items.find(i => i.name == item);
    selectedItem = {name: selected.name, height: selected.height, width: selected.width, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: selected.type, id: selected.id, fontSize: selected.fontSize, changeFontManually: selected.changeFontManually};
    selectType = "itemPlace";
}
function placeItem(item){
    selectedItem = calPos(item);
    if(selectedItem != null && selectedItem.name != "none"){
        placementOffset = {x: 0, y: 0}; 
        itemsInGrid = [...itemsInGrid,selectedItem];
        selectedItem =  resetSelectedItem;
        //console.log(itemsInGrid);
    }
    else{
        selectedItem =  resetSelectedItem;
    }
}
function calPos(Item){
    let start = {x: mouseGridPos.x - Math.floor(placementOffset.x /20), y: mouseGridPos.y - Math.floor((placementOffset.y  - scrollY) /20) };
    let end = {x: start.x + Item.width, y: start.y + Item.height};
    if (end.x < gridSize.x-1 && end.y < gridSize.y-1){
        let newId = Item.id;
        if(Item.id === 0){
            lastUsedId = lastUsedId + 1;
            newId = lastUsedId;
        }
        return {name: Item.name, height: Item.height, width: Item.width, start: start, end: end, type: Item.type, id: newId, fontSize: Item.fontSize, changeFontManually: Item.changeFontManually};
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


    if (selectType == "itemSize" && selectedItem.name != "none" && mousedown == true){//resizing the item
        let newStart = selectedItem.start;
        let newEnd = selectedItem.end;
        let newWidth = selectedItem.width;
        let newHeight = selectedItem.height;
        if (dragDirection == "upleft") {//copilot helped with bugfixing this 
            if (cellId.x < selectedItem.end.x && cellId.y < selectedItem.end.y) {
            newStart = cellId;
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
            }
        } else if (dragDirection == "up") {
            if (cellId.y < selectedItem.end.y) {
            newStart = { x: selectedItem.start.x, y: cellId.y };
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);}
        } else if (dragDirection == "upright") {
            if (cellId.x > selectedItem.start.x && cellId.y < selectedItem.end.y) {
            newStart = { x: selectedItem.start.x, y: cellId.y };
            newEnd = { x: cellId.x, y: selectedItem.end.y };
            newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
            newWidth = cellId.x - selectedItem.start.x ;}
        } else if (dragDirection == "left") {
            if (cellId.x < selectedItem.end.x) {
            newStart = { x: cellId.x, y: selectedItem.start.y };
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);}
        } else if (dragDirection == "right") {
            if (cellId.x > selectedItem.start.x) {
            newEnd = { x: cellId.x, y: selectedItem.end.y };
            newWidth = cellId.x - selectedItem.start.x ;}
        } else if (dragDirection == "downleft") {
            if (cellId.x < selectedItem.end.x && cellId.y > selectedItem.start.y) {
            newStart = { x: cellId.x, y: selectedItem.start.y };
            newEnd = { x: selectedItem.end.x, y: cellId.y };
            newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
            newHeight = cellId.y - selectedItem.start.y ;}
        } else if (dragDirection == "down") {
            if (cellId.y > selectedItem.start.y) {
            newEnd = { x: selectedItem.end.x, y: cellId.y };
            newHeight = cellId.y - selectedItem.start.y ;}
        } else if (dragDirection == "downright") {
            if (cellId.x > selectedItem.start.x && cellId.y > selectedItem.start.y) {
            newEnd = { x: cellId.x, y: cellId.y };
            newHeight = cellId.y - selectedItem.start.y ;
            newWidth = cellId.x - selectedItem.start.x ;}
        }
        if (
            newStart.x !== selectedItem.start.x ||
            newStart.y !== selectedItem.start.y ||
            newWidth !== selectedItem.width ||
            newHeight !== selectedItem.height
        ) {
        let index = itemsInGrid.findIndex(i => i.id === selectedItem.id);
        if (index !== -1) {
        if(selectedItem.changeFontManually == false){
        selectedItem.fontSize = adjustFontSize(selectedItem.id, selectedItem.name);} // Update the font size when the contaiener size changes
        itemsInGrid[index] = {name : selectedItem.name , height: newHeight, width: newWidth, start: newStart, end: newEnd, type: selectedItem.type, id: selectedItem.id, fontSize: selectedItem.fontSize, changeFontManually: selectedItem.changeFontManually};
        selectedItem = itemsInGrid[index]
        }
        }
    }
}

function selectPlacedItem(item){
    if(selectedItem != item){// select on click
        selectedItem = item;
        selectType = "itemSelect";
    }
    else if(selectedItem == item && selectType == "itemSelect"){// changes text when clicked again
        changeText(item);
    }
}
function rePlaceItem(item) {
    if (selectType === "itemSelect") {
        selectType = "itemPlace";
        placementOffset = { x: mousePos.x - item.start.x * 20 - gridStart.x, y: mousePos.y + scrollY - item.start.y * 20 - gridStart.y}; // offset for placement
        const index = itemsInGrid.findIndex(i => i.id === item.id);;
        if (index !== -1) {
            itemsInGrid.splice(index, 1); // remove the item from the array
        }
    }
}
function changeText(item){// changes text when double clicked
    selectedItem = item;
    selectType = "itemText"
    const input = document.getElementById(String(item.id)); //https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
    console.log(input);
    setTimeout(() => {
        input.select();
        input.focus();
    }, 0);}

function changeSize(item, Direction){
    selectedItem = item;
    selectType = "itemSize";
    dragDirection = Direction;
}
function deSelect(){
    selectedItem = resetSelectedItem;
    selectType = "none";
}

function updateTheme(theme) {
    $currentTheme = theme;
}
function adjustFontSize(id, innerText) { // changes the font size of the text area using a div element to enable text fit
    let divElement = document.getElementById(-id);
    divElement.innerText = innerText; 
    textFit(divElement, {multiLine: true, minFontSize:2, maxFontSize: 150, widthOnly: false, alignHoriz: false, alignVert: true}); //https://github.com/STRML/textFit
    return divElement.children[0].style.fontSize;
}
function manuallyChangeFontSize(item, fontSize) { 
    let index = itemsInGrid.findIndex(i => i.id === item.id);
    itemsInGrid[index].fontSize = String(fontSize) + "px";
    selectedItem = itemsInGrid[index];
}

 

//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
onMount(() => {

    let animationFrame; //copilot suggested this to stop freezeing

    function update() {
    if (mousedown && selectType === "itemSize") {
        updateMousePos(); 
        animationFrame = requestAnimationFrame(update); 
    } else {
        cancelAnimationFrame(animationFrame);
    }
}

        window.addEventListener("mousemove", (event) => {
            mousePos = { x: event.clientX, y: event.clientY };
        });

        window.addEventListener("mousedown", (event) => {
            mousedown = true;
            if(selectType == "itemText"){
                var textElement = document.getElementById(String(selectedItem.id));
                if(document.activeElement !== textElement){
                    selectType = "itemSelect";
                }
                else if(document.activeElement == null){
                    selectType = "itemSelect";
                }

            }
            if (selectType == "itemSize"){
            animationFrame = requestAnimationFrame(update);
            }
        });
        window.addEventListener("mouseup", (event) => {
            mousedown = false;
            cancelAnimationFrame(animationFrame);
            if (selectType == "itemPlace") {
                updateMousePos();
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
                <textarea value={item.name} style="font-size: {item.fontSize};" on:input={(e) => {
                    item.name = e.target.value;
                    if(item.changeFontManually == false){
                    item.fontSize = adjustFontSize(item.id, item.name);} // Update the font size when the text changes
                    selectedItem = item;
                    }} 
                    class = "textInput" id = {String(item.id)} class:higherZ = {document.activeElement == document.getElementById(String(item.id))}/>
                <div style="height: 100%; width: 100%; color: transparent; background-color: transparent;" class = "textInput" id = {String(-item.id)}> {item.name} </div>  <!--a div that changes font size with help of text fit and then applies that font size to the text area because of lack of support of text area-->  
                <input type="button" on:mousedown={() => selectPlacedItem(item)} style="height: 100%; width: 100%; position: absolute;" on:dblclick={() => changeText(item)}/>   
                <div class:invisible = {item != selectedItem} style="height: 100%; width: 100%;">
                    <input type="button" on:mousedown={() => changeSize(item, "upleft")} style= "top: {- 5}px; left: {- 5}px;" class = "sizeButton" id = "upleft"/>
                    <input type="button" on:mousedown={() => changeSize(item, "up")} style= "top: {- 5}px; left: {(item.width*20/2)}px;" class = "sizeButton" id = "up"/>
                    <input type="button" on:mousedown={() => changeSize(item, "upright")} style= "top: {- 5}px; left: {- 8 + item.width*20}px;" class = "sizeButton" id = "upright"/>
                    <input type="button" on:mousedown={() => changeSize(item, "left")} style= "top: {item.height*10-8}px; left: {- 5}px;" class = "sizeButton" id = "left"/>  
                    <input type="button" on:mousedown={() => changeSize(item, "right")} style= "top: { item.height*10-8}px; left: { -8 + item.width*20}px;" class = "sizeButton" id = "right"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downleft")} style= "top: {+ item.height*20 -8}px; left: {- 5}px;" class = "sizeButton" id = "downleft"/>
                    <input type="button" on:mousedown={() => changeSize(item, "down")} style= "top: {+ item.height*20 - 8}px; left: {+ item.width*10}px;" class = "sizeButton" id = "down"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downright")} style= "top: {+ item.height*20 -8}px; left: {-8 + item.width*20}px;" class = "sizeButton"id ="downright"/>
                </div>
            </div>
            {/each}
        </section>
    </article>
    <article class = "settings">
        <h1>Settings</h1>
        <h2>Themes</h2>
        <form>
            <input type="radio" id="sahara" name="theme" value="sahara" on:change={() => updateTheme("sahara")}>
            <label for="sahara">Sahara</label><br>
            <input type="radio" id="crimson" name="theme" value="crimson" on:change={() => updateTheme("crimson")}>
            <label for="crimson">Crimson</label><br>
            <input type="radio" id="rocket" name="theme" value="rocket" on:change={() => updateTheme("light")}>
            <label for="rocket">rocket</label><br>
        </form>
        <h2 class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>Font Size</h2>
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <div style="display: flex; flex-direction: row; width: 100%; height: 100%;">
                <label for="changeFontManually">Manually Change Font Size:</label>
                <input type="checkbox" id="changeFontManually" bind:checked={selectedItem.changeFontManually}>
            </div>
            <div>
            <input type="button" value="+" on:click={() => {
                if(parseFloat(selectedItem.fontSize) < 400){
                selectedItem.changeFontManually = true;
                manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)+1)}}}/>
            <input type="text" style="width: 80px;" value={parseFloat(selectedItem.fontSize)} on:input={(e) => {
                if(parseFloat(e.target.value)>= 2) {
                    selectedItem.changeFontManually = true;
                    console.log(parseFloat(e.target.value));
                    manuallyChangeFontSize(selectedItem, parseFloat(e.target.value))}}}/>
            <input type="button" value="-" on:click={() => {
                if(parseFloat(selectedItem.fontSize) > 2){
                selectedItem.changeFontManually = true;
                manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)-1)}}}/>
            </div>
        </div>
        
    </article>
</main>

<aside class="selectedItem" class:invisible = {selectedItem.name == "none" || mousedown == false || selectType != "itemPlace"} style="top: {mousePos.y + scrollY - placementOffset.y}px; left: {mousePos.x - placementOffset.x}px; height: {selectedItem.height *20}px; width: {selectedItem.width*20}px;" >
    <h2>{selectedItem.name}</h2>
</aside>

<style>
    main {
        display: grid;
        height: 100%;
        width: 100%;
        grid-template-columns: 100px 5fr 100px;
    }
    .websiteGrid {
        display: grid;
        grid-template-columns: repeat(60, 20px);
        grid-template-rows: repeat(80, 20px);
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .tools {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: lightblue;
        height: 100%;
        width: 100%;
        color: black;
    }
    .settings {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: lightblue;
        height: 100%;
        width: 100%;
        color: black;
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
        display: inline-block;
        box-sizing: border-box;
        background-color: transparent;
        position: absolute;
        resize: none;
        font-size: inherit;
        text-overflow: ellipsis;
        line-height: 1.2;
        overflow: hidden;
        overflow-wrap: anywhere;
    }
    .item {
    position: absolute;
    background-color: transparent;
    }
    .higherZ{
        z-index: 2;
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
    #upleft{
        cursor: nw-resize;
    }
    #up{
        cursor: n-resize;
    }
    #upright{
        cursor: ne-resize;
    }
    #left{
        cursor: w-resize;
    }
    #right{
        cursor: e-resize;
    }
    #downleft{
        cursor: sw-resize;
    }
    #down{
        cursor: s-resize;
    }
    #downright{
        cursor: se-resize;
    }
</style>