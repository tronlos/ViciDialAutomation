from bs4 import BeautifulSoup
from lxml import etree
import requests
import webbrowser
from selenium import webdriver
import sys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from time import sleep
from urllib.request import urlopen
import urllib
import urllib.request
import urllib3
import time
from pprint import pprint
import os
import datetime

#At the beginning of this project, I began using python to track the number of leads available in the realtime report of vicidial. However Halfway through
#i began using javascript. The final product uses both, with python being the initial tracking program for checking when a program is under 5555 leads
# if so, the program fires leadstrackerfinal.js which actually iterates through the lists and resets them as needed

#the os.system("node leadstrackerfinal") found throughout the program executes the leadstrackerfinal.js so long as it is in the same folder





def tracker():

    r = requests.get('https://YOUR_VICIDIAL_URL.vicihost.com/vicidial/AST_timeonVDADallSUMMARY.php', auth=('USERNAME', 'PASSWORD'))
    url = 'USERNAME:PASSWORD@YOUR_VICIDIAL_URL.vicihost.com/vicidial/AST_timeonVDADallSUMMARY.php'

    soup = BeautifulSoup(r.text, 'lxml')
    soupText = str(BeautifulSoup.get_text(soup))

    str1 = "DIALABLE LEADS:"
    str2 = "Modify"

    campOcc1 = soupText.find(str2)
    campOcc2 = soupText.find(str2,campOcc1 + 1)
    campOcc3 = soupText.find(str2,campOcc2 + 1)
    campOcc4 = soupText.find(str2,campOcc3 + 1)
    campOcc5 = soupText.find(str2,campOcc4 + 1)
    


    str1occurrence = soupText.find(str1)
    str2occurrence = soupText.find(str1,str1occurrence + 1)
    str3occurrence = soupText.find(str1,str2occurrence + 1)
    str4occurrence = soupText.find(str1,str3occurrence + 1)
    str5occurrence = soupText.find(str1,str4occurrence + 1)

    leadsChecker = [str1occurrence, str2occurrence,str3occurrence, str4occurrence, str5occurrence]
    campChecker = [campOcc1, campOcc2, campOcc3, campOcc4, campOcc5]

    leadsCheckerStr= []
    campaign = []

    ##this formatting is made specifically so beautiful soup can grab the exact numbers for how many leads are left and in which campaign
    
    for i in leadsChecker:
        if i == -1:
           continue
        tempstr = soupText[i + 16: i + 22]
        leadsCheckerStr.append(tempstr)
    for i in campChecker:
        if i == -1:
            continue
        tempstr = soupText[i - 13: i - 5]
        campaign.append(tempstr)
                
    
    campaignInt = [int(x) for x in campaign]
    leadsCheckerInt = [int(x) for x in leadsCheckerStr]



    print()
    print("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")
    #print(soupText)

    now = datetime.datetime.now().time()
    print(now)
    camp_lead = dict(zip(campaignInt, leadsCheckerInt))
    print(camp_lead)
    print("------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")

# these next few blocks of code run the leadstrackerfinal.js regardless of the number of leads available at 1, 3 and 5. there were already lines of code 

#TURN THESE OFF IF YOU DONT NEED HOURLY RESETS
    if now.hour == 13 and now.minute < 3:
        print("It is either 1, 3 or 5 and lists will go through a reset regardless")
        os.system("node leadstrackerfinal")
        time.sleep(1200)
        

    if now.hour == 15 and now.minute < 3:
        print("It is either 1, 3 or 5 and lists will go through a reset regardless")
        os.system("node leadstrackerfinal")
        time.sleep(1200)
    
  
    if now.hour == 17 and now.minute < 3:
        print("It is either 1, 3 or 5 and lists will go through a reset regardless")
        os.system("node leadstrackerfinal")
        time.sleep(1200)

    
        
#this campaign had specific criteria, therefore it was given its own rules for resetting, which was having less than 200 leads in the campaign. 0
    for camp in camp_lead:
        if camp == 2222:
            impNum = camp_lead[camp]
            if impNum <= 200:
                
                
                print("2222 is being reset")
                os.system("node leadstrackerfinal")
                time.sleep(120)
                continue



    for camp in camp_lead:
        print(camp)
        print(camp_lead[camp])
        if camp == 1111 or camp == 1111 or camp == 1111 or camp == 1111:
            print("this is a restricted campaign or it has already been checked")
            print("_____________________________")
            continue
        num = camp_lead[camp]
        # this section was for a redundant part of the code that utilized a seperate list_resetter that has since been replaced with leadstrackerfinal.js
        # if now.hour >= 17 and now.minute >= 25 and num < 1200:
        #     print("Reset at NIGHT  will be activated")
        #    resetList(4)
        #    time.sleep(70)
        #    continue
        if num < 500:
            print("Reset during the DAY will be activated")
            #resetList(3)
            os.system("node leadstrackerfinal")
            time.sleep(180)
        print("______________________________________")




#this section of the code is an outdated list resetter, however can still be used. all list ID's and campaign ID's relevant have been changed to repeating numbers
#for the sake of security


def resetList(anum):
    page = urllib.request.urlopen("https://YOUR_VICIDIAL_URL.com/mi/lists.php?test=1").read()
    html = BeautifulSoup(page,"html.parser")
    print("-------------------------------------------------------------------")

    newfile =html.get_text()

    print("-------------------------------------------------------------------")



    sub = newfile[newfile.find('$') + 1: ]
    sublist = sub.split('\n')

    pprint(sublist)


    print("-------------------------------------------------------------------")

    for x in range(len(sublist)):
        temp = sublist[x]
        
        #this code checks whether or not the list item is an invalid statement to parse through the rest of the code
        if temp == '' or temp == ' ' or temp == '\xa0': 
            continue

        # variable declaration 
        listid= temp[0:4]
        listidINT= int(listid)
        leadcount= temp[temp.find(' ',len(temp) -7 ): ]
        conLeadCount = int(leadcount)
        tempchecker = temp[-18:]
        checker = "Y" in tempchecker
        resetCount= tempchecker[tempchecker.find('Y') + 1: tempchecker.find('Y') + 2]

        print(listid)
        print(conLeadCount)





        #this if statement checks if the list belonged to a restricted list
        if listidINT == 3333 or listidINT == 4444 or listidINT == 5555: 
            print("list " + listid + " is a restricted list that should only be reset once" )
            print("---------------------")

            continue

            #listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111 or listidINT == 1111
            #these lists will generally go the fastest


        if checker == True:
            print("List " + listid +" is Active")
            print()
            print("there are " + leadcount + " leads left in this list")

            resetCountInt = int(resetCount)

            if resetCountInt >= anum:
                print("this list has been reset" + str(anum) +  "times  or more already")
                print("---------------------")
                continue

            if conLeadCount < 45:
                print("this list will be reset.")
                webbrowser.open_new("https://YOUR_VICIDIAL_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + listid + "&reset_list=Y")
                time.sleep(2)
                continue
                print("---------------------")
        else:
            print("list " + listid + " is not active")
            print("---------------------")
 

            #this if statement block checks for the much larger lists, they run out slower 
        if checker == True: 
            biglist = [1111, 1111,1111,1111,1111,1111,1111,1111,1111,1111,1111,1111,1111,1111,1111, 1111, 1111,1111]
            for lst in biglist:
                if listidINT == lst:
                    if conLeadCount < 600:
                        print("this list will be reset.")
                        webbrowser.open_new("https://YOUR_VICIDIAL_URL.vicihost.com/vicidial/non_agent_api.php?source=script&user=USERNAME&pass=PASSWORD&function=update_list&list_id=" + listid + "&reset_list=Y")
                        print("-----------------------------")
                        time.sleep(2)
                        continue
                    print("-----------------------------")
                    continue
                print("-----------------------------")

number = 5
while number == 5:


    tracker()

    time.sleep(4)
    os.system('cls')