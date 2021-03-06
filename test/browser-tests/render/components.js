import { test } from 'qunit';

test( 'Components are rendered in the correct place', t => {
	const Component = Ractive.extend({
		template: '<p>this is a component!</p>'
	});

	new Ractive({
		el: fixture,
		template: '<h2>Here is a component:</h2><Component/><p>(that was a component)</p>',
		components: { Component }
	});

	t.htmlEqual( fixture.innerHTML, '<h2>Here is a component:</h2><p>this is a component!</p><p>(that was a component)</p>' );
});

test( 'Top-level sections in components are updated correctly', t => {
	const Component = Ractive.extend({
		template: '{{#foo}}foo is truthy{{/foo}}{{^foo}}foo is falsy{{/foo}}'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Component foo="{{foo}}"/>',
		components: { Component }
	});

	t.htmlEqual( fixture.innerHTML, 'foo is falsy' );

	ractive.set( 'foo', true );
	t.htmlEqual( fixture.innerHTML, 'foo is truthy' );
});

test( 'Element order is maintained correctly with components with multiple top-level elements', t => {
	const Test = Ractive.extend({
		template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<p>before</p> <Test bool="{{bool}}"/> <p>after</p>',
		components: { Test }
	});

	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );

	ractive.set( 'bool', true );
	t.htmlEqual( fixture.innerHTML, '<p>before</p> TRUE <p>after</p>' );

	ractive.set( 'bool', false );
	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );
});

test( 'Top-level list sections in components do not cause elements to be out of order (#412 regression)', t => {
	const Widget = Ractive.extend({
		template: '{{#numbers:o}}<p>{{.}}</p>{{/numbers}}'
	});

	new Ractive({
		el: fixture,
		template: '<h1>Names</h1><Widget numbers="{{first}}"/><Widget numbers="{{second}}"/>',
		components: { Widget },
		data: {
			first: { one: 'one', two: 'two' },
			second: { three: 'three', four: 'four' }
		}
	});

	t.htmlEqual( fixture.innerHTML, '<h1>Names</h1><p>one</p><p>two</p><p>three</p><p>four</p>' );
});

test( 'An unless section in a component should still work with an ambiguous condition should still update (#2165)', t => {
	const cmp = Ractive.extend({
		template: '{{#unless nope}}{{foo}}{{/unless}}'
	});
	const r = new Ractive({
		el: fixture,
		template: '<cmp foo="{{bar}}" />',
		data: { bar: 'yep' },
		components: { cmp }
	});

	t.htmlEqual( fixture.innerHTML, 'yep' );
	r.set( 'bar', 'still' );
	t.htmlEqual( fixture.innerHTML, 'still' );
});
