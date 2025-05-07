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
let currentlySelectedImage = File;
let selectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: ""};
let resetSelectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: ""};
let items = [{name: "header 1", height: 5, width: 20, type: "text", id: 0, fontSize: "95px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: ""}, 
    {name: "header 2", height: 4, width: 16, type: "text", id: 0, fontSize: "75px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""},
    {name: "header 3", height: 2, width: 8, type: "text", id: 0, fontSize: "45px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""}, 
    {name: "text 1", height: 20, width: 40, type: "text", id: 0, fontSize: "45px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""},
    {name: "text 2", height: 10, width: 20, type: "text", id: 0, fontSize: "35px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""},
    {name: "text 3", height: 10, width: 10, type: "text", id: 0, fontSize: "25px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""},
    {name: "image", height: 30, width: 30, type: "image", id: 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:""}];
let itemsInGrid = [];
let scrollY = 0;
let mousedown = false;
let dragDirection = "none"; 
let gridElement;
let selectType = "none";

function getSelectedItem(item){
    let selected = items.find(i => i.name == item);
    selectedItem = {name: selected.name, height: selected.height, width: selected.width, 
        start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: selected.type, id: selected.id, 
        fontSize: selected.fontSize, changeFontManually: selected.changeFontManually, 
        font: selected.font, color: selected.color, backgroundColor: selected.backgroundColor, src: selected.src};
    selectType = "itemPlace";
}
function placeItem(item){
    selectedItem = calPos(item);
    if(selectedItem != null && selectedItem.name != "none"){
        placementOffset = {x: 0, y: 0}; 
        itemsInGrid = [...itemsInGrid, selectedItem];
        if (selectedItem.type == "image"){
            addImage(selectedItem);
        }
        selectedItem =  resetSelectedItem;   
    }
    else{
        selectedItem =  resetSelectedItem;
    }
}
function calPos(Item){
    let start = {x: mouseGridPos.x - Math.floor(placementOffset.x /20), y: mouseGridPos.y - Math.floor((placementOffset.y) /20) };
    let end = {x: start.x + Item.width, y: start.y + Item.height};
    if (end.x < gridSize.x && end.y < gridSize.y){ 
        let newId = Item.id;
        if(Item.id === 0){
            lastUsedId = lastUsedId + 1;
            newId = lastUsedId;
        }
        return {name: Item.name, height: Item.height, width: Item.width, start: start, end: end, 
            type: Item.type, id: newId, fontSize: Item.fontSize, changeFontManually: Item.changeFontManually, 
            font: Item.font, color: Item.color, backgroundColor: Item.backgroundColor, src: Item.src};
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
    cellId.y = Math.floor((mousePos.y + scrollY - gridStart.y) / 20);
    mouseGridPos = cellId;
    if (selectedItem.name != "none" && mousedown == true){//resizing the item
        if (selectType == "itemSize" || selectType == "cropImage"){
            let newStart = selectedItem.start;
            let newEnd = selectedItem.end;
            let newWidth = selectedItem.width;
            let newHeight = selectedItem.height;
            if (dragDirection == "upleft") {//copilot helped with bugfixing this 
                if (cellId.x < selectedItem.end.x && cellId.y < selectedItem.end.y) {
                newStart = cellId;
                newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
                newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
                }} 
            else if (dragDirection == "up") {
                if (cellId.y < selectedItem.end.y) {
                newStart = { x: selectedItem.start.x, y: cellId.y };
                newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);}} 
            else if (dragDirection == "upright") {
                if (cellId.x > selectedItem.start.x && cellId.y < selectedItem.end.y) {
                newStart = { x: selectedItem.start.x, y: cellId.y };
                newEnd = { x: cellId.x, y: selectedItem.end.y };
                newHeight = selectedItem.height + (selectedItem.start.y - cellId.y);
                newWidth = cellId.x - selectedItem.start.x ;}} 
            else if (dragDirection == "left") {
                if (cellId.x < selectedItem.end.x) {
                newStart = { x: cellId.x, y: selectedItem.start.y };
                newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);}} 
            else if (dragDirection == "right") {
                if (cellId.x > selectedItem.start.x) {
                newEnd = { x: cellId.x, y: selectedItem.end.y };
                newWidth = cellId.x - selectedItem.start.x ;}} 
            else if (dragDirection == "downleft") {
                if (cellId.x < selectedItem.end.x && cellId.y > selectedItem.start.y) {
                newStart = { x: cellId.x, y: selectedItem.start.y };
                newEnd = { x: selectedItem.end.x, y: cellId.y };
                newWidth = selectedItem.width + (selectedItem.start.x - cellId.x);
                newHeight = cellId.y - selectedItem.start.y ;}} 
            else if (dragDirection == "down") {
                if (cellId.y > selectedItem.start.y) {
                newEnd = { x: selectedItem.end.x, y: cellId.y };
                newHeight = cellId.y - selectedItem.start.y ;}} 
            else if (dragDirection == "downright") {
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
                if(selectedItem.changeFontManually == false && selectedItem.type == "text"){
                    selectedItem.fontSize = adjustFontSize(selectedItem.id, selectedItem.name);
                } // Update the font size when the contaiener size changes
                itemsInGrid[index] = {name : selectedItem.name , height: newHeight, width: newWidth, start: newStart, end: newEnd, type: selectedItem.type, 
                    id: selectedItem.id, fontSize: selectedItem.fontSize, changeFontManually: selectedItem.changeFontManually, font: selectedItem.font, 
                    color: selectedItem.color, backgroundColor: selectedItem.backgroundColor, src: selectedItem.src};
                if (selectedItem.type == "image"){
                    updateImageSize(selectedItem, newWidth, newHeight);
                    if (selectType == "cropImage" ){
                        cropImage(selectedItem, selectedItem.start.x * 20 + gridStart.x, selectedItem.start.y * 20 + gridStart.y, newWidth * 20, newHeight * 20);
                }
                }

                selectedItem = itemsInGrid[index]
            }}}}}

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
        input.focus();
    }, 0);}

function changeSize(item, Direction){
    selectedItem = item;
    selectType = "itemSize";
    dragDirection = Direction;
}
function startCropImage(item, Direction){
    selectedItem = item;
    selectType = "cropImage";
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
function updateFont(item, font) { 
    let index = itemsInGrid.findIndex(i => i.id === item.id);
    itemsInGrid[index].font = font;
    selectedItem = itemsInGrid[index];
}
function updateColor(item, color) { 
    let index = itemsInGrid.findIndex(i => i.id === item.id);
    itemsInGrid[index].color = color;
    selectedItem = itemsInGrid[index];
}

function updateBackgroundColor(item, backgroundColor) { 
    let index = itemsInGrid.findIndex(i => i.id === item.id);
    itemsInGrid[index].backgroundColor = backgroundColor;
    selectedItem = itemsInGrid[index];
}

function addImage(selected){
    setTimeout(() =>{
    var canvas = document.getElementById(-selected.id); 
    var context = canvas.getContext('2d');
    let fr = new FileReader(); // https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
    fr.onload = function () {
        let img = document.getElementById(String(selected.id))
        let index = itemsInGrid.findIndex(i => i.id === selected.id);

        if (selected.src != ""){
            img.src = selected.src;
        }
        else{
            img.src = fr.result;
            itemsInGrid[index].src = fr.result;
        }

        setTimeout(() => {
        itemsInGrid[index].width = Math.floor(img.width / 20);
        itemsInGrid[index].height = Math.floor(img.height / 20);
        img.width = String(itemsInGrid[index].width * 20) + "px";
        img.height = String(itemsInGrid[index].height * 20) + "px";
        selectedItem = itemsInGrid[index];
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, (item.start.x*20 + gridStart.x),  (item.start.y*20 + gridStart.y), img.width, img.height);
        }, 0);

        }
    fr.readAsDataURL(currentlySelectedImage);
    }, 0);
}

function updateImageSize(item, width, height) { 
    let img = document.getElementById(String(item.id))
    img.width = String(width * 20) + "px";
    img.height = String(height * 20) + "px";
}

function cropImage(item, cropX, cropY, cropWidth, cropHeight) { 
    var canvas = document.getElementById(-item.id); //https://stackoverflow.com/questions/65236904/how-can-i-crop-an-area-of-an-image-using-javascript
    var context = canvas.getContext('2d');

    var imageObj = new Image();
    imageObj.src = item.src;
    imageObj.onload = function() {

    //resize our canvas to match the size of the cropped area
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing the cropped image
    //fill canvas with cropped image
        context.drawImage(imageObj, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    };
    imageObj.src = item.src;
    }   
 

//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
onMount(() => {

    let animationFrame; //copilot suggested this to stop freezeing

    function update() {
    if (mousedown && (selectType == "itemSize" || selectType == "cropImage")) {
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
            if (selectType == "itemSize" || selectType == "cropImage"){
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
            <input type="button" value="Text 1" on:mousedown={() => getSelectedItem("text 1")}/>    
            <input type="button" value="Text 2" on:mousedown={() => getSelectedItem("text 2")}/>   
            <input type="button" value="Text 3" on:mousedown={() => getSelectedItem("text 3")}/>   
        </section>
        <section>
            <h2>Image</h2>
            <form action=""> <!--https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file-->
                <input type="file" accept="image/*" on:change={e => {currentlySelectedImage = e.target.files[0];}}/>
                <input type="button" value="Drag from here" on:mousedown={() => getSelectedItem("image")}/> 
                <input type="checkbox" id="imageCrop" on:change={e => {if(e.target.checked == true){
                    selectType = "cropImage";
                }
                else{
                    selectType = "itemSelect";
                }}}/>
            </form>
        </section>
    </article>
    <article style="height: 100%; width: 100%;">
        <section class = "websiteGrid" bind:this={gridElement}>
            {#each gridArr as cell}
            <div class = "cell" role = "region" tabindex="-1">
                <input type="button" on:mousedown={() =>{deSelect();}} style="height: 100%; width: 100%;"/>
            </div>
            {/each}
        </section>
        <section style="height: 100%; width: 100%;">
            {#each itemsInGrid as item}
            <div class = "item" class:selected = {item == selectedItem} style="width:{item.width *20}px; height:{item.height*20}px; top: {(item.start.y*20) + gridStart.y}px; left: {(item.start.x *20) + gridStart.x}px; background-color: {item.backgroundColor};">
                <input type="button" on:mousedown={() => rePlaceItem(item)} style= "top: {-5}px; left: {- 5}px; width:{item.width *20+5}px; height:{item.height*20+5}px;" class = "border" class:invisible = {item != selectedItem}/>
                {#if item.type == "text"}
                <textarea value={item.name} style="font-size: {item.fontSize}; font-family: {item.font};  color:{item.color};" on:input={(e) => {
                    item.name = e.target.value;
                    if(item.changeFontManually == false){
                    item.fontSize = adjustFontSize(item.id, item.name);} // Update the font size when the text changes
                    selectedItem = item;
                    }} 
                    class = "textInput" id = {String(item.id)} class:higherZ = {document.activeElement == document.getElementById(String(item.id))}/>
                <div style="height: 100%; width: 100%; color: transparent; background-color: transparent; font-family: {item.font}" class = "textInput" id = {String(-item.id)}> {item.name} </div>  <!--a div that changes font size with help of text fit and then applies that font size to the text area because of lack of support of text area-->  
                <input type="button" on:mousedown={() => selectPlacedItem(item)} style="height: 100%; width: 100%; position: absolute;" on:dblclick={() => changeText(item)}/>  
                {/if}
                {#if item.type == "image"}
                <canvas id = {String(-item.id)} style="position: absolute;"></canvas>
                <img id = {String(item.id)} style = "position: absolute; opacity: 0" alt = "image added by user"/>
                <input type="button" on:click={() => selectPlacedItem(item)} style="height: {item.height*20}px; width: {item.width*20}px; position: absolute;"/>  
                {/if}
                
                <div class:invisible = {item != selectedItem || selectType == "cropImage"} style="height: 100%; width: 100%;">
                    <input type="button" on:mousedown={() => changeSize(item, "upleft")} style= "top: {- 5}px; left: {- 5}px;" class = "sizeButton" id = "upleft"/>
                    <input type="button" on:mousedown={() => changeSize(item, "up")} style= "top: {- 5}px; left: {(item.width*20/2)}px;" class = "sizeButton" id = "up"/>
                    <input type="button" on:mousedown={() => changeSize(item, "upright")} style= "top: {- 5}px; left: {- 8 + item.width*20}px;" class = "sizeButton" id = "upright"/>
                    <input type="button" on:mousedown={() => changeSize(item, "left")} style= "top: {item.height*10-8}px; left: {- 5}px;" class = "sizeButton" id = "left"/>  
                    <input type="button" on:mousedown={() => changeSize(item, "right")} style= "top: { item.height*10-8}px; left: { -8 + item.width*20}px;" class = "sizeButton" id = "right"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downleft")} style= "top: {+ item.height*20 -8}px; left: {- 5}px;" class = "sizeButton" id = "downleft"/>
                    <input type="button" on:mousedown={() => changeSize(item, "down")} style= "top: {+ item.height*20 - 8}px; left: {+ item.width*10}px;" class = "sizeButton" id = "down"/>
                    <input type="button" on:mousedown={() => changeSize(item, "downright")} style= "top: {+ item.height*20 -8}px; left: {-8 + item.width*20}px;" class = "sizeButton"id ="downright"/>
                </div>
                <div class:invisible = {item != selectedItem || selectType != "cropImage"} style="height: 100%; width: 100%;">
                    <input type="button" on:mousedown={() => startCropImage(item, "upleft")} style= "top: {- 5}px; left: {- 5}px; background-color: black;" class = "sizeButton" id = "upleft"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "up")} style= "top: {- 5}px; left: {(item.width*20/2)}px; background-color: black;" class = "sizeButton" id = "up"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "upright")} style= "top: {- 5}px; left: {- 8 + item.width*20}px; background-color: black;" class = "sizeButton" id = "upright"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "left")} style= "top: {item.height*10-8}px; left: {- 5}px; background-color: black;" class = "sizeButton" id = "left"/>  
                    <input type="button" on:mousedown={() => startCropImage(item, "right")} style= "top: { item.height*10-8}px; left: { -8 + item.width*20}px; background-color: black;" class = "sizeButton" id = "right"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "downleft")} style= "top: {+ item.height*20 -8}px; left: {- 5}px; background-color: black;" class = "sizeButton" id = "downleft"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "down")} style= "top: {+ item.height*20 - 8}px; left: {+ item.width*10}px; background-color: black;" class = "sizeButton" id = "down"/>
                    <input type="button" on:mousedown={() => startCropImage(item, "downright")} style= "top: {+ item.height*20 -8}px; left: {-8 + item.width*20}px; background-color: black;" class = "sizeButton"id ="downright"/>
                </div>
            </div>
            {/each}
        </section>
    </article>
    <article class = "settings">
        <canvas width="400" height="300" id="canvas"/>
        <h1>Settings</h1>
        <h2>Themes</h2>
        
        <select name="theme" id="theme" bind:value={$currentTheme} on:change={e => {updateTheme(e.target.value);}}>
            <option value="crimson" style="background-color: black; color: white;">Crimson</option>
            <option value="skeleton" style="background-color: rgb(68, 6, 118);; color: white;">Skeleton</option> 
            <option value="sahara" style="background-color: rgb(139, 1, 1); color: white;">Sahara</option>
            <option value="vintage" style="background-color: rgb(90, 20, 20); color: white;">Vintage</option>
            <option value="wintry" style="background-color: darkblue; color: white;">Wintry</option>
            <option value="seafoam" style="background-color: lightblue; color: white;">Seafoam</option>
            <option value="gold-nouveau" style="background-color: darkred; color: white;">Gold Nouveau</option>
            <option value="hamlindigo" style="background-color: gray; color: white;">Hamlindigo</option>
            <option value="rocket" style="background-color: gray; color: lightblue;">Rocket</option>
        </select>
        <h2 class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>Font Size</h2>
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <div style="display: flex; flex-direction: row; width: 100%; height: 100%;">
                <label for="changeFontManually">Manually Change Font Size:</label>
                <input type="checkbox" id="changeFontManually" bind:checked={selectedItem.changeFontManually}>
            </div>
        </div>
            <div>
            <input type="button" value="+" on:click={() => {
                if(parseFloat(selectedItem.fontSize) < 400){
                selectedItem.changeFontManually = true;
                manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)+1)}}}/>
            <input type="text" style="width: 80px;" value={parseFloat(selectedItem.fontSize)} on:input={(e) => {
                if(parseFloat(e.target.value)>= 2) {
                    selectedItem.changeFontManually = true;
                    manuallyChangeFontSize(selectedItem, parseFloat(e.target.value))}}}/>
            <input type="button" value="-" on:click={() => {
                if(parseFloat(selectedItem.fontSize) > 2){
                selectedItem.changeFontManually = true;
                manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)-1)}}}/>
            </div>
        
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <label for="font">Font</label>
            <select name="font" id="font" size="1" bind:value={selectedItem.font} on:change={e => {updateFont(selectedItem, e.target.value);}}>
                <option value="Arial" style="font-family: Arial, Helvetica, sans-serif;">Arial</option> <!--copilot suggested these fonts-->
                <option value="Arial Black" style="font-family: 'Arial Black', Gadget, sans-serif;">Arial Black</option>
                <option value="Arial Narrow" style="font-family: 'Arial Narrow', Arial, sans-serif;">Arial Narrow</option>
                <option value="Bookman" style="font-family: 'Bookman', serif;">Bookman</option>
                <option value="Comic Sans MS" style="font-family: 'Comic Sans MS', cursive, sans-serif;">Comic Sans MS</option>
                <option value="Courier New" style="font-family: 'Courier New', Courier, monospace;">Courier New</option>
                <option value="Droid Sans" style="font-family: 'Droid Sans', sans-serif;">Droid Sans</option>
                <option value="Garamond" style="font-family: Garamond, serif;">Garamond</option>
                <option value="Georgia" style="font-family: Georgia, serif;">Georgia</option>
                <option value="Impact" style="font-family: Impact, Charcoal, sans-serif;">Impact</option>
                <option value="Lato" style="font-family: 'Lato', sans-serif;">Lato</option>
                <option value="Lucida Console" style="font-family: 'Lucida Console', Monaco, monospace;">Lucida Console</option>
                <option value="Lucida Sans Unicode" style="font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;">Lucida Sans Unicode</option>
                <option value="Merriweather" style="font-family: 'Merriweather', serif;">Merriweather</option>
                <option value="Montserrat" style="font-family: 'Montserrat', sans-serif;">Montserrat</option>
                <option value="MS Sans Serif" style="font-family: 'MS Sans Serif', Geneva, sans-serif;">MS Sans Serif</option>
                <option value="MS Serif" style="font-family: 'MS Serif', 'New York', serif;">MS Serif</option>
                <option value="Noto Sans" style="font-family: 'Noto Sans', sans-serif;">Noto Sans</option>
                <option value="Noto Serif" style="font-family: 'Noto Serif', serif;">Noto Serif</option>
                <option value="Open Sans" style="font-family: 'Open Sans', sans-serif;">Open Sans</option>
                <option value="Oswald" style="font-family: 'Oswald', sans-serif;">Oswald</option>
                <option value="Palatino Linotype" style="font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;">Palatino Linotype</option>
                <option value="Playfair Display" style="font-family: 'Playfair Display', serif;">Playfair Display</option>
                <option value="Poppins" style="font-family: 'Poppins', sans-serif;">Poppins</option>
                <option value="Raleway" style="font-family: 'Raleway', sans-serif;">Raleway</option>
                <option value="Roboto" style="font-family: 'Roboto', sans-serif;">Roboto</option>
                <option value="Segoe UI" style="font-family: 'Segoe UI', Tahoma, Geneva, sans-serif;">Segoe UI</option>
                <option value="Segoe UI Emoji" style="font-family: 'Segoe UI Emoji', sans-serif;">Segoe UI Emoji</option>
                <option value="Segoe UI Historic" style="font-family: 'Segoe UI Historic', sans-serif;">Segoe UI Historic</option>
                <option value="Source Sans Pro" style="font-family: 'Source Sans Pro', sans-serif;">Source Sans Pro</option>
                <option value="Symbol" style="font-family: Symbol;">Symbol</option>
                <option value="Tahoma" style="font-family: Tahoma, Geneva, sans-serif;">Tahoma</option>
                <option value="Times New Roman" style="font-family: 'Times New Roman', Times, serif;">Times New Roman</option>
                <option value="Trebuchet MS" style="font-family: 'Trebuchet MS', Helvetica, sans-serif;">Trebuchet MS</option>
                <option value="Ubuntu" style="font-family: 'Ubuntu', sans-serif;">Ubuntu</option>
                <option value="Verdana" style="font-family: Verdana, Geneva, sans-serif;">Verdana</option>
                <option value="Webdings" style="font-family: Webdings;">Webdings</option>
                <option value="Wingdings" style="font-family: Wingdings;">Wingdings</option>
                <option value="Helvetica" style="font-family: Helvetica, Arial, sans-serif;">Helvetica</option>
                <option value="Futura" style="font-family: Futura, 'Trebuchet MS', Arial, sans-serif;">Futura</option>
            </select>
        </div>
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <h2>Text Color</h2>
            <input type="button" value="Theme Default" on:click={() => {updateColor(selectedItem, currentTheme.color)}}/>
            <select name="color" id="color" size="1" bind:value={selectedItem.color} on:change={e => {updateColor(selectedItem, e.target.value);}}>
                <option value="#000000" style="background-color: #000000; color: #FFFFFF;">Black</option>
                <option value="#333333" style="background-color: #333333; color: #FFFFFF;">Dark Gray</option>
                <option value="#666666" style="background-color: #666666; color: #FFFFFF;">Gray</option>
                <option value="#999999" style="background-color: #999999; color: #000000;">Light Gray</option>
                <option value="#FFFFFF" style="background-color: #FFFFFF; color: #000000;">White</option>
                
                <option value="#FF0000" style="background-color: #FF0000; color: #FFFFFF;">Red</option>
                <option value="#CC0000" style="background-color: #CC0000; color: #FFFFFF;">Dark Red</option>
                <option value="#FF6666" style="background-color: #FF6666; color: #000000;">Light Red</option>
                
                <option value="#00FF00" style="background-color: #00FF00; color: #000000;">Green</option>
                <option value="#009900" style="background-color: #009900; color: #FFFFFF;">Dark Green</option>
                <option value="#66FF66" style="background-color: #66FF66; color: #000000;">Light Green</option>
                
                <option value="#0000FF" style="background-color: #0000FF; color: #FFFFFF;">Blue</option>
                <option value="#000099" style="background-color: #000099; color: #FFFFFF;">Dark Blue</option>
                <option value="#6666FF" style="background-color: #6666FF; color: #000000;">Light Blue</option>
                
                <option value="#FFFF00" style="background-color: #FFFF00; color: #000000;">Yellow</option>
                <option value="#CCCC00" style="background-color: #CCCC00; color: #000000;">Dark Yellow</option>
                <option value="#FFFF66" style="background-color: #FFFF66; color: #000000;">Light Yellow</option>
                
                <option value="#FF00FF" style="background-color: #FF00FF; color: #FFFFFF;">Magenta</option>
                <option value="#CC00CC" style="background-color: #CC00CC; color: #FFFFFF;">Dark Magenta</option>
                <option value="#FF66FF" style="background-color: #FF66FF; color: #000000;">Light Magenta</option>
                
                <option value="#00FFFF" style="background-color: #00FFFF; color: #000000;">Cyan</option>
                <option value="#009999" style="background-color: #009999; color: #FFFFFF;">Dark Cyan</option>
                <option value="#66FFFF" style="background-color: #66FFFF; color: #000000;">Light Cyan</option>
                
                <option value="#FFA500" style="background-color: #FFA500; color: #000000;">Orange</option>
                <option value="#CC8400" style="background-color: #CC8400; color: #FFFFFF;">Dark Orange</option>
                <option value="#FFB84D" style="background-color: #FFB84D; color: #000000;">Light Orange</option>
                
                <option value="#800080" style="background-color: #800080; color: #FFFFFF;">Purple</option>
                <option value="#4B0082" style="background-color: #4B0082; color: #FFFFFF;">Indigo</option>
                <option value="#D8BFD8" style="background-color: #D8BFD8; color: #000000;">Thistle</option>
                
                <option value="#A52A2A" style="background-color: #A52A2A; color: #FFFFFF;">Brown</option>
                <option value="#8B4513" style="background-color: #8B4513; color: #FFFFFF;">Saddle Brown</option>
                <option value="#DEB887" style="background-color: #DEB887; color: #000000;">Burlywood</option>
            </select>
            <input type="color" id="customColor" bind:value={selectedItem.color} on:input={(e) => {updateColor(selectedItem, e.target.value);}}/>
        </div>
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <h2>Background Color</h2>
            <input type="button" value="Transparent" on:click={() => {updateBackgroundColor(selectedItem, "transparent")}}/>
            <select name="color" id="color" size="1" bind:value={selectedItem.backgroundColor} on:change={e => {updateBackgroundColor(selectedItem, e.target.value);}}>
                <option value="#000000" style="background-color: #000000; color: #FFFFFF;">Black</option>
                <option value="#333333" style="background-color: #333333; color: #FFFFFF;">Dark Gray</option>
                <option value="#666666" style="background-color: #666666; color: #FFFFFF;">Gray</option>
                <option value="#999999" style="background-color: #999999; color: #000000;">Light Gray</option>
                <option value="#FFFFFF" style="background-color: #FFFFFF; color: #000000;">White</option>
                
                <option value="#FF0000" style="background-color: #FF0000; color: #FFFFFF;">Red</option>
                <option value="#CC0000" style="background-color: #CC0000; color: #FFFFFF;">Dark Red</option>
                <option value="#FF6666" style="background-color: #FF6666; color: #000000;">Light Red</option>
                
                <option value="#00FF00" style="background-color: #00FF00; color: #000000;">Green</option>
                <option value="#009900" style="background-color: #009900; color: #FFFFFF;">Dark Green</option>
                <option value="#66FF66" style="background-color: #66FF66; color: #000000;">Light Green</option>
                
                <option value="#0000FF" style="background-color: #0000FF; color: #FFFFFF;">Blue</option>
                <option value="#000099" style="background-color: #000099; color: #FFFFFF;">Dark Blue</option>
                <option value="#6666FF" style="background-color: #6666FF; color: #000000;">Light Blue</option>
                
                <option value="#FFFF00" style="background-color: #FFFF00; color: #000000;">Yellow</option>
                <option value="#CCCC00" style="background-color: #CCCC00; color: #000000;">Dark Yellow</option>
                <option value="#FFFF66" style="background-color: #FFFF66; color: #000000;">Light Yellow</option>
                
                <option value="#FF00FF" style="background-color: #FF00FF; color: #FFFFFF;">Magenta</option>
                <option value="#CC00CC" style="background-color: #CC00CC; color: #FFFFFF;">Dark Magenta</option>
                <option value="#FF66FF" style="background-color: #FF66FF; color: #000000;">Light Magenta</option>
                
                <option value="#00FFFF" style="background-color: #00FFFF; color: #000000;">Cyan</option>
                <option value="#009999" style="background-color: #009999; color: #FFFFFF;">Dark Cyan</option>
                <option value="#66FFFF" style="background-color: #66FFFF; color: #000000;">Light Cyan</option>
                
                <option value="#FFA500" style="background-color: #FFA500; color: #000000;">Orange</option>
                <option value="#CC8400" style="background-color: #CC8400; color: #FFFFFF;">Dark Orange</option>
                <option value="#FFB84D" style="background-color: #FFB84D; color: #000000;">Light Orange</option>
                
                <option value="#800080" style="background-color: #800080; color: #FFFFFF;">Purple</option>
                <option value="#4B0082" style="background-color: #4B0082; color: #FFFFFF;">Indigo</option>
                <option value="#D8BFD8" style="background-color: #D8BFD8; color: #000000;">Thistle</option>
                
                <option value="#A52A2A" style="background-color: #A52A2A; color: #FFFFFF;">Brown</option>
                <option value="#8B4513" style="background-color: #8B4513; color: #FFFFFF;">Saddle Brown</option>
                <option value="#DEB887" style="background-color: #DEB887; color: #000000;">Burlywood</option>
            </select>
            <input type="color" id="customColor" bind:value={selectedItem.backgroundColor} on:input={(e) => {updateBackgroundColor(selectedItem, e.target.value);}}/>
        </div>
        <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
            <h2>Border</h2>
        </div>
        <div class:invisible = {selectedItem.type != "image" || selectType == "itemPlace"}>
            <h2>Image Settings</h2>
            <label for="imageCrop">Crop Image</label>

            
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
        font-family: 'Times New Roman', Times, serif;
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
        background-color: rgba(173, 216, 230, 0.258);
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