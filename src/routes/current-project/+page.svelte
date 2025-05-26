<script>
import { onMount } from 'svelte';
import {currentTheme} from '$lib/theme-storage'; //https://www.reddit.com/r/sveltejs/comments/15p6t4w/how_do_i_use_different_themes_with_skeleton_ui/
import textFit from 'textfit'; 
let gridSize = {x: 60, y: 80};
let cellSize = 20;
let gridArr = getNewGrid(gridSize.x, gridSize.y);
let mouseGridPos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};
let gridStart = {x: 0, y: 0};
let placementOffset = {x: 0, y: 0};
let lastUsedId = 1;
let currentlySelectedImage = File;
let currentlySelectedBackgroundImage = File;
let selectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: "", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}};
let resetSelectedItem = {name : "none", height: 0, width: 0, start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: "none", id : 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: "", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}};
let items = [{name: "header 1", height: 5, width: 20, type: "text", id: 0, fontSize: "95px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src: "", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}},
    {name: "header 2", height: 4, width: 16, type: "text", id: 0, fontSize: "75px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}},
    {name: "header 3", height: 2, width: 8, type: "text", id: 0, fontSize: "45px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}}, 
    {name: "text 1", height: 20, width: 40, type: "text", id: 0, fontSize: "45px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}},
    {name: "text 2", height: 10, width: 20, type: "text", id: 0, fontSize: "35px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}},
    {name: "text 3", height: 10, width: 10, type: "text", id: 0, fontSize: "25px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}},
    {name: "image", height: 30, width: 30, type: "image", id: 0, fontSize: "0px", changeFontManually: false, font: "Arial", color: "themeDefault", backgroundColor: "transparent", src:"", cropValues: {cropStart: {x: 0, y: 0}, cropEnd: {x: 0, y: 0 }, baseWidth: 0, baseHeight: 0}}];
let itemsInGrid = [];
let scrollY = 0;
let animationFrame;
let mousedown = false;
let dragDirection = "none"; 
let gridElement;
let selectType = "none";
let mainBackground = "transparent";
let mainBackgroundImage = "none";
let newTheme = "crimson"

function getSelectedItem(item){
    let selected = items.find(i => i.name == item);
    let fontSize = String(parseFloat(selected.fontSize)/20*cellSize)+"px";
    selectedItem = {name: selected.name, height: selected.height, width: selected.width, 
        start: {x: 0, y: 0}, end: {x: 0, y: 0}, type: selected.type, id: selected.id, 
        fontSize: fontSize, changeFontManually: selected.changeFontManually, 
        font: selected.font, color: selected.color, backgroundColor: selected.backgroundColor, src: selected.src, cropValues: JSON.parse(JSON.stringify(selected.cropValues))};
    selectType = "itemPlace";
}
function placeItem(item){
    selectedItem = calPos(item);
    if(selectedItem != null && selectedItem.name != "none"){
        placementOffset = {x: 0, y: 0}; 
        selectedItem.cropValues.baseWidth = selectedItem.width;
        selectedItem.cropValues.baseHeight = selectedItem.height;
        selectedItem.cropValues.cropStart = selectedItem.start;
        selectedItem.cropValues.cropStart = selectedItem.end;
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
    let start = {x: mouseGridPos.x - Math.floor(placementOffset.x /cellSize), y: mouseGridPos.y - Math.floor((placementOffset.y) /cellSize)};
    let end = {x: start.x + Item.width, y: start.y + Item.height};
    cancelAnimationFrame(animationFrame);
    if (end.x < gridSize.x && end.y < gridSize.y && start.x > 0 && start.y > 0){ 
        let newId = Item.id;
        if(Item.id === 0){
            lastUsedId = lastUsedId + 1;
            newId = lastUsedId;
        }
        return {name: Item.name, height: Item.height, width: Item.width, start: start, end: end, 
            type: Item.type, id: newId, fontSize: Item.fontSize, changeFontManually: Item.changeFontManually, 
            font: Item.font, color: Item.color, backgroundColor: Item.backgroundColor, src: Item.src, cropValues: JSON.parse(JSON.stringify(Item.cropValues))};
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
    cellId.x = Math.floor((mousePos.x - gridStart.x) / cellSize);
    cellId.y = Math.floor((mousePos.y + scrollY - gridStart.y) / cellSize);
    mouseGridPos = cellId;
    if (selectedItem.name != "none" && mousedown == true){//resizing the item
        if (selectType == "itemSize" || selectType == "cropImage"){
            let newStart = selectedItem.start;
            let newEnd = selectedItem.end;
            let newWidth = selectedItem.width;
            let newHeight = selectedItem.height;
            let baseStart = selectedItem.start;
            let baseEnd = selectedItem.end;
            let baseWidth = selectedItem.width;
            let baseHeight = selectedItem.height;
            if (selectType == "cropImage"){
                newStart = selectedItem.cropValues.cropStart;
                newEnd = selectedItem.cropValues.cropEnd;
                newWidth = selectedItem.cropValues.baseWidth;
                newHeight = selectedItem.cropValues.baseHeight;
                baseStart = selectedItem.cropValues.cropStart;
                baseEnd = selectedItem.cropValues.cropEnd;
                baseWidth = selectedItem.cropValues.baseWidth;
                baseHeight = selectedItem.cropValues.baseHeight;
            }

            if (dragDirection == "upleft") {//copilot helped with bugfixing this 
                if (cellId.x < baseEnd.x && cellId.y < baseEnd.y) {
                newStart = cellId;
                newHeight = baseHeight + (baseStart.y - cellId.y);
                newWidth = baseWidth + (baseStart.x - cellId.x);
                }} 
            else if (dragDirection == "up") {
                if (cellId.y < baseEnd.y) {
                newStart = { x: baseStart.x, y: cellId.y };
                newHeight = baseHeight + (baseStart.y - cellId.y);}} 
            else if (dragDirection == "upright") {
                if (cellId.x > baseStart.x && cellId.y < baseEnd.y) {
                newStart = { x: baseStart.x, y: cellId.y };
                newEnd = { x: cellId.x, y: baseEnd.y };
                newHeight = baseHeight + (baseStart.y - cellId.y);
                newWidth = cellId.x - baseStart.x ;}} 
            else if (dragDirection == "left") {
                if (cellId.x < baseEnd.x) {
                newStart = { x: cellId.x, y: baseStart.y };
                newWidth = baseWidth + (baseStart.x - cellId.x);}} 
            else if (dragDirection == "right") {
                if (cellId.x > baseStart.x) {
                newEnd = { x: cellId.x, y: baseEnd.y };
                newWidth = cellId.x - baseStart.x ;}} 
            else if (dragDirection == "downleft") {
                if (cellId.x < baseEnd.x && cellId.y > baseStart.y) {
                newStart = { x: cellId.x, y: baseStart.y };
                newEnd = { x: baseEnd.x, y: cellId.y };
                newWidth = baseWidth + (baseStart.x - cellId.x);
                newHeight = cellId.y - baseStart.y ;}} 
            else if (dragDirection == "down") {
                if (cellId.y > baseStart.y) {
                newEnd = { x: baseEnd.x, y: cellId.y };
                newHeight = cellId.y - baseStart.y ;}} 
            else if (dragDirection == "downright") {
                if (cellId.x > baseStart.x && cellId.y > baseStart.y) {
                newEnd = { x: cellId.x, y: cellId.y };
                newHeight = cellId.y - baseStart.y ;
                newWidth = cellId.x - baseStart.x ;}
            }
            if (
                newStart.x !== baseStart.x ||
                newStart.y !== baseStart.y ||
                newWidth !== baseWidth ||
                newHeight !== baseHeight
            ) {
            let index = itemsInGrid.findIndex(i => i.id === selectedItem.id);
            if (index !== -1) {
                if(selectedItem.changeFontManually == false && selectedItem.type == "text"){
                    selectedItem.fontSize = adjustFontSize(selectedItem.id, selectedItem.name);
                } // Update the font size when the contaiener size changes
                if(selectedItem.type == "image" && selectType == "cropImage"){
                    cropImage(selectedItem , newWidth, newHeight, newStart, newEnd);
                }
                else{
                itemsInGrid[index] = {name : selectedItem.name , height: newHeight, width: newWidth, start: newStart, end: newEnd, type: selectedItem.type, 
                    id: selectedItem.id, fontSize: selectedItem.fontSize, changeFontManually: selectedItem.changeFontManually, font: selectedItem.font, 
                    color: selectedItem.color, backgroundColor: selectedItem.backgroundColor, src: selectedItem.src, cropValues: JSON.parse(JSON.stringify(selectedItem.cropValues)) };
                }
                selectedItem = itemsInGrid[index]

                if (selectedItem.type == "image" && selectType != "cropImage"){
                    updateImageSize(selectedItem, selectedItem.width, selectedItem.height);
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
        cancelAnimationFrame(animationFrame);
        selectType = "itemPlace";
        placementOffset = { x: mousePos.x - item.start.x * cellSize - gridStart.x, y: mousePos.y + scrollY - item.start.y * cellSize - gridStart.y}; // offset for placement
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
    newTheme = theme
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
    let fr = new FileReader(); // https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
    fr.onload = function () {
        let img = document.getElementById(String(selected.id))
        let index = itemsInGrid.findIndex(i => i.id === selected.id);

        if (selected.src != ""){
            img.style.backgroundImage = selected.src;
        }
        else{
            img.style.backgroundImage = fr.result;
            itemsInGrid[index].src = fr.result;
        }
        }
        updateImageSize(selected, selected.width, selected.height);
    fr.readAsDataURL(currentlySelectedImage);
    }, 0);
}

function updateImageSize(item, width, height) { 
    setTimeout(() => {
        let img = document.getElementById(String(item.id))
        img.style.width = String(width * cellSize) + "px";
        img.style.height = String(height * cellSize) + "px";
    
        let index = itemsInGrid.findIndex(i => i.id === item.id);
        itemsInGrid[index].cropValues.baseWidth = width;
        itemsInGrid[index].cropValues.baseHeight = height;
        itemsInGrid[index].cropValues.cropStart = item.start;
        itemsInGrid[index].cropValues.cropEnd = item.end;

        itemsInGrid[index] = itemsInGrid[index];
    }, 0);
}

function cropImage(item, width, height, start, end){
    setTimeout(() => {
        let index = itemsInGrid.findIndex(i => i.id === item.id);
        let div = document.getElementById(String(-item.id))
        let img = document.getElementById(String(item.id))
        div.style.width = String(width * cellSize) + "px";
        div.style.height = String(height * cellSize) + "px";        
        div.style.top = String((-item.start.y + start.y)*cellSize) + "px";
        div.style.left = String((-item.start.x + start.x)*cellSize) + "px";
        img.style.top = String((item.start.y - start.y)*cellSize) + "px";
        img.style.left = String((item.start.x - start.x)*cellSize) + "px";
        itemsInGrid[index].cropValues.baseWidth = width;
        itemsInGrid[index].cropValues.baseHeight = height;
        itemsInGrid[index].cropValues.cropStart = start;
        itemsInGrid[index].cropValues.cropEnd = end;
    }, 0);
}

function deleteItem(item){
    let index = itemsInGrid.findIndex(i => i.id === item.id);
    if (index !== -1) {
        itemsInGrid.splice(index, 1); 
    }
    selectedItem = resetSelectedItem;
    selectType = "none";
    console.log(itemsInGrid);
}

function changeBackground(type, input){
    let main = document.getElementById("mainGrid");
    if(type == "color"){
        mainBackground = input;
        main.style.backgroundColor = mainBackground;
        main.style.backgroundImage = "none";
    }
    else if(type == "image"){
        setTimeout(() =>{
            let fr = new FileReader(); // https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
            fr.onload = function () {
            main.style.backgroundImage = "url(" + fr.result + ")";
            mainBackgroundImage = "url(" + fr.result + ")";
            }
        fr.readAsDataURL(currentlySelectedBackgroundImage);
        }, 0);
    }
    }
function copyToClipBoard(id){ // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
    var copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
}

function updateCellSize(){
    let windowWidth = window.innerWidth;
    let currentCellsize = cellSize;
    if(windowWidth < 500){
        cellSize = 6;
    }
    else if (windowWidth < 800){
        cellSize = 8;
    }
    else if (windowWidth < 1400){
        cellSize = 10;
    }
    else{
        cellSize = 20;
    }
    if(currentCellsize != cellSize){
        itemsInGrid = itemsInGrid
    }
}

//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
onMount(() => {

     //copilot suggested this to stop freezeing
    function update() {
    if (mousedown && (selectType == "itemSize" || selectType == "cropImage" || selectType == "itemPlace")) {
        updateMousePos(); 
        animationFrame = requestAnimationFrame(update); 
    } else {
        cancelAnimationFrame(animationFrame);
    }
}

        window.addEventListener("pointermove", (event) => {
            mousePos = { x: event.clientX, y: event.clientY };
        });

        window.addEventListener("pointerdown", (event) => {
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
        window.addEventListener("pointerup", (event) => {
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
        window.addEventListener("resize", (event) => {
            if (gridElement) {
            const rect = gridElement.getBoundingClientRect();
            gridStart = { x: rect.left, y: rect.top }; // Store the grid's top-left corner coordinates
            gridElement = gridElement
            }
            updateMousePos();
            updateCellSize();
        });

        window.addEventListener("touchmove", (event) => {
            mousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        });
        window.addEventListener("touchend", (event) => {
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
            gridElement = gridElement
        }
        updateCellSize();
    });

</script>
<svelte:window bind:scrollY={scrollY} />

<main id = "mainGrid" style="background-size: cover; background-repeat: no-repeat;">
    <article class = "tools">
        <h1>Tools</h1>
        <section>
            <h2>Text</h2>
            <input type="button" value="Header 1" on:pointerdown={() => getSelectedItem("header 1")}/>    
            <input type="button" value="Header 2" on:pointerdown={() => getSelectedItem("header 2")}/>   
            <input type="button" value="Header 3" on:pointerdown={() => getSelectedItem("header 3")}/>   
            <input type="button" value="Text 1" on:pointerdown={() => getSelectedItem("text 1")}/>    
            <input type="button" value="Text 2" on:pointerdown={() => getSelectedItem("text 2")}/>   
            <input type="button" value="Text 3" on:pointerdown={() => getSelectedItem("text 3")}/>   
        </section>
        <section>
            <h2>Image</h2>
            <form action="" style="width: 90%;"> <!--https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file-->
                <input type="file" style="width: 100%;" accept="image/*" on:change={e => {currentlySelectedImage = e.target.files[0];}}/>
                <input type="button" value="Drag from here" on:pointerdown={() => getSelectedItem("image")}/> 
            </form>
        </section>
    </article>
    <article style="background-size: cover; background-repeat: no-repeat;" class = "grid" >
        <section style="background-color: #1b0f1e; padding: 4px; " class = "settingBackground">
            <div class = "settings">
            <select name="theme" id="theme" style="width: 75px; height: 25px; background-color: #1b0f1e;" bind:value={$currentTheme} on:change={e => {updateTheme(e.target.value);}}>
                <option value="crimson" style="background-color: black; color: white;">Crimson</option>
                <option value="skeleton" style="background-color: rgb(68, 6, 118);; color: white;">Skeleton</option> 
                <option value="sahara" style="background-color: rgb(139, 1, 1); color: white;">Sahara</option>
                <option value="vintage" style="background-color: rgb(90, 20, 20); color: white;">Vintage</option>
                <option value="wintry" style="background-color: darkblue; color: white;">Wintry</option>
                <option value="seafoam" style="background-color: lightblue; color: white;">Seafoam</option>
                <option value="gold-nouveau" style="background-color: darkred; color: white;">Gold Nouveau</option>
                <option value="hamlindigo" style="background-color: gray; color: white;">Hamlindigo</option>
                <option value="rocket" style="background-color: gray; color: lightblue;">Rocket</option>
                <option value="light" style="background-color: white; color: black;">Light</option>
            </select>
            <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
                <div style="display: flex; flex-direction: row; width: 100%; height: 25px;">
                    <label for="changeFontManually">Manually Change Font Size:</label>
                    <input type="checkbox" id="changeFontManually" bind:checked={selectedItem.changeFontManually}>
                </div>
            </div>
                <div style="display: flex; flex-direction: row; width: 60px; height: 100%;" class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>

                <input type="button" value="+" class = "button" on:click={() => {
                    if(parseFloat(selectedItem.fontSize) < 400){
                    selectedItem.changeFontManually = true;
                    manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)+1)}}}/>
                <input type="text" class = "button" style="width: 30px; text-align:center;" value={parseFloat(selectedItem.fontSize)} on:input={(e) => {
                    if(parseFloat(e.target.value)>= 2) {
                        selectedItem.changeFontManually = true;
                        manuallyChangeFontSize(selectedItem, parseFloat(e.target.value))}}}/>
                <input type="button" class = "button" value="-" on:click={() => {
                    if(parseFloat(selectedItem.fontSize) > 2){
                    selectedItem.changeFontManually = true;
                    manuallyChangeFontSize(selectedItem, parseFloat(selectedItem.fontSize)-1)}}}/>
                </div>
            
            <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
                <select name="font" id="font" size="1" class = "button" bind:value={selectedItem.font}  style="height: 25px; width:60px; background-color:#1b0f1e;" on:change={e => {updateFont(selectedItem, e.target.value);}}>
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
                <input type="image" src="font_color_icon_207076.webp.png" class = "button" class:selectedButton = {selectType == "changeFontColor"} alt= "Change font color" style="width: 20px; height 30px" on:click={() => {if(selectType != "changeFontColor"){
                    selectType = "changeFontColor";
                }
                else{
                    selectType = "itemSelect";
                }}}/>
                <aside class = "colorPicker" class:invisible = {selectType != "changeFontColor"}>
                <input type="button" value="Theme Default" on:click={() => {updateColor(selectedItem, currentTheme.color)}}/>
                <div class="colorGrid">
                    <button style="background-color: #000000;" on:click={() => updateColor(selectedItem, '#000000')}></button><!--copilot made all these buttons-->
                    <button style="background-color: #333333;" on:click={() => updateColor(selectedItem, '#333333')}></button>
                    <button style="background-color: #666666;" on:click={() => updateColor(selectedItem, '#666666')}></button>
                    <button style="background-color: #999999;" on:click={() => updateColor(selectedItem, '#999999')}></button>
                    <button style="background-color: #FFFFFF; border: 1px solid #000000;" on:click={() => updateColor(selectedItem, '#FFFFFF')}></button>
            
                    <button style="background-color: #FF0000;" on:click={() => updateColor(selectedItem, '#FF0000')}></button>
                    <button style="background-color: #CC0000;" on:click={() => updateColor(selectedItem, '#CC0000')}></button>
                    <button style="background-color: #FF6666;" on:click={() => updateColor(selectedItem, '#FF6666')}></button>
            
                    <button style="background-color: #00FF00;" on:click={() => updateColor(selectedItem, '#00FF00')}></button>
                    <button style="background-color: #009900;" on:click={() => updateColor(selectedItem, '#009900')}></button>
                    <button style="background-color: #66FF66;" on:click={() => updateColor(selectedItem, '#66FF66')}></button>
            
                    <button style="background-color: #0000FF;" on:click={() => updateColor(selectedItem, '#0000FF')}></button>
                    <button style="background-color: #000099;" on:click={() => updateColor(selectedItem, '#000099')}></button>
                    <button style="background-color: #6666FF;" on:click={() => updateColor(selectedItem, '#6666FF')}></button>
            
                    <button style="background-color: #FFFF00;" on:click={() => updateColor(selectedItem, '#FFFF00')}></button>
                    <button style="background-color: #CCCC00;" on:click={() => updateColor(selectedItem, '#CCCC00')}></button>
                    <button style="background-color: #FFFF66;" on:click={() => updateColor(selectedItem, '#FFFF66')}></button>
            
                    <button style="background-color: #FF00FF;" on:click={() => updateColor(selectedItem, '#FF00FF')}></button>
                    <button style="background-color: #CC00CC;" on:click={() => updateColor(selectedItem, '#CC00CC')}></button>
                    <button style="background-color: #FF66FF;" on:click={() => updateColor(selectedItem, '#FF66FF')}></button>
            
                    <button style="background-color: #00FFFF;" on:click={() => updateColor(selectedItem, '#00FFFF')}></button>
                    <button style="background-color: #009999;" on:click={() => updateColor(selectedItem, '#009999')}></button>
                    <button style="background-color: #66FFFF;" on:click={() => updateColor(selectedItem, '#66FFFF')}></button>
            
                    <button style="background-color: #FFA500;" on:click={() => updateColor(selectedItem, '#FFA500')}></button>
                    <button style="background-color: #CC8400;" on:click={() => updateColor(selectedItem, '#CC8400')}></button>
                    <button style="background-color: #FFB84D;" on:click={() => updateColor(selectedItem, '#FFB84D')}></button>
            
                    <button style="background-color: #800080;" on:click={() => updateColor(selectedItem, '#800080')}></button>
                    <button style="background-color: #4B0082;" on:click={() => updateColor(selectedItem, '#4B0082')}></button>
                    <button style="background-color: #D8BFD8;" on:click={() => updateColor(selectedItem, '#D8BFD8')}></button>
            
                    <button style="background-color: #A52A2A;" on:click={() => updateColor(selectedItem, '#A52A2A')}></button>
                    <button style="background-color: #8B4513;" on:click={() => updateColor(selectedItem, '#8B4513')}></button>
                    <button style="background-color: #DEB887;" on:click={() => updateColor(selectedItem, '#DEB887')}></button>
                </div>
                <div style="display: flex; flex-direction: row;">
                <label for="customColor">Custom Color:  </label>
                <input type="color" id="customColor" bind:value={selectedItem.color} on:input={(e) => {updateColor(selectedItem, e.target.value);}}/>
                </div>
            </aside>
            </div>
            <div class:invisible = {selectedItem.type != "text" || selectType == "itemPlace"}>
                <input type="image" src="background-color-icon-2048x1932-lso2v2wg.png" class = "button" class:selectedButton = {selectType == "changeBackgroundColor"} alt= "Change background color" style="width: 20px; height 25px" on:click={() => {if(selectType != "changeBackgroundColor"){
                    selectType = "changeBackgroundColor";
                }
                else{
                    selectType = "itemSelect";
                }}}/>
                <aside class = "colorPicker" class:invisible = {selectType != "changeBackgroundColor"}>
                    <input type="button" value="Transparent" on:click={() => {updateBackgroundColor(selectedItem, "transparent")}}/>
                    <div class="colorGrid">
                    <button style="background-color: #000000;" on:click={() => updateBackgroundColor(selectedItem, '#000000')}></button> <!--copilot made all these buttons-->
                    <button style="background-color: #333333;" on:click={() => updateBackgroundColor(selectedItem, '#333333')}></button>
                    <button style="background-color: #666666;" on:click={() => updateBackgroundColor(selectedItem, '#666666')}></button>
                    <button style="background-color: #999999;" on:click={() => updateBackgroundColor(selectedItem, '#999999')}></button>
                    <button style="background-color: #FFFFFF; border: 1px solid #000000;" on:click={() => updateBackgroundColor(selectedItem, '#FFFFFF')}></button>
            
                    <button style="background-color: #FF0000;" on:click={() => updateBackgroundColor(selectedItem, '#FF0000')}></button>
                    <button style="background-color: #CC0000;" on:click={() => updateBackgroundColor(selectedItem, '#CC0000')}></button>
                    <button style="background-color: #FF6666;" on:click={() => updateBackgroundColor(selectedItem, '#FF6666')}></button>
            
                    <button style="background-color: #00FF00;" on:click={() => updateBackgroundColor(selectedItem, '#00FF00')}></button>
                    <button style="background-color: #009900;" on:click={() => updateBackgroundColor(selectedItem, '#009900')}></button>
                    <button style="background-color: #66FF66;" on:click={() => updateBackgroundColor(selectedItem, '#66FF66')}></button>
            
                    <button style="background-color: #0000FF;" on:click={() => updateBackgroundColor(selectedItem, '#0000FF')}></button>
                    <button style="background-color: #000099;" on:click={() => updateBackgroundColor(selectedItem, '#000099')}></button>
                    <button style="background-color: #6666FF;" on:click={() => updateBackgroundColor(selectedItem, '#6666FF')}></button>
            
                    <button style="background-color: #FFFF00;" on:click={() => updateBackgroundColor(selectedItem, '#FFFF00')}></button>
                    <button style="background-color: #CCCC00;" on:click={() => updateBackgroundColor(selectedItem, '#CCCC00')}></button>
                    <button style="background-color: #FFFF66;" on:click={() => updateBackgroundColor(selectedItem, '#FFFF66')}></button>
            
                    <button style="background-color: #FF00FF;" on:click={() => updateBackgroundColor(selectedItem, '#FF00FF')}></button>
                    <button style="background-color: #CC00CC;" on:click={() => updateBackgroundColor(selectedItem, '#CC00CC')}></button>
                    <button style="background-color: #FF66FF;" on:click={() => updateBackgroundColor(selectedItem, '#FF66FF')}></button>
            
                    <button style="background-color: #00FFFF;" on:click={() => updateBackgroundColor(selectedItem, '#00FFFF')}></button>
                    <button style="background-color: #009999;" on:click={() => updateBackgroundColor(selectedItem, '#009999')}></button>
                    <button style="background-color: #66FFFF;" on:click={() => updateBackgroundColor(selectedItem, '#66FFFF')}></button>
            
                    <button style="background-color: #FFA500;" on:click={() => updateBackgroundColor(selectedItem, '#FFA500')}></button>
                    <button style="background-color: #CC8400;" on:click={() => updateBackgroundColor(selectedItem, '#CC8400')}></button>
                    <button style="background-color: #FFB84D;" on:click={() => updateBackgroundColor(selectedItem, '#FFB84D')}></button>
            
                    <button style="background-color: #800080;" on:click={() => updateBackgroundColor(selectedItem, '#800080')}></button>
                    <button style="background-color: #4B0082;" on:click={() => updateBackgroundColor(selectedItem, '#4B0082')}></button>
                    <button style="background-color: #D8BFD8;" on:click={() => updateBackgroundColor(selectedItem, '#D8BFD8')}></button>
            
                    <button style="background-color: #A52A2A;" on:click={() => updateBackgroundColor(selectedItem, '#A52A2A')}></button>
                    <button style="background-color: #8B4513;" on:click={() => updateBackgroundColor(selectedItem, '#8B4513')}></button>
                    <button style="background-color: #DEB887;" on:click={() => updateBackgroundColor(selectedItem, '#DEB887')}></button>
                </div>
                <div style="display: flex; flex-direction: row;">
                <label for="customColor">Custom Color:  </label>
                <input type="color" id="customColor" bind:value={selectedItem.backgroundColor} on:input={(e) => {updateBackgroundColor(selectedItem, e.target.value);}}/>
                </div>
            </aside>
            </div>
            <div>
                <input type="button" value="Background" class = "button" class:selectedButton = {selectType == "mainBackground"} on:click={() => {if(selectType != "mainBackground"){
                    selectType = "mainBackground";
                }
                else{
                    selectType = "itemSelect";
                }}}/>
                <aside class:invisible = {selectType != "mainBackground"} class="colorPicker" style="height: 400px;">
                    <input type="button" value="Transparent" on:click={() => changeBackground("color", "transparent")}/>
                    <div class="colorGrid"><!--copilot made all these buttons-->
                        <button style="background-color: #000000;" on:click={() => changeBackground("color", '#000000')}></button>
                        <button style="background-color: #333333;" on:click={() => changeBackground("color", '#333333')}></button>
                        <button style="background-color: #666666;" on:click={() => changeBackground("color", '#666666')}></button>
                        <button style="background-color: #999999;" on:click={() => changeBackground("color", '#999999')}></button>
                        <button style="background-color: #FFFFFF; border: 1px solid #000000;" on:click={() => changeBackground("color", '#FFFFFF')}></button>
            
                        <button style="background-color: #FF0000;" on:click={() => changeBackground("color", '#FF0000')}></button>
                        <button style="background-color: #CC0000;" on:click={() => changeBackground("color", '#CC0000')}></button>
                        <button style="background-color: #FF6666;" on:click={() => changeBackground("color", '#FF6666')}></button>
            
                        <button style="background-color: #00FF00;" on:click={() => changeBackground("color", '#00FF00')}></button>
                        <button style="background-color: #009900;" on:click={() => changeBackground("color", '#009900')}></button>
                        <button style="background-color: #66FF66;" on:click={() => changeBackground("color", '#66FF66')}></button>
            
                        <button style="background-color: #0000FF;" on:click={() => changeBackground("color", '#0000FF')}></button>
                        <button style="background-color: #000099;" on:click={() => changeBackground("color", '#000099')}></button>
                        <button style="background-color: #6666FF;" on:click={() => changeBackground("color", '#6666FF')}></button>
            
                        <button style="background-color: #FFFF00;" on:click={() => changeBackground("color", '#FFFF00')}></button>
                        <button style="background-color: #CCCC00;" on:click={() => changeBackground("color", '#CCCC00')}></button>
                        <button style="background-color: #FFFF66;" on:click={() => changeBackground("color", '#FFFF66')}></button>
            
                        <button style="background-color: #FF00FF;" on:click={() => changeBackground("color", '#FF00FF')}></button>
                        <button style="background-color: #CC00CC;" on:click={() => changeBackground("color", '#CC00CC')}></button>
                        <button style="background-color: #FF66FF;" on:click={() => changeBackground("color", '#FF66FF')}></button>
            
                        <button style="background-color: #00FFFF;" on:click={() => changeBackground("color", '#00FFFF')}></button>
                        <button style="background-color: #009999;" on:click={() => changeBackground("color", '#009999')}></button>
                        <button style="background-color: #66FFFF;" on:click={() => changeBackground("color", '#66FFFF')}></button>
            
                        <button style="background-color: #FFA500;" on:click={() => changeBackground("color", '#FFA500')}></button>
                        <button style="background-color: #CC8400;" on:click={() => changeBackground("color", '#CC8400')}></button>
                        <button style="background-color: #FFB84D;" on:click={() => changeBackground("color", '#FFB84D')}></button>
            
                        <button style="background-color: #800080;" on:click={() => changeBackground("color", '#800080')}></button>
                        <button style="background-color: #4B0082;" on:click={() => changeBackground("color", '#4B0082')}></button>
                        <button style="background-color: #D8BFD8;" on:click={() => changeBackground("color", '#D8BFD8')}></button>
            
                        <button style="background-color: #A52A2A;" on:click={() => changeBackground("color", '#A52A2A')}></button>
                        <button style="background-color: #8B4513;" on:click={() => changeBackground("color", '#8B4513')}></button>
                        <button style="background-color: #DEB887;" on:click={() => changeBackground("color", '#DEB887')}></button>
                    </div>
                    <div style="display: flex; flex-direction: row;">
                        <label for="customColor">Custom Color: </label>
                        <input type="color" id="customColor" on:input={(e) => changeBackground("color", e.target.value)} />
                    </div>
                    <form action=""> <!--https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file-->
                        <input type="file" accept="image/*" style="width: 180px;" on:change={e => {currentlySelectedBackgroundImage = e.target.files[0];}}/>
                        <input type = "submit" value="Submit" class="button" on:click={() => changeBackground("image", currentlySelectedBackgroundImage)}/>
                    </form>
                </aside>
            </div>
            <div class:invisible = {selectedItem.type != "image" || selectType == "itemPlace"}>
                <input type="image" src="cropImage.png" class = "button" class:selectedButton = {selectType == "cropImage"} alt="Crop image" style="width: 30px; height 30px;" on:click={() => {if(selectType != "cropImage"){
                    selectType = "cropImage";
                }
                else{
                    selectType = "itemSelect";
                }}}/>
            </div>
        <input type="image" src="delete.png" class = "button" alt="Delete Selected Item" style="width: 20px; height 60px;" on:click={() => deleteItem(selectedItem)}/>
        <input type="image" src="export.png" class = "button" class:selectedButton = {selectType == "exportProject"} alt="Export Project" style="width: 20px; height 60px;" on:click={() => {if(selectType != "exportProject"){
            selectType = "exportProject";
        }
        else{
            selectType = "itemSelect";
        }}}/>
        <aside class = "exportProject" class:invisible = {selectType != "exportProject"}>
            <h1>Export Project</h1>
            <h2>Step 1</h2>
            <p>Go to <a href="https://github.com/InteEli/madeWithTS">github</a> and click on the green code button and choose download ZIP</p>
            <h2>Step 2</h2>
            <p>Unzip the file and open the folder in a code editor</p>
            <h2>Step 3</h2>
            <p>Write npm install in the terminal</p>
            <h2>Step 4</h2>
            <p>Copy the code below and paste it in the script tag of src/routes/+page.svelte</p>
            <textarea id = "codeExport" readonly style="width: 100%; height: 200px;">
                {`let itemsInGrid = [${itemsInGrid.map(item => ` 
        {
            name: "${item.name}",
            height: ${item.height},
            width: ${item.width},
            start: { x: ${item.start.x}, y: ${item.start.y} },
            end: { x: ${item.end.x}, y: ${item.end.y} },
            type: "${item.type}",
            id: ${item.id},
            fontSize: "${String(parseFloat(item.fontSize)/cellSize*20)+"px"}",
            baseFontSize: "${String(parseFloat(item.fontSize)/cellSize*20)+"px"}",
            changeFontManually: ${item.changeFontManually},
            font: "${item.font}",
            color: "${item.color}",
            backgroundColor: "${item.backgroundColor}",
            src: "${item.src}",
            cropValues: {
                cropStart: { x: ${item.cropValues.cropStart.x}, y: ${item.cropValues.cropStart.y} },
                cropEnd: { x: ${item.cropValues.cropEnd.x}, y: ${item.cropValues.cropEnd.y} },
                baseWidth: ${item.cropValues.baseWidth},
                baseHeight: ${item.cropValues.baseHeight}
            }
                }`).join(",\n")}];
            let mainBackground = "${mainBackground}";
            let mainBackgroundImage = "${mainBackgroundImage}";
            $currentTheme = "${newTheme}";
                `}
            </textarea><!--copilot helped with this because there was other no easy way to show the list with object as written in code-->
            <input type="button" value="Copy to ClipBoard" on:click={() => {copyToClipBoard("codeExport")}}/>
            <h2>Step 5</h2>
            <p>Write npm run dev in the terminal and you should have your own website</p>

        </aside>

        </div>
        </section>
        <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%; height: 100%;">
        <section class = "websiteGrid" bind:this={gridElement} style="width: {gridSize.x*cellSize}; height: {gridSize.y*cellSize};">
            {#each gridArr as cell}
            <div class = "cell" role = "region" tabindex="-1">
                <input type="button" on:click={() =>{deSelect();}} style="height: 100%; width: 100%;"/>
            </div>
            {/each}
        </section>
        </div>
        <section style="height: 100%; width: 100%;">
            {#each itemsInGrid as item}
            <div class = "item" class:selected = {item == selectedItem} style="width:{item.width *cellSize}px; height:{item.height*cellSize}px; top: {(item.start.y*cellSize) + gridStart.y}px; left: {(item.start.x *cellSize) + gridStart.x}px; background-color: {item.backgroundColor};">
                <input type="button" on:pointerdown={() => rePlaceItem(item)} style= "top: {-5}px; left: {- 5}px; width:{item.width *cellSize+5}px; height:{item.height*cellSize+5}px;" class = "border" class:invisible = {item != selectedItem}/>
                {#if item.type == "text"}
                <textarea value={item.name} style="font-size: {item.fontSize}; font-family: {item.font};  color:{item.color};" on:input={(e) => {
                    item.name = e.target.value;
                    if(item.changeFontManually == false){
                    item.fontSize = adjustFontSize(item.id, item.name);} // Update the font size when the text changes
                    selectedItem = item;
                    }} 
                    class = "textInput" id = {String(item.id)} class:higherZ = {document.activeElement == document.getElementById(String(item.id))}/>
                <div style="height: 100%; width: 100%; color: transparent; background-color: transparent; font-family: {item.font}" class = "textInput" id = {String(-item.id)}> {item.name} </div>  <!--a div that changes font size with help of text fit and then applies that font size to the text area because of lack of support of text area-->  
                <input type="button" on:pointerdown={() => selectPlacedItem(item)} style="height: 100%; width: 100%; position: absolute;" on:dblclick={() => changeText(item)}/>  
                {/if}
                {#if item.type == "image"}
                <div id = {String(-item.id)} style="position: relative; overflow: hidden; width:100%; height:100%;" class:border2 = {selectType == "cropImage" && item == selectedItem}>
                <input type="button" id = {String(item.id)} on:click={() => selectPlacedItem(item)} style="height: {item.height*cellSize}px; width: {item.width*cellSize}px; position: absolute; background-image: url({item.src}); background-size: cover; background-repeat: no-repeat; background-size: 100% 100%;"/>  <!--https://stackoverflow.com/questions/71767782/make-image-fit-in-a-container-without-object-fit-contain-->
                <div class:invisible = {item != selectedItem || selectType != "cropImage"} style="height: 100%; width: 100%;">
                    <input type="button" on:pointerdown={() => startCropImage(item, "upleft")} style= "top: {- 5}px; left: {- 5}px; background-color: white;" class = "sizeButton" id = "upleft"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "up")} style= "top: {- 5}px; left: {(item.cropValues.baseWidth*cellSize)/2}px; background-color: white;" class = "sizeButton" id = "up"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "upright")} style= "top: {- 5}px; left: {- cellSize + item.cropValues.baseWidth*cellSize-10}px; background-color: white;" class = "sizeButton" id = "upright"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "left")} style= "top: {item.cropValues.baseHeight*cellSize/2-cellSize}px; left: {- 5}px; background-color: white;" class = "sizeButton" id = "left"/>  
                    <input type="button" on:pointerdown={() => startCropImage(item, "right")} style= "top: { item.cropValues.baseHeight*cellSize/2-8}px; left: { - cellSize + item.cropValues.baseWidth*cellSize-10}px; background-color: white;" class = "sizeButton" id = "right"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "downleft")} style= "top: {+ item.cropValues.baseHeight*cellSize - cellSize-8}px; left: {-2}px; background-color: white;" class = "sizeButton" id = "downleft"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "down")} style= "top: {+ item.cropValues.baseHeight*cellSize - cellSize-8}px; left: {+ item.cropValues.baseWidth*cellSize/2}px; background-color: white;" class = "sizeButton" id = "down"/>
                    <input type="button" on:pointerdown={() => startCropImage(item, "downright")} style= "top: {+ item.cropValues.baseHeight*cellSize - cellSize-8}px; left: {-cellSize + item.cropValues.baseWidth*cellSize-10}px; background-color: white;" class = "sizeButton"id ="downright"/>
                </div>
                </div>
                {/if}
                
                <div class:invisible = {item != selectedItem || selectType == "cropImage"} style="height: 100%; width: 100%;">
                    <input type="button" on:pointerdown={() => changeSize(item, "upleft")} style= "top: {- 5}px; left: {- 5}px;" class = "sizeButton" id = "upleft"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "up")} style= "top: {- 5}px; left: {(item.width*cellSize/2)}px;" class = "sizeButton" id = "up"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "upright")} style= "top: {- 5}px; left: {- 8 + item.width*cellSize}px;" class = "sizeButton" id = "upright"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "left")} style= "top: {item.height*cellSize/2-8}px; left: {- 5}px;" class = "sizeButton" id = "left"/>  
                    <input type="button" on:pointerdown={() => changeSize(item, "right")} style= "top: { item.height*cellSize/2-8}px; left: { -8 + item.width*cellSize}px;" class = "sizeButton" id = "right"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "downleft")} style= "top: {+ item.height*cellSize - cellSize/2}px; left: {- 5}px;" class = "sizeButton" id = "downleft"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "down")} style= "top: {+ item.height*cellSize - 8}px; left: {+ item.width*cellSize/2}px;" class = "sizeButton" id = "down"/>
                    <input type="button" on:pointerdown={() => changeSize(item, "downright")} style= "top: {+ item.height*cellSize -8}px; left: {-8 + item.width*cellSize}px;" class = "sizeButton"id ="downright"/>
                </div>

            </div>
            {/each}
        </section>
    </article>
</main>

<aside class="selectedItem" class:invisible = {selectedItem.name == "none" || mousedown == false || selectType != "itemPlace"} style="top: {mousePos.y + scrollY - placementOffset.y}px; left: {mousePos.x - placementOffset.x}px; height: {selectedItem.height *cellSize}px; width: {selectedItem.width*cellSize}px;" >
    <h2>{selectedItem.name}</h2>
</aside>

<style>
    main {
        display: grid;
        height: 200dvh;
        width: 100dvw;
        grid-template-columns: 200px 5fr;
    }
    input[type="text"]{
        background-color: #251529;
    }
    input[type="file"]{
        background-color: #251529;
        color: #f5e8da;
        border: 1px solid black;
        border-radius: 5px;
    }

    .colorPicker{
        display: flex;
        position: absolute;
        flex-direction: column;
        padding: 10px;
        background-color: #2b192e;
        border-radius: 20px;
        height: 350px;
        width: 200px;
        color: #f5e8da;
        font-family: 'Times New Roman', Times, serif;
        z-index: 100;
        margin: 20px;
    }
    .exportProject{
        display: flex;
        position: absolute;
        flex-direction: column;
        padding: 10px;
        background-color: #2b192e;
        border-radius: 20px;
        height: 50vh;
        width: 60vw;
        color: #f5e8da;
        font-family: 'Times New Roman', Times, serif;
        z-index: 100;
        margin: 20px;
    }
    .colorGrid {
    display: grid;
    grid-template-columns: repeat(5, 30px); 
    gap: 5px;
    padding: 10px;
}

.colorGrid button {
    width: 30px;
    height: 30px;
    border: none;
    cursor: pointer;
    border-radius: 5px; 
}
a{
    color: blue;
    text-decoration: none;
}
.settingBackground{
    width: 100%;
    height: 100%;
}
h1{
    font-size: 20px;
    font-family: 'Times New Roman', Times, serif;
    color: #f5e8da;
}
h2{
    font-size: 17px;
    font-family: 'Times New Roman', Times, serif;
    color: #f5e8da;
}

.colorGrid button:hover {
    border: 2px solid black; 
}
    .websiteGrid {
        display: grid;
        grid-template-columns: repeat(60, 20px);
        grid-template-rows: repeat(80, 20px);
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .tools {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: #2b192e;
        height: 100%;
        width: 100%;
        color: #f5e8da;
    }
    .settings {
        display: flex;
        flex-direction: row;
        padding: 10px;
        background-color: #2b192e;
        border-radius: 20px;
        height: 100%;
        width: 100%;
        color: #f5e8da;
        font-family: 'Times New Roman', Times, serif;
        gap: 10px;
    }
    .sizeButton{
        position: absolute;
        background-color: rgb(0, 17, 255);
        border: 1px solid black;
        width: 15px;
        height: 15px;
    }
    .cell{
        border: 1px dashed black;
        width: 20px;
        height: 20px;
        z-index: 0;
        background-color: transparent;
    }
    .cell:hover{
        background-color: rgba(173, 216, 230, 0.258);
        border: 1px solid black;

    }
    .selectedItem{
        background-color: rgb(229, 229, 229);
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
        border: 5px solid rgb(0, 110, 255);
        width: 100%;
        height: 100%;
    }
    .grid{
        display: grid;
        grid-template-rows: 50px 5fr;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
    .border2{
        background-color: transparent;
        border: 5px solid rgb(255, 255, 255);
        width: 100%;
        height: 100%;
    }
    .button{
        width: 100%;
        display: flex;
        align-items: center;
        justify-self: center;
    }
    .selectedButton{
        background-color: rgb(182, 182, 182);
        border-radius: 5px;
    }
    .button:hover{
        background-color: rgb(182, 182, 182);
        cursor: pointer;
        border-radius: 5px;
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
    @media (max-width: 1400px){
        .websiteGrid{
            grid-template-columns: repeat(60, 10px);
            grid-template-rows: repeat(80, 10px);
            margin-top: 20px;
            
        }
        main{
            height: 110dvh;
            grid-template-columns: 100px 5fr;
        }
        .cell{
            width: 10px;
            height: 10px;
            border-style: solid;
        }
    }
    @media (max-width: 800px){
        .websiteGrid{
            grid-template-columns: repeat(60, 8px);
            grid-template-rows: repeat(80, 8px);
            margin-top: 20px;
        }
        .cell{
            width: 8px;
            height: 8px;
        }
    }
    @media (max-width: 600px){

        main{
            height: 100dvh;
            grid-template-columns: 85px 5fr;
        }
        .grid{
            grid-template-rows: 100px 5fr;
            width: 100%;
        }
        .settings{
            display: grid;
            height: 50px;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr;
        }
    }
    @media (max-width: 500px){
        .websiteGrid{
            grid-template-columns: repeat(60, 6px);
            grid-template-rows: repeat(80, 6px);
            margin-top: 5px;
        }
        .cell{
            width: 6px;
            height: 6px;
        }
    }
    @media (max-width: 400px){
        main{
            width: 100vw;
        }
        .websiteGrid{
            grid-template-columns: repeat(60, 5px);
            grid-template-rows: repeat(80, 5px);
            margin-top: 5px;
            width: 75vw;
        }
        .cell{
            width: 5px;
            height: 5px;
        }
    }
</style>