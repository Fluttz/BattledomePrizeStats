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
    var OUTPUTREWARDS = true;

    //Add items that are worth a lot to this list to make them increase the $$$ counter
    var moneyPrizes = ["Nerkmid","Bubbling Fungus","Frozen Negg"];

    //Don't modify anything below this unless you know what you're doing




    if (PURGERECORD){
        console.log("RECORD HAS BEEN PURGED!");
        purgeAll();
    }

    let rewardsBox = document.getElementById("bd_rewards");
    //In case of double click
    if (rewardsBox.children[1].children.length > 0) {
        return;
    }
    console.log(rewardsBox.textContent);
    //Grab stored info. If it's a new day, reset everything.
    var d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    var currentDate = d.getDate();
    var storedDate = window.localStorage.getItem('battledomeDate');
    var nPCount = window.localStorage.getItem('battledomeNPCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeNPCount'));
    var itemCount = window.localStorage.getItem('battledomeItemCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeItemCount'));
    var nerkCount = window.localStorage.getItem('battledomeNerkCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomeNerkCount'));

    var plotCount = window.localStorage.getItem('battledomeNerkCount') == null ? 0 : parseInt(window.localStorage.getItem('battledomePlotCount'));
    //For counting valuable items like nerks or fungus
    if (storedDate != currentDate) {
        nPCount = 0;
        itemCount = 0;
        nerkCount = 0;
        window.localStorage.setItem('battledomeNPCount', nPCount);
        window.localStorage.setItem('battledomeItemCount', itemCount);
        window.localStorage.setItem('battledomeNerkCount', nerkCount);
        window.localStorage.setItem('battledomeDate', currentDate);

        plotCount = 0;
        window.localStorage.setItem('battledomePlotCount', plotCount);
    }
    //Add any winnings and store the new totals
    let prizes = document.querySelectorAll("#bd_rewardsloot .prizname");

    //Look for duplicates bug
    let dupes = document.querySelectorAll("#bd_rewardsloot");
    dupes = (dupes[0].innerHTML.match(/<\/td><\/tr>/g) || []).length;


    var npswon = false;

    //Adjust number of prizes to read based on duplicates found
    var prizenum = prizes.length;
    if (dupes > 1){
        if (prizenum%2==0){
            prizenum = prizes.length/2;
        } else {
            prizenum = (prizes.length+1)/2;
        }
    }

    if (prizes.length > 0) {
        for (let i = 0; i < prizenum; i++) {
            if (/\d+ Neopoints/.test(prizes[i].textContent)) {
                npswon = true;
                let np = prizes[i].textContent.split(' ')[0];
                nPCount += parseInt(np);
            } else {
                //check if item is valuable
                let itemName = prizes[i].textContent;
                for (let j = 0; j < moneyPrizes.length;j++){
                    if (itemName.indexOf(moneyPrizes[j])>-1){
                        nerkCount += 1;
                        break;
                    }
                }
                itemCount += 1;
                //save item to record
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
    if (rewardsBox.textContent.includes("Plot Points")){
        if (!rewardsBox.textContent.includes("You have reached the Plot Points limit for today!")){
            let plotString = rewardsBox.textContent.substring(rewardsBox.textContent.indexOf("been rewarded")+14);
            plotString = plotString.substring(0,plotString.indexOf(" "));
            plotCount = plotCount + Number(plotString);
            window.localStorage.setItem('battledomePlotCount', plotCount);
        }
    }
    //Display the totals
    let counter = document.createElement("span");
    counter.setAttribute("nowrap", "nowrap", "nowrap");
    let items = document.createElement("strong");
    items.textContent = ' Items: ' + itemCount;
    let nerks = document.createElement("strong");
    nerks.textContent = ' | $$$: ' + nerkCount;
    let plots = document.createElement("strong");
    plots.textContent = ' | Plot Points: ' + plotCount;
    let separator = document.createElement("span");
    separator.textContent = ' | ';
    separator.setAttribute("style", "font-weight: normal;");
    let np = document.createElement("strong");
    np.textContent = 'NP: ' + nPCount;
    if (dupes > 1){
        let dupewarn = document.createElement("strong");
        dupewarn.innerHTML = '<br>DUPLICATE PRIZE BUG DETECTED';
        rewardsBox.children[1].appendChild(counter).appendChild(np).appendChild(separator).appendChild(items).appendChild(nerks).appendChild(plots).appendChild(dupewarn);
    } else {
        rewardsBox.children[1].appendChild(counter).appendChild(np).appendChild(separator).appendChild(items).appendChild(nerks).appendChild(plots);
    }
    if (OUTPUTREWARDS){
        let mainOut = window.localStorage.getItem('prizeDump').trim().split("\n");
        let spaceOut = "";
        let frostOut = "";
        let otherOut = "";
        for (let i = 0; i < mainOut.length; i++){
            if ((mainOut[i].includes("Giant Space Fungus"))||(mainOut[i].includes("Jetsam Ace"))){
                spaceOut = spaceOut + "\n" + mainOut[i];
            } else if ((mainOut[i].includes("Donny"))||(mainOut[i].includes("Lady Frostbite"))||(mainOut[i].includes("Snow Beast"))||(mainOut[i].includes("Snow Faerie"))||(mainOut[i].includes("The Snowager"))||(mainOut[i].includes("Valin"))){
                frostOut = frostOut + "\n" + mainOut[i];
            } else {
                otherOut = otherOut + "\n" + mainOut[i];
            }
        }

        console.log(spaceOut.trim());
        console.log(frostOut.trim());
        console.log(otherOut.trim());
    }
}

function appendDump(prizeNum, prizeName){
    var enemyName = document.getElementById("p2name");
    enemyName = enemyName.textContent;
    var hpScr = document.getElementsByTagName("script");
    var scrID = -1;
    for (let i = 0; i<hpScr.length;i++){
    let tester = hpScr[i].textContent;
        if (tester.indexOf("#p2hp")>-1){
            scrID = i;
            break;
        }
    }
    hpScr=hpScr[scrID].textContent;
    var HPid = hpScr.indexOf("#p2hp");
    var enemyHP=-1
    if (HPid != -1){
        enemyHP=hpScr.substring(HPid+14,HPid+30);
        enemyHP=enemyHP.substring(0,enemyHP.indexOf("'"));
    }
    var record = window.localStorage.getItem('prizeDump');
    var extra = enemyName + "," + enemyHP + "," + prizeNum + "," + prizeName;
    record = record + "\n" + extra;
    window.localStorage.setItem('prizeDump', record);
}

function purgeAll(){
    window.localStorage.setItem('prizeDump', "");
}
