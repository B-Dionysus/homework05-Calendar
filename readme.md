# A Helpful Calendar, Because it's 2020 and What Day Is It Anyway
URL: https://b-dionysus.github.io/homework05-Calendar/Develop/

The Work Day Scheduler displays an input block for every hour from 9 am to 5 pm on weekdays and 8 am to 7 m on weekends. The user can enter tasks for each hour, and when they hit the save button the tasks are stored to their local drive.

There is also an interface to navigate the calendar, with forward and back buttons to see tomorrow and yesterday, as well as a datepicker to go to a specific date and a reset button to go back to today.

The rows are color-coded grey for times in the past, green for times in the future, and light red for the current hour. Each row displays weather data for that hour of the day, via Dark Skies.



# Known Bugs / ToDos
* Moment is offically legacy, and moment itself recommends using alternatives instead. A future version of this aite would probably use eithe rLuxon or Day.js instead--lighter alternatives that are less than nine years old.
(https://momentjs.com/docs/#/-project-status/recommendations/)
* moment() prefers dates in the ISO format year-month-day. Datepicker is capable of providing that, but it's ugly for humans to read (we'd prefer to see month, day, year). However, judging from this conversation, rolling my own conversion is outside the scope of this project:
https://stackoverflow.com/questions/20101603/how-do-i-convert-between-date-formats-used-by-jquery-ui-datepicker-and-moment-js
* I currently make a Dark Skies API call every time the page is loaded, and also every time the date changes. It's fine for this project--they charge $.001 per call, so I think I can afford it. But if I deployed this at scale, I could save a lot of money by being more clever about how I called the API. Just saving the data locally would mean I wouldn't have to call it every time the page loaded. And I think I can ask for several days' info at once, which would further reduce things.
* Speaking of, I don't actually have any way to know if the weather thing is working. It shows various different kinds of weather, and they all seem plausible (it's supposed to be sunny with clouds right now, and I guess it is? It predicts snow in January, which seems legit?) but I'd like to be a little more confidant that it was working correctly before I showed the client.
* I also didn't bother to include any of the nighttime icons. I think this is fine, but under certain conditions (especially on a weekend in the winter) Dark Skies could return a value of "night-cloudy" and it would just get my default question mark icon. This was just laziness on my part--it wouldn't be difficult to add more icons if needed.
* Storing geolocation data on the local storage really cut down on the irritating dialogue boxes I had to click, and increases load times for the weather icons marginally, but is a terrible idea for mobile. If you use this site on your phone in Australia in January and then fly to Chicago, it will still tell you to expect sunny weather because it won't know where you are!
* Ugh, and just now I started getting CORs errors when I ran it via github pages. BUT, when I ran the exact same page on github pages using incognito mode, there was no problem. My current guess (hope!) is that I have some chrome extension or other that's messing with things. I hope it works for you!