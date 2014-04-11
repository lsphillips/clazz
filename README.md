## Clazzy

A cross platform JavaScript library that provides a classical interface, using a DSL inspired by Ruby, to a prototype system.


## Usage

### Creating a class

``` js
var Foo = Clazzy.create(
{
	// Constructor
	// --------------------------------

	initialize : function ()
	{
		this.foo = 'foo';
	},

	// Instance methods
	// --------------------------------

	bar : function ()
	{
		return 'bar';
	},

	baz : function (baz)
	{
		return baz;
	},
	
	// Static methods
	// --------------------------------

	static : 
	{
		qux : function ()
		{
			return 'qux';
		}
	}
});

var foo = new Foo();

foo.foo; // 'foo'

foo.bar(); // 'bar'

foo.baz('baz'); // 'baz' 

Foo.qux(); // 'qux'
```

**Note:** All instance properties of your class should be defined within the constructor.


### Creating a class that extends another class

``` js
var Bar = Clazzy.create(
{
	extend : Foo,

	// --------------------------------

	initialize : function ()
	{
		this.super();
	 // -------------

	 	this.corge = 'corge';
	},

	// --------------------------------

	baz : function ()
	{
		return 'bar';
	},

	baz : function (baz)
	{
		return 'super ' + this.super(baz);
	}
});

var bar = new Bar();

bar.foo; // 'foo'

bar.corge; // 'corge'

bar.bar(); // 'bar'

bar.baz('qux'); // 'super qux'

Bar.qux(); // throws an error
```

### Creating a class that includes another class

Clazzy provides a method of code reuse called includes. Behaving similarly to Ruby's mixins and PHP's traits, they enable a developer to reuse sets of methods freely in several independent classes living in different class hierarchies.

``` js
var Baz = Clazzy.create(
{
	include : [Foo],

	// --------------------------------

	moo : function ()
	{
		return 'moo';
	}
});

var baz = new Baz();

baz.foo; // 'foo'

baz.bar(); // 'bar'

baz.baz('baz'); // 'baz'

baz.moo(); // 'moo'

Baz.qux(); // throws an error
```

## Getting started

### Node

Clazzy is available through the Node Package Manager, so you can install like so:

``` sh
npm install clazzy
```

and bring into your code like so:

``` js
var Clazzy = require('clazzy');
```

### Browser

To use Clazzy in a browser envrionment, just use a script tag like so:

``` html
<script type="text/javascript" src="path/to/Clazzy.js"></script>
```

To remove Clazzy from the global namespace, you can use `Clazzy.noConflict()`, like so:

``` js
Namespace.Clazzy = Clazzy.noConflict();
```

## Development

Grunt is used to handle the build process for Clazzy. To perform a full build, use the `build` task:

``` sh
grunt build
```

which is just an alias for the `default` task:

``` sh
grunt
```

To only check code quality and/or run unit tests use the `test` task:

``` sh
grunt test
```

## License

Clazzy is released under the MIT License.