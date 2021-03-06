'use strict';

// We need to pass array-like objects, such as the arguments
// object, to `Function#apply`, however not all implementations yet
// allow array-like objects to be passed to it. So we need to
// convert them to an array, this can be done using `Array#slice`.
//
// A further problem, is you can't slice array-like objects
// directly, like so:
//
//    arguments.slice(0);
//
// As they aren't arrays, however the method will still work if
// applied like this:
//
//    Array.prototype.slice.call(arguments, 0);
var slice = Array.prototype.slice;

// Keywords
// ------------------------------------------------------------------

var SUPER       = 'super';
var INITIALIZE  = 'initialize';
var EXTEND      = 'extend';
var STATIC      = 'static';
var INCLUDE     = 'include';
var FUNCTION    = 'function';
var CONSTRUCTOR = 'constructor';

// Helpers
// ------------------------------------------------------------------

var createAnUnconstructedInstanceOfClass = (function ()
{
	if (Object.create === undefined)
	{
		return function (clazz)
		{
			function Surrogate ()
			{
				// A surrogate function that does nothing. It
				// will allow us to create an object of a
				// prototype without running it's constructor.
			}

			Surrogate.prototype              = clazz.prototype;
			Surrogate.prototype[CONSTRUCTOR] = clazz;

			return new Surrogate();
		};
	}

	return function (clazz)
	{
		return Object.create(clazz.prototype);
	};

}) ();

var getPropertyDescriptor = function (object, property, deep)
{
	var descriptor = Object.getOwnPropertyDescriptor(object, property);

	if (descriptor !== undefined)
	{
		return descriptor;
	}

	if (deep)
	{
		var prototype = object;

		do
		{
			prototype = Object.getPrototypeOf(prototype);

			// Climb down the next kink of the prototype chain and
			// attempt to retrieve the property descriptor from
			// that kink.
			descriptor = Object.getOwnPropertyDescriptor(prototype, property);
		}
		while (prototype !== undefined && descriptor === undefined);
	}

	return descriptor;
};

var copyProperty = (function ()
{
	// IE8 implements `Object.defineProperty`, however it only
	// works on DOM elements. So IE8 must also use a fall-back
	// method, requiring us to check for the implementation of
	// `Object.defineProperties` instead.
	if (Object.defineProperties === undefined)
	{
		return function (source, target, property)
		{
			target[property] = source[property];
		};
	}

	return function (source, target, property, deep)
	{
		var descriptor = getPropertyDescriptor(source, property, deep);

		if (descriptor !== undefined)
		{
			// Normally this would suffice:
			//
			//   target[property] = methods[property];
			//
			// However for ECMA5 getters, this wouldn't work, as it
			// would be invoked, assigning the value being
			// returned by the getter, rather than it's definition.
			Object.defineProperty(target, property, descriptor);
		}
	};

}) ();

var copyProperties = function (source, target, deep)
{
	for (var property in source)
	{
		if ( deep || hasOwnProperty.call(source, property) )
		{
			copyProperty(source, target, property, deep);
		}
	}
};

// ------------------------------------------------------------------

var wrapMethodToHaveSuper = (function ()
{
	function noSuper ()
	{
		throw new Error('Cannot call super, this method does not override a parent method');
	}

	return function (method, signature, base)
	{
		return function ()
		{
			var tmp = this[SUPER];

			this[SUPER] = base.prototype[signature] || noSuper;

			var result;

			try // to execute the method.
			{
				result = method.apply(
					this, slice.call(arguments)
				);
			}
			finally
			{
				this[SUPER] = tmp;
			}

			return result;
		};
	};

}) ();

// ------------------------------------------------------------------

module.exports =
{
	create : function (definition)
	{
		if (definition === undefined)
		{
			definition = {};
		}

		var initialize, base, includes;

		// 1) Constructor

		function Class ()
		{
			if (includes !== undefined)
			{
				for (var i = 0, l = includes.length; i < l; ++i)
				{
					includes[i].call(this);
				}
			}

			if (initialize !== undefined)
			{
				initialize.apply(
					this, slice.call(arguments)
				);
			}
		}

		// 2) Inherit

		base = definition[EXTEND];

		if (base === undefined)
		{
			base = Object;
		}
		else
		{
			Class.prototype = createAnUnconstructedInstanceOfClass(base);

			// Default the class initializer to the base class
			// constructor.
			initialize = base.prototype.constructor;
		}

		// 3) Mixin

		includes = definition[INCLUDE];

		if (includes !== undefined)
		{
			for (var i = 0, l = includes.length; i < l; ++i)
			{
				var include = createAnUnconstructedInstanceOfClass(
					includes[i]
				);

				copyProperties(include, Class.prototype, true);
			}
		}

		// 4) Define

		for (var property in definition)
		{
			if ( hasOwnProperty.call(definition, property) )
			{
				var member = definition[property];

				switch (property)
				{
					case INITIALIZE :

						initialize = wrapMethodToHaveSuper(member, CONSTRUCTOR, base);

					break;

					case EXTEND  :
					case INCLUDE :

						// We have already dealt with these properties.

					break;

					case STATIC :

						copyProperties(member, Class, false);

					break;

					case SUPER :

						throw new Error('Cannot create class, `super` is a reserved method name.');

					default :

						if (typeof member === FUNCTION)
						{
							// Always wrap the method, even if a
							// parent method doesn't exist at the
							// moment, as a method could later be
							// injected into the prototype.
							Class.prototype[property] = wrapMethodToHaveSuper(member, property, base);
						}
						else
						{
							copyProperty(definition, Class.prototype, property);
						}
				}
			}
		}

		Class.prototype[CONSTRUCTOR] = Class;

		return Class;
	}
};
