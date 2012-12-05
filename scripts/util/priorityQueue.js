/* -------------
   PriorityQueue.js
   
   A script containing a PriorityMinQueue data structure.
   
   By John Dunham originally for use in rubix_js: https://github.com/mew2057/rubix_js,
   A Rubik's cube solver written by John Dunham and Christopher Cordisco.
   
   Modifications by Christopher Cordisco for use in this project.
   -------------- */

/**
 * Defines a priority queue with an array based heap implementation behind it.
 */
function PriorityMinQueue()
{
    this.h = [];  
}

/**
 * Inserts a value into the queue based on priority. If the priority exists, it 
 * is enqueued to a queue at that location.
 * 
 * @param priority The priority of the element.
 * @param element The element being added to the queue.
 */
PriorityMinQueue.prototype.insert = function(priority, element)
{
    if (!this.insertToExisting(priority,element))
    {
        this.h.push({ "p" : priority, "v" : [element] });
        this.trickleUp(this.h.length - 1);
    }
};

/**
 * Checks the queue to see if a given priority exists, if found it is added to the 
 * queue at the locaction.
 * 
 * @param priority The priority of the element.
 * @param element The element being added to the queue.
 */
PriorityMinQueue.prototype.insertToExisting = function(priority, element)
{
    for (var index in this.h)
    {
        if (this.h[index].p === priority)    
        {
            this.h[index].v.push(element);
            return true;
        }
    }
    
    return false;   
};

/**
 * Performs the trickle up for heap insertions.
 * 
 * @param index The index of the element to attempt to trickle up the heap.
 */
PriorityMinQueue.prototype.trickleUp = function(index)
{
    // This is equivalent to a floor function in JavaScript.
    var parent = ((index - 1)/2) >> 0;

    // Checks to see if the priority of the checked queue is less than that
    // of its parent in the heap. If so swap them in place in the array.
    if (index !== 0 && this.h[index].p < this.h[parent].p)
    {
        this.h.push(this.h[parent]);
        this.h[parent] = this.h[index];
        this.h[index] = this.h.pop();
        
        this.trickleUp(parent);
    }
};

/**
 * Removes an element from the queue.
 * 
 * @return The element if it is present.
 */
PriorityMinQueue.prototype.remove = function()
{
    var toReturn = null;
    
    if (this.h.length > 0)
    {
        toReturn = this.h[0].v.shift();
        
        if (this.h[0].v.length === 0)
        {
            if (this.h.length > 1)
            {
                this.h[0] = this.h.pop();
                this.heapRebuild(0);
            }
            else
            {
                this.h = [];   
            }
        }
    }
    return toReturn;
};

/**
 * Performs the heap rebuild for removals queue removals.
 * 
 * @param index The index of the current position of the rebuild.
 */
PriorityMinQueue.prototype.heapRebuild = function(index)
{
    if (this.h.length > 2 * index + 1)
    {
        var smallestChild = 2 * index + 1;
        
        // Compares children.
        if (this.h.length > smallestChild + 1 && 
            this.h[smallestChild].p > this.h[smallestChild + 1].p )
        {
            smallestChild++;
        }
        
        // Checks parent with smallest child.
        if (this.h[index].p > this.h[smallestChild].p)
        {
            this.h.push(this.h[smallestChild]);
            this.h[smallestChild] = this.h[index];
            this.h[index] = this.h.pop();
            
            this.heapRebuild(smallestChild);
        }        
    }
};

PriorityMinQueue.prototype.size = function()
{
	var length = 0;
	
	for (var i in this.h)
		length += this.h[i]["v"].length;
	
	return length;
}

/**
 * @return true if empty...
 */
PriorityMinQueue.prototype.isEmpty = function()
{
    return this.h.length === 0;
};

PriorityMinQueue.prototype.clean = function()
{
    delete this.h;   
};

PriorityMinQueue.prototype.getContents = function()
{
	if (this.isEmpty())
		return [];
	
	var contents = [], i, value, j;
	
	for (i in this.h)
	{
		value = this.h[i]["v"]
		
		for (j in value)
			contents.push(value[j]);
	}
	
	return contents;
}
