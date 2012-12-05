
Unfortunately, all the stuff I still want to do with this OS has to wait as
the projects are piling up at the end of this semester, so in some cases
things aren't as great as they could be. All the requirements are fulfilled
of course (I think). 

A detailed explanation on my approach to implementing the file system is in
file.js. It also explains how I separated text data from swap data.

You can theorically run as many programs as can fit in the hard drive with
the way I implemented swapping. I have not overfilled the hard drive since
the project technically only requires 4 processes to be loaded, so
overfilling the hard drive with most likely break things...

--------------------

Concerning you're comments on my last project, you can absolutely use it next
time you teach the class. I also plan to use this project to show people when
they ask to see things I've done, so I hope to have all the OCD issues fixed
eventually (as well as more thorough documentation).

About the OCD...

Autoscroll automatically scrolls to the most recently updated memory address
whenever the display updates, which is with every clock pulse. This is why you
can't scroll when it's on, hence the checkbox to disable it. I will add a 
scroll event to the display to automatically disable it when you scroll though.
I will also only have it scroll when something has changed.

Dropping to the next line when a process ends would mean for every process. 
Thus, if you run 3 processes at once, for example, the 12DONE, the console will 
drop 3 times, a line after every "DONE". The other way around this is to drop 
a line when the CPU becomes idle. I'm not sure which is better.

You can still enter commands while programs are running. Commands do not
internally co-mingle with the output, only on the screen. You just have
to remember what you've typed.

Another way around this is to perform some heavy coding on the canvas to
separate user input from program output. I think this is what I will do in the
future.

Cursor's still a little buggy.