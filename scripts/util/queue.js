/* ------------
   Queue.js
   
   A simple Queue, which is really just a dressed-up Javascript Array.
   See the Javascript Array documentation at http://www.w3schools.com/jsref/jsref_obj_array.asp .
   Look at the push and shift methods, as they are the least obvious here.
   
   ------------ */
   
function Queue()
{
    this.queue = new Array();
}

/**
 * Returns the size of the queue.
 * 
 * @return {Number} the size of the queue
 */
Queue.prototype.size = function()
{
    return this.queue.length;
}

/**
 * Returns true if the queue is empty.
 * 
 * @return {Boolean} true if the queue is empty, false otherwise
 */
Queue.prototype.isEmpty = function()
{
    return (this.queue.length == 0);    
}

/**
 * Adds the specified element to the end of the queue.
 * 
 * @param {Object} element the element to add
 */
Queue.prototype.enqueue = function(element)
{
    this.queue.push(element);        
}

/**
 * Removes and returns the next element from the front of the queue.
 * 
 * @return {Object} the next element from the queue
 */
Queue.prototype.dequeue = function()
{
    return this.queue.shift();        
}

/**
 * Removes the element from the specified index in the queue.
 * 
 * @param {Number} index the index
 */
Queue.prototype.remove = function(index)
{
	var firstPart = this.queue.splice(0, index);
	this.queue.shift();
	this.queue = firstPart.concat(this.queue);
}

/**
 * Return the contents of this queue as an array.
 * 
 * @return {Array} the contents of this queue
 */
Queue.prototype.getContents = function()
{
	return this.queue;
}

/**
 * Returns a string representation of this queue.
 * 
 * @return {String} a string representation of this queue
 */
Queue.prototype.toString = function()
{
    return this.queue.toString();
}
