//Auto log in and log out as list of users to trigger user's external database enrolments sync.
//The User account used in moodle must have access to login as othr users
//Adapted from an old script I had from something else
var async = require('async');
const puppeteer = require('puppeteer');

//headless browsing variables
const siteBase = 'MOODLE_DOMAIN';
const userName = 'USERNAME'; 
const pass = 'PASSWORD';
const courseID ='COURSE_ID_NUBER'; //Course list you're going through at the moment
const headlessBool = false;

startChecking();
async function startChecking(){
	try {
		const browser = await puppeteer.launch({headless:headlessBool});//Start headless browser
		const page = await browser.newPage();
		const loginP = siteBase+'/login/';	//Login to site
		await page.goto(loginP);
		await page.type('#username', userName);
		await page.type('#password', pass);
		await page.click('#loginbtn');
		await page.waitForNavigation();
		await page.goto(siteBase+'/user/index.php?contextid=261319&id=7867&perpage=5000');//Go to course user list
		await page.waitFor(2000);
		const allLinks = await page.evaluate(() => {
			const linkarray = Array.from(document.querySelectorAll('#participantsform a'));
			return linkarray.map(td => td.href);
		});
		var userLinkList = [];
		userLinkList.push(allLinks.filter(s => s.includes('user/view')));
		for(var profile in userLinkList[0]){//going through the user list
			await page.goto(userLinkList[0][profile]);
			await page.waitFor(1000);
			const allProfileLinks = await page.evaluate(() => {
				const linkarray = Array.from(document.querySelectorAll('.userprofile a'));
				return linkarray.map(td => td.href);
			});
			var profileOptions = [];
			profileOptions.push(allProfileLinks.filter(s => s.includes('course/loginas')));
			await page.goto(profileOptions[0][0]);
			await page.waitFor(1000);
			await page.goto(siteBase+'/login/logout.php');//logout
			await page.waitFor(1000);
			await page.click('.singlebutton');
			await page.waitForNavigation();
			await page.waitFor(1000);
			await page.goto(loginP); //login again
			await page.type('#username', userName);
			await page.type('#password', pass);
			await page.click('#loginbtn');
			await page.waitForNavigation();
		}		
		await browser.close();
	} catch(error) {console.log(error);}
}