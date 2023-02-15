// ==UserScript==
// @author         smthngsaid (+Flutterz)
// @name           Neopets - Battledome Prize Stats
// @description    Keeps a count of the items and Neopoints you've won
// @match      *://www.neopets.com/dome/arena.phtml*
// ==/UserScript==
$(document).ready(function () {
    $('#arenacontainer').on('click', '.end_game', function () {
        displayTotals();
    });
});


function displayTotals() {
    //Change PURGERECORD to true to clear all saved data next time a reward is collected, remember to change it back to false afterwards
    var PURGERECORD = false;

    //Change OUTPUTREWARDS to true to output collected data to console when you collect your reward
    var OUTPUTREWARDS = false;

    //Add items that are worth a lot to this list to make them increase the $$$ counter
    var moneyPrizes = ["Nerkmid","Bubbling Fungus"];

    //Don't modify anything below this unless you know what you're doing



    //Clear the record if set to clear
    if (PURGERECORD){
        console.log("RECORD HAS BEEN PURGED!");
        purgeAll();
    }

    //Mostly OG Battledome Prize Counter code
    let rewardsBox = document.getElementById("bd_rewards");
    //In case of double click
    if (rewardsBox.children[1].children.length > 0) {
        return;
    }
    //Grab stored info. If it's a new day, reset everything.
    var d = new Date(new Date().toLocaleString("en-US", {timeZone: "PST"}));
    var currentDate = d.getDate();
    var storedDate = window.localStorage.getItem('battledomeDate');
    var nPCount = window.localStorage.getItem('battledomeNPCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeNPCount'));
    var itemCount = window.localStorage.getItem('battledomeItemCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeItemCount'));
    var nerkCount = window.localStorage.getItem('battledomeNerkCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeNerkCount'));
    //Added for counting valuable items like nerks or fungus
    if (storedDate != currentDate) {
        nPCount = 0;
        itemCount = 0;
        nerkCount = 0;
        window.localStorage.setItem('battledomeNPCount', nPCount);
        window.localStorage.setItem('battledomeItemCount', itemCount);
        window.localStorage.setItem('battledomeNerkCount', nerkCount);
        window.localStorage.setItem('battledomeDate', currentDate);
    }
    //Add any winnings and store the new totals
    let prizes = document.querySelectorAll("#bd_rewardsloot .prizname");
    var npswon = false;
    if (prizes.length > 0) {
        for (let i = 0; i < prizes.length; i++) {
            if (/\d+ Neopoints/.test(prizes[i].textContent)) {
                npswon = true;
                let np = prizes[i].textContent.split(' ')[0];
                nPCount += parseInt(np);
            } else {
                //Check if item is valuable
                let itemName = prizes[i].textContent;
                for (let j = 0; j < moneyPrizes.length;j++){
                    if (itemName.indexOf(moneyPrizes[j])>-1){
                        nerkCount += 1;
                        break;
                    }
                }
                itemCount += 1;
                //Save item to permanent record
                if (npswon){
                    appendDump(i,prizes[i].textContent);
                } else {
                    appendDump(i+1,prizes[i].textContent);
                }
            }
        }
        window.localStorage.setItem('battledomeNPCount', nPCount);
        window.localStorage.setItem('battledomeItemCount', itemCount);
        window.localStorage.setItem('battledomeNerkCount', nerkCount);
    }
    //Display the totals
    let counter = document.createElement("span");
    counter.setAttribute("nowrap", "nowrap", "nowrap");
    let items = document.createElement("strong");
    items.textContent = ' Items: ' + itemCount;
    let nerks = document.createElement("strong");
    nerks.textContent = ' | $$$: ' + nerkCount;
    let separator = document.createElement("span");
    separator.textContent = ' | ';
    separator.setAttribute("style", "font-weight: normal;");
    let np = document.createElement("strong");
    np.textContent = 'NP: ' + nPCount;
    rewardsBox.children[1].appendChild(counter).appendChild(np).appendChild(separator).appendChild(items).appendChild(nerks);
    
    //Post record to console if set to do so
    if (OUTPUTREWARDS){
    console.log("Prizes Dump: "+window.localStorage.getItem('prizeDump'));
    }
}

function appendDump(prizeNum, prizeName){
    //Pull enemy name
    var enemyName = document.getElementById("p2name");
    enemyName = enemyName.textContent;
    
    //Messy spaghetti to extract the original enemy HP from the scripts on the page
    var hpScr = document.getElementsByTagName("script");
    var scrID = -1;
    //Find which script contains enemy HP
    for (let i = 0; i<hpScr.length;i++){
    let tester = hpScr[i].textContent;
        if (tester.indexOf("#p2hp")>-1){
            scrID = i;
            break;
        }
    }
    //Extract enemy HP from the script
    hpScr=hpScr[scrID].textContent;
    var HPid = hpScr.indexOf("#p2hp");
    var enemyHP=-1
    if (HPid != -1){
        enemyHP=hpScr.substring(HPid+14,HPid+30);
        enemyHP=enemyHP.substring(0,enemyHP.indexOf("'"));
    }
    //Retrieve permanent record
    var record = window.localStorage.getItem('prizeDump');
    //Append permanent record
    var extra = enemyName + "," + enemyHP + "," + prizeNum + "," + prizeName;
    record = record + "\n" + extra;
    //Save permanent record
    window.localStorage.setItem('prizeDump', record);
}

function purgeAll(){
    window.localStorage.setItem('prizeDump', "");
}
