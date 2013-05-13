/* --------  
   Utils.js

   Utility functions.
   -------- */

function trim(str)      // Use a regular expression to remove leading and trailing spaces.
{
    return str.replace(/^\s+ | \s+$/g, "");
    /* 
    Huh?  Take a breath.  Here we go:
    - The "|" separates this into two expressions, as in A or B.
    - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
    */
    
}

function rot13(str)     // An easy-to understand implementation of the famous and common Rot13 obfuscator.
{                       // You can do this in three lines with a complex regular experssion, but I'd have
    var retVal = "";    // trouble explaining it in the future.  There's a lot to be said for obvious code.
    for (var i in str)
    {
        var ch = str[i];
        var code = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0)
        {            
            code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
            retVal = retVal + String.fromCharCode(code);
        }
        else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0)
        {
            code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
            retVal = retVal + String.fromCharCode(code);
        }
        else
        {
            retVal = retVal + ch;
        }
    }
    return retVal;
}

/**
 * Converts the given integer to the two's complement representation.
 * 
 * For e.g. 0xF7 is -9 represented in two's complement using 1 byte.
 * 
 * (JavaScript's numbers are 64 bits until a bitwise operator is used on them, then they are
 *  converted to 32 bits).
 * 
 * let x = -9, and n = 8 bits
 * 
 * -x    = 0000 0000 0000 0000 0000 0000 0000 1001
 *       -                                       1 (subtract 1)
 *       = 0000 0000 0000 0000 0000 0000 0000 1000 
 *       | 1111 1111 1111 1111 1111 1111 0000 0000 (| with ~(2^n - 1))
 *       = 1111 1111 1111 1111 1111 1111 0000 1000 
 * ~x    = 0000 0000 0000 0000 0000 0000 1111 0111 = 0xF7      
 * 
 * @param {Number} integer the integer to convert
 * @param {Number} numberBytes the number of bytes representing the number (defaults to 1 if not
 *     specified)
 */
function toTwosComplement(integer, numberBytes, dontCheckRange) 
{    
    var numberBits = (numberBytes || 1) * 8;
    
    // Ensure it's in range given the number of bits
    if (!dontCheckRange && (integer < (-(1 << (numberBits - 1))) || integer > ((1 << (numberBits - 1)) - 1))) 
        throw "Integer out of range given " + numberBytes + " byte(s) to represent.";
    
    // If positive, return the positive value
    if (integer >= 0)
        return integer;
        
    // Else negative, convert to two's complement representation
    return ~(((-integer) - 1) | ~((1 << numberBits) - 1));
}

/**
 * Converts the given two's complement representation to the represented integer.
 * 
 * For e.g. 0xF7 is -9 represented in two's complement using 1 byte.
 * 
 * (JavaScript's numbers are 64 bits until a bitwise operator is used on them, then they are
 *  converted to 32 bits).
 * 
 * let x = 0xF7, and n = 8 bits
 * 
 * x     = 0000 0000 0000 0000 0000 0000 1111 0111
 * ~x    = 1111 1111 1111 1111 1111 1111 0000 1000
 *       & 0000 0000 0000 0000 0000 0000 1111 1111  (mask with 2^n - 1)
 *       = 0000 0000 0000 0000 0000 0000 0000 1000
 *       +                                       1  (add 1)
 *       = 0000 0000 0000 0000 0000 0000 0000 1001
 * 
 * This gives 9, then return the negation.  
 * 
 * @param {Number} twosComplement the two's complement representation
 * @param {Object} numberBytes the number of bytes representing the number (defaults to 1 if not
 *     specified)
 *
 * @return {Number} the represented integer
 */
function fromTwosComplement(twosComplement, numberBytes) 
{   
    var numberBits = (numberBytes || 1) * 8;
    
    if (twosComplement < 0 || twosComplement > (1 << numberBits) - 1)
        throw "Two's complement out of range given " + numberBytes + " byte(s) to represent.";
    
    // If less than the maximum positive: 2^(n-1)-1, the number stays positive
    if (twosComplement <= Math.pow(2, numberBits - 1) - 1)
        return twosComplement;
    
    // Else convert to it's negative representation
    return -(((~twosComplement) & ((1 << numberBits) - 1)) + 1);
}

String.prototype.pad = function(length, character)
{
	if (!character)
		character = " ";
	
	var str = this; // This performs a deep copy.
    
    while (str.length < length)
        str += character;
    
    return str;
};

String.prototype.prepad = function(length, character)
{
	if (!character)
		character = " ";
	
	var str = this; // This performs a deep copy.
    
    while (str.length < length)
        str = character + str;
    
    return str;
};
