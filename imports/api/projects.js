import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');
export const Stations = new Mongo.Collection('stations');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('projects', function projectsPublication() {
		var user = Meteor.users.findOne({_id:this.userId});

		if (Roles.userIsInRole(user, ["manager","user"], 'PROJECT 1') && Roles.userIsInRole(user, ["manager","user"], 'PROJECT 2')) {
			console.log('publishing projects', this.userId);
			return Projects.find({});
		} 

		if (Roles.userIsInRole(user, ["user"], 'PROJECT 1')) {
			console.log('publishing projects', this.userId);
			return Projects.find({name:'PROJECT 1'});
		} 

		this.stop();
		return;
  });
  Meteor.publish('stations', function stationsPublication() {
		var user = Meteor.users.findOne({_id:this.userId});

		if (Roles.userIsInRole(user, ["manager","user"], 'PROJECT 1') && Roles.userIsInRole(user, ["manager","user"], 'PROJECT 2')) {
			console.log('publishing projects', this.userId);
			return Stations.find({});
		} 

		if (Roles.userIsInRole(user, ["user"], 'PROJECT 1')) {
			console.log('publishing projects', this.userId);
			return Stations.find({project: 'PROJECT 1'});
		} 

		this.stop();
		return;
  });
}
