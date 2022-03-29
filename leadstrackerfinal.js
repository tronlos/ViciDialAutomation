const { exit } = require('process');
const puppeteer = require('puppeteer-extra')
//const readline = require("readline");
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const randomUseragent = require('random-useragent');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';



//This entire program is fired from the leadstracker.py and grabs every single list off of the list page, saving their listID, campaignID, Reset count, etc. into variables
//and checks whether or not they are under a certain amount of leads. if they are they get reset and once every list has been reset appropriately, this program terminates




//This get number function is fired from the bottom of the code when all lists except those specified are turned off meaning it will be anywhere from 1k-3k leads left in
//in the calling queue. At the time with the volume of agents we had, this number would go down very quickly so once it got down below 350 leads altogehter, the lists that were initially
//turned off would get turned back on. 
async function getnumber(){
    const newbrowser = await puppeteer.launch({headless: false});
    const newpage = await newbrowser.newPage();
    var x = 1
    while(x == 1)
    {
    
    await newpage.goto('https://USERNAME:PASSWORD@YOUR_VICIDLA_URL.vicihost.com/vicidial/realtime_report.php?RR=4&DB=0&group=SPECIFIED_CAMPAIGN', { waitUntil: 'networkidle2', timeout: 0 });

    try
    {
        var dialable = await newpage.evaluate(el => el.innerText, (await newpage.$x('//*[@id="realtime_content"]/table/tbody/tr[2]/td[2]/font'))[0]);
        var dialableint = parseInt(dialable); 
        console.log(dialable);
        if (dialableint < 350)
            {
                await newpage.close();
                await newbrowser.close();
                return "yes";
            }
        await newpage.waitFor(15000)
    }
    catch
    {
        continue
    }
}
    
};


//This section of the program runs through all of the lists resetting them as needed
var leadstracker = async function()
{

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    var num = 1
    var oneknum = 1
    var now = new Date();


    // in this section and the one before we establish a time and timezone, we do that so we can check for when things should turn off and on as well as initializing the not one array which is a set list 
    // of all the 8100 lists that are not the 1* lists at the start of run time and does not change, these lists will always be turned on or off while running
    var nowT = now.getTime() - 18000000;
    var epochTime = new Date(nowT);
    var nowHour = epochTime.getHours() + 5;
    var nowMin = epochTime.getMinutes();
    var x = 0;
    console.log(epochTime);
    console.log(nowHour);
    console.log(nowMin);

    let onearray = [];
    let oneresetarray = [] ; 
    let notonearray = [] ; 
    var onekleads = 0;


    while(num == 1)
    {

        // while the intended lists to be turned off/on are in place and do not change, these lists always have to be intialized as empty to avoid resetting lists multiple times
        onearray = [];
        oneresetarray = [];
        notonearray = [] ;

        oneknum = 1
        await page.goto('https://USERNAME:USERNAME@YOURVICIDIAL_WEBSITE.vicihost.com/vicidial/admin.php?ADD=100', { waitUntil: 'networkidle2', timeout: 0 });
        var links = await page.$$('a');
        var position = 2;
        for(var i=0; i < links.length; i++)
        {

            let valueHandle = await links[i].getProperty('innerText');
            let linkText = await valueHandle.jsonValue();
            let listHandle = await links[i].getProperty('href');
            let listText = await listHandle.jsonValue();


            try 
            {
               //console.log("The try is executing");
                var campid = await page.evaluate(el => el.innerText, (await page.$x('/html/body/center/table[1]/tbody/tr[1]/td[2]/table/tbody/tr[4]/td/table/tbody/tr/td/font/center/table/tbody/tr['+ position +']/td[9]/font'))[0]);
                var activeid = await page.evaluate(el => el.innerText, (await page.$x('/html/body/center/table[1]/tbody/tr[1]/td[2]/table/tbody/tr[4]/td/table/tbody/tr/td/font/center/table/tbody/tr['+ position +']/td[7]/font'))[0]);
            }
            catch(error)
            {  
                break
            }

            //This if statement ensures that the right links are pulled as there were multiple links that referenced the list and its data, therefore i made it so that it would only pull data from the links 
            //denoted as MODIFY and list_id

            if(linkText == "MODIFY" && listText.includes("list_id"))
            {
                //this if statement makes sure to pull lists from certain campaigns and only add them to necessary list variables if they are active. however
                //if they are not active the position iterates to the next one and does not add them to any variable that will be used in the following code
                if (campid == "" || campid == "" || campid == "" ||  campid == "" || campid == "" || campid =="" ||  campid == "" ||  campid == ""||activeid == "N" ) 
                    {
                        position = position + 1  
                        continue
                    } 
                    position = position + 1 
                    const listID = listText.substr(listText.indexOf("list_id") + 8 )
                    
                    //this if statement specified 3 list ID's that were NEVER meant to be reset, as such the program skips over these and continues onto the next iteration
                    if(listID == "" || listID == "" || listID == "")
                    {
                        console.log("This is ****, ****, and ****")
                        continue
                    }

                    //simply lists the information about the list id, its text, campaign, active code (y or n) etc. 
                    console.log("ListID is " +listID)
                    console.log("listText " + listText)
                    console.log("campaign is "+campid)
                    console.log("is it active "+ activeid)
                    const resetPage = await browser.newPage();
                    //console.log("newpage has been opened")
                    //After passing through all the checks and being iterated as necessary, the program navigates to this api call and pulls all of the information about the numbers of 
                    //dialable leads and how many resets they have

                    await resetPage.goto("https://USERNAME:USERNAME@YOURVICIDIAL_WEBSITE.vicihost.com/vicidial/non_agent_api.php?source=TEST&user=USER&pass=USERNAME&function=list_info&leads_counts=Y&header=no&dialable_count=Y&list_id=" + listID, { waitUntil: 'networkidle2'})
                    
                    
                    let infoHandle = await resetPage.$eval('*', (el) => el.innerText);

                    console.log()
                    //All of these variables are taken from the api call above and inserted in a format that can be used to calculate when to reset a list
                    const listValues = infoHandle.split("|")
                    console.log("LIST ID: " + listValues[0])
                    console.log("Resets: " + listValues[7])
                    console.log("All Leads: " + listValues[8])
                    console.log("Dialable: " + listValues[10])

                    var RESETS = parseInt(listValues[7]);
                    var ALL = parseInt(listValues[8]);
                    var DIALABLE = parseInt(listValues[10]);
                    //the big list variable is meant to accomodate lists with a larger number of leads which might run out of leads slower than their smaller counterparts and are denoted by their ID
                    const biglist = [""];
                    
                    console.log("ListID is " +listID)
                    console.log("listText " + listText)
                    console.log("campaign is "+campid)
                    console.log("is it active "+ activeid)

                    //1/20/22 THIS IS A WORK IN PROGRESS, COMPARE TO NEW PIECE-------------------------------------------------------------------------------------------------
                    //These lists, denoted as onekLeads were lists that at the time of my employment were required to be reset at least 4 times a day no matter what. As such I made seperate functions for them
                    if(listID == "" || listID == "" || listID == "" || listID == "" || listID == "" || listID == "" || listID == "" || listID == "" || listID == "")
                    {
                        onekleads = onekleads + DIALABLE
                        console.log("there are: " + RESETS + " inside list: " + listID)
                        console.log("NEW TOTAL FOR 1000 LEADS" + onekleads )
                        onearray.push(listID)
                        oneresetarray.push(RESETS)
                        console.log("___________________________________________________________________________________________");
                        await resetPage.close();

                        continue
                    }
                    //if the lists belonged to the campaign ID of ****, they would be inserted into this list
                    if(campid == "")
                    {
                        notonearray.push(listID)
                    }
                    // This was a seperate campaign that we had a specific group of agents belong to, these lists ran at a different pace, had different criteria altogether and therefore needed different criteria for restting
                    if(campid == 8000 && DIALABLE <40 && campid != 2304){   
                        console.log(" 8000 list will be reset");
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + listID + "&reset_list=Y", { waitUntil: 'networkidle2', timeout: 0 });
                        await resetPage.close();
                        console.log("list: " + listID + " Has been reset")
                        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        continue
                    }
                    //This section of the code tracked the bigger lists, at the time I was having trouble using the biglist variable, so i instead hardcoded the criteria for resetting these lists into the program
                    if(listID == "" || listID ==""|| listID =="" || listID =="" || listID =="" || listID ==""  || listID =="" || listID =="" || listID =="" || listID =="" || listID =="" || listID =="" || listID =="" || listID =="" || listID == "" || listID =="")
                    {
                        console.log("This is a bigger list, checking now if the bigger list has less than 600 leads")
                        if(DIALABLE < 600 && RESETS < 4)
                        {
                            //console.log(" big list will be reset");
                            await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + listID + "&reset_list=Y", { waitUntil: 'networkidle2', timeout: 0 });
                            console.log("list: " + listID + " Has been reset");
                            await resetPage.close();
                            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            continue
                        }
                        else
                        {
                            console.log("this list either has more than 600 leads or more than 3 resets");
                            await resetPage.close();
                            console.log("___________________________________________________________________________________________");
                            continue
                        }
                    }
                    // This section cyclled through the rest of the leads as necessary, if there were less than 4 resets, and there were less than 50 leads that hadnt been called in the list, it would reset.
                    if(RESETS < 4 && DIALABLE < 50)
                    {
                        //console.log("this list will be reset")
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + listID + "&reset_list=Y", { waitUntil: 'networkidle2', timeout: 0 });
                        await resetPage.close();
                        console.log("list: " + listID + " Has been reset")
                        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                        continue
                    }





                //await resetPage.waitFor(2000);
                await resetPage.close();     
                console.log("___________________________________________________________________________________________")
            }
            
        }
            /*This section tracks through the specific lists that need to be reset 4 times a day without question. These lists had to be reset at the same time, and could not be
            done more than twice within 2 hours, therefore I wrote the program to make sure to reset the lists at 12, 3 and 5, without having over a certain number of resets in 
            that schedule. If the lists hadnt been reset before a specific time, the program would turn off everything else in the same campaign allowing these lists to run on their
            own until the lists ran under 100 leads, which then would allow to program to loop, turning on the lists that aren't in this specific criteria, and checking once more.  
            
            
            //the num=2 value correlates to the top of the program, after num = 2 the loop will break and terminate the program subsequently
            
            */
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log("onekleads lists checker is active right now")
            await page.waitFor(2000)
    
            // this will check the status of all the 1000+ leads 
            while(oneknum == 1)
            {   
                const resetPage = await browser.newPage();
                await page.waitFor(2000)
                var nowK = now.getTime() - 18000000;
                var epochTimeK = new Date(nowK);
                var nowHour = epochTimeK.getHours() + 5;
                console.log("lists in 8100 that are not 1000: " + notonearray)
                console.log("lists in 8100 that are 1000: " + onearray)
                console.log("here are the number of resets in each 1000 list: " + oneresetarray[1])
                console.log("here are the number of leads in total for all 1000 lists: " + onekleads)
                console.log("the hour of day is " + nowHour)
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

                //All former lists that were turned off at the end are turned on, if this is the first run through of the loop, those lists will be on already regardless
                for(i = 0; i < notonearray.length ; i++ )
                {
                    console.log("list " + notonearray[i] + " will be turned on")
                    await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + notonearray[i] + "&active=Y", { waitUntil: 'networkidle2'})
                }
                //this makes sure that nothing gets turned off, if the lists have gone through the necessary amount of resets before 3 then nothing needs to happen
                if(oneresetarray[1] == 2 && nowHour < 15)
                {
                    num = 2
                    console.log("too many resets before 3")
                    await resetPage.close();
                    break

                }

                //this makes sure that nothing gets turned off, if the lists have gone through the necessary amount of resets before 5 then nothing needs to happen
                if(oneresetarray[1] == 3 && nowHour < 17)
                {
                    
                    num = 2
                    console.log("too many resets before 5")
                    await resetPage.close();
                    break

                }
        

                //this if block checks whether or not theres less than 100 leads and if there is it will reset the lists and terminate the program

                if(onekleads <= 100 && oneresetarray[1] < 4)
                {

                    console.log("the total amount of leads in the 1000 lists is: " + onekleads + " and as a result these lists will be reset" )
                    for(i = 0; i < onearray.length ; i++ )
                    {
                        console.log("list has been reset: " + onearray[i])
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + onearray[i] + "&reset_list=Y", { waitUntil: 'networkidle2'})
                    }    
                    num = 2
                    await resetPage.close();
                    break
                }

//This if statement checks whether or not the the time is 1 and if the resets have hit their appropriate amount of resets at this hour which is 2
//if they are still at one reset they everything will shut off except for the 1000 lists and run the getNumber() function which justs checks if theres under 120 leads  
                if(onekleads > 100  && nowHour == 13 && oneresetarray[1] == 1 )
                {
                    console.log("everything that is not 1000 related needs to be turned off the time is 1 and they still havent been reset twice this loop will continue iterating until the desired number of leads is met")
                    for(i = 0 ; i < notonearray.length ; i ++ )
                    {
                       console.log("list " + notonearray[i] + " has been shut off")  
                       await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + notonearray[i] + "&active=N", { waitUntil: 'networkidle2'})
                    }
                    let checker = await getnumber();
                    console.log("There are less than 300 leads." + checker)
                    
                    for(i = 0; i < notonearray.length ; i++ )
                    {
                        console.log("list " + notonearray[i] + " will be turned on")
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + notonearray[i] + "&active=Y", { waitUntil: 'networkidle2'})
                    }

                    onekleads = 0; 
                    oneknum = 2
                    await resetPage.close();
                    break;
                }

//This if statement checks whether or not the the time is 3 and if the resets have hit their appropriate amount of resets at this hour which is 3
//if they are still at second reset they everything will shut off except for the 1000 lists and run the getNumber() function which justs checks if theres under 120 leads  
                if(onekleads > 100  && nowHour == 15 && oneresetarray[1] == 2 )
                {
                    console.log("everything that is not 1000 related needs to be turned off the time is 3 and they still havent been reset 3 times")
                    for(i = 0 ; i < notonearray.length ; i ++ )
                    {
                        console.log("list " + notonearray[i] + " has been shut off")  
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + notonearray[i] + "&active=N", { waitUntil: 'networkidle2'})     
                    }
                    let checker = await getnumber();
                    console.log("There are less than 300 leads: " + checker)

                    for(i = 0; i < notonearray.length ; i++ )
                    {
                        console.log("list " + notonearray[i] + " will be turned on")
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=USERNAME&function=update_list&list_id=" + notonearray[i] + "&active=Y", { waitUntil: 'networkidle2'})
                    }
                    
                    onekleads = 0; 
                    oneknum = 2
                    await resetPage.close();
                    break;
                }



//This if statement checks whether or not the the time is 5 and if the resets have hit their appropriate amount of resets at this hour which is 3
//if they are still at 5 resets they everything will shut off except for the 1000 lists and run the getNumber() function which justs checks if theres under 120 leads    
                if(onekleads > 100  && nowHour == 17 && oneresetarray[1] == 3 )
                {
                    console.log("everything that is not 1000 related needs to be turned off the time is 5 and they still havent been reset 4 times")
                    for(i = 0 ; i < notonearray.length ; i ++ )
                    {
                
                        console.log("list " + notonearray[i] + " has been shut off")   
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + notonearray[i] + "&active=N", { waitUntil: 'networkidle2'})
                    }

                    let checker = await getnumber();
                    console.log("There are less than 300 leads: " + checker)

                    for(i = 0; i < notonearray.length ; i++ )
                    {
                        console.log("list " + notonearray[i] + " will be turned on")
                        await resetPage.goto("https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + notonearray[i] + "&active=Y", { waitUntil: 'networkidle2'})
                    }


                    onekleads = 0; 
                    oneknum = 2
                    await resetPage.close();
                    break;
                }

                await resetPage.close();
                num = 2
                oneknum = 2
                break
            }  
            //this is the end of the block that will execute

 



    }
    await page.close();
    await browser.close();
    exit


    
    
}();
    



//This is an example of the api call to call when trying to figure out what to use to measure when lists are ready to be reset
//https://YOUR_VICIDLA_URL.vicihost.com/vicidial/non_agent_api.php?source=luistest&user=USERNAME&pass=PASSWORD&function=list_info&leads_counts=Y&header=no&dialable_count=Y&list_id=9003
