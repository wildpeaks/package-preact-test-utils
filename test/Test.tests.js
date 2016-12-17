'use strict';
/* eslint-env mocha, browser */
const {h, Component} = require('preact');
const {strictEqual, notStrictEqual, deepStrictEqual} = require('assert');
const TestableComponent = require('@wildpeaks/preact-component-testable');
const {toJSON} = require('@wildpeaks/snapshot-dom');
const Test = require('..');


function test_default_params(){
	document.body.innerHTML = '';
	let thrown = false;
	try {
		const wrapper = new Test(); // eslint-disable-line no-unused-vars
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, true, 'Exception thrown');
}


function test_invalid_component_null(){
	document.body.innerHTML = '';
	let thrown = false;
	try {
		const wrapper = new Test(null); // eslint-disable-line no-unused-vars
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, true, 'Exception thrown');
}


function test_invalid_component_article(){
	document.body.innerHTML = '';
	let thrown = false;
	try {
		const wrapper = new Test('article'); // eslint-disable-line no-unused-vars
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, true, 'Exception thrown');
}


function test_invalid_component_class(){
	document.body.innerHTML = '';

	class MyComponent extends Component {
		render(){
			return h('article', null, 'Hello');
		}
	}

	let thrown = false;
	try {
		const wrapper = new Test(MyComponent); // eslint-disable-line no-unused-vars
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, true, 'Exception thrown');
}


function test_valid_component_class(done){
	document.body.innerHTML = '';

	class MyComponent extends TestableComponent {
		render(){
			return h('article', null, this.props.title);
		}
	}

	let thrown = false;
	try {
		const wrapper = new Test(MyComponent); // eslint-disable-line no-unused-vars
		wrapper.render({title: 'HELLO'}, () => {
			deepStrictEqual(toJSON(wrapper.container), {
				tagName: 'div',
				childNodes: [
					{
						tagName: 'article',
						childNodes: [
							{
								nodeName: '#text',
								nodeValue: 'HELLO'
							}
						]
					}
				]
			});
			done();
		});
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, false, 'No exception thrown');
}


function test_invalid_container_null(){
	document.body.innerHTML = '';

	class MyComponent extends TestableComponent {
		render(){
			return h('article', null, this.props.title);
		}
	}

	let thrown = false;
	try {
		const wrapper = new Test(MyComponent, null); // eslint-disable-line no-unused-vars
	} catch(e){
		thrown = true;
	}
	strictEqual(thrown, true, 'Exception thrown');
}


function test_render_twice(done){
	document.body.innerHTML = '';

	class MyComponent extends TestableComponent {
		constructor(){
			super();
			this.state = {
				error: false
			};
		}
		render(){
			return h(
				'div', {class: 'mycomponent'},
				(this.state.error) ? null : h('h1', {ref: 'title'}, this.props.title)
			);
		}
	}
	MyComponent.defaultProps = {
		title: 'Default Title'
	};

	const wrapper = new Test(MyComponent, document.body);
	wrapper.render({title: 'BEFORE'}, () => {
		const component = wrapper.component;
		const title = wrapper.container.querySelector('[ref="title"]');

		notStrictEqual(title, null, 'ref=title exists');
		strictEqual(title.textContent, 'BEFORE', 'ref=title text is initialized');
		strictEqual(component.props.title, 'BEFORE', 'props.title is initialized');

		wrapper.render({title: 'AFTER'}, () => {
			strictEqual(title.textContent, 'AFTER', 'ref=title text is updated');
			strictEqual(component.props.title, 'AFTER', 'props.title is updated');
			done();
		});
	});
}


describe('render', /* @this */ function(){
	this.slow(500);
	this.timeout(1000);
	it('Default params', test_default_params);
	it('Invalid component (null)', test_invalid_component_null);
	it('Invalid component (div)', test_invalid_component_article);
	it('Invalid component (Component)', test_invalid_component_class);
	it('Valid component', test_valid_component_class);
	it('Invalid container (null)', test_invalid_container_null);
	it('Render twice', test_render_twice);
});