import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import classnames from 'classnames';
import Button from 'react-bootstrap/lib/Button';

import { jbStore } from './Store.jsx';

export default class CountView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: jbStore.getState(),
    };
	this.onChange = this.onChange.bind(this);
  }
    componentDidMount() {
		console.log('CountView did mounted');
		jbStore.subscribe(this.onChange);
	}
    onChange() {
        this.setState({
            count: jbStore.getState()
        });
    }

	render() {
		return (<div>
			<Button>count view + {this.state.count}</Button>
		</div>);
	}
}

