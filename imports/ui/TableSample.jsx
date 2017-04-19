import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Table from 'react-bootstrap/lib/Table';

import {Projects, Stations} from '../api/projects.js'

class TableSample extends Component {
	renderHeader() {
		return (<tr>
			<th>Station Name</th>
			<th>Station Status</th>
			<th>Test Plan Selection</th>
			<th>Controll</th>
			<th>Edit</th>
			</tr>);
	}

	renderStations(prj) {
		var stations = Stations.find({project: prj}).fetch();

		return stations.map((station) => {
			return (
			<tr>
				<td>{station.name}</td>
				<td>Mark</td>
				<td>Otto</td>
				<td>@mdo</td>
			</tr>
			);
		});
	}

	renderPrjs() {
		return this.props.projects.map((project) => {
			var showBtn = false;
			if (Roles.userIsInRole(this.props.currentUser, ['manager'], project.name)) {
				showBtn = true;
			}
			return (  
				<div>
					<h2>{project.name}</h2>
							
					{showBtn ? (<button class="add-user">Add user</button>) : ('')}

					<Table striped bordered condensed hover>
						<thead>
							{this.renderHeader()}
						</thead>
						
						<tbody>
							{this.renderStations(project.name)}
						</tbody>
					</Table>
				</div>
			);
		});
	}

	render() {
		return (<div>{this.renderPrjs()}</div>); 
	};
}

TableSample.propTypes = {
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
}, TableSample);
