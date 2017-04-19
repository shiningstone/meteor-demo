import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import classnames from 'classnames';
import Button from 'react-bootstrap/lib/Button';
import {Projects, Stations} from '../api/projects.js'

class ProjectView extends Component {
	renderStations(prj) {
		var stations = Stations.find({project: prj}).fetch();
		
		return stations.map((station) => {
			return (
				<li>{station.name}</li>
			);
		});
	}
	
	renderPrjs() {
		return this.props.projects.map((project) => {
			var showBtn = false;
			if (Roles.userIsInRole(this.props.currentUser, ['manager'], 'PROJECT 1')) {
				showBtn = true;
			}
			return (
				<div>
					<h2>{project.name}</h2>
					
					{showBtn ? (<button class="add-user">Add user</button>) : ('')}
					
					<ul>
						{this.renderStations(project.name)}
					</ul>
				</div>
			);
		});
	}
	render() {
		return (<div>
			{this.renderPrjs()}
		</div>);
	}
}

ProjectView.propTypes = {
  projects: PropTypes.array.isRequired,
  stations: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('projects');
  Meteor.subscribe('stations');

  return {
    projects: Projects.find({}).fetch(),
	stations: Stations.find({}).fetch(),
    currentUser: Meteor.user(),
  };
}, ProjectView);
