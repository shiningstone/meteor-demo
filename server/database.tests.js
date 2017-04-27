
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

describe('Database access', () => {
	describe('Meteor tests', () => {
		it('Meteor..methods doesn\'t support assigned dynamically', ()=>{
			// Meteor.methods({
			// 	'Sys.Test' : function() { return true; },
			// });
			// assert.equal(Meteor.call('Sys.Test'), true);
			
			// try {
			// 	Meteor.methods({
			// 		'Sys.Test' : function() { return false; },
			// 	});
			// }
			// catch(ex)
			// {
			// 	assert.equal(Meteor.call('Sys.Test'), true);
			// }
		});
	});
	describe('Projects access', () => {
		beforeEach(() => {
			Projects.remove({});
		});

		it('add project', () => {
			var project = Projects.find({}).fetch();
			assert.equal(0, project.length);

			Projects.insert({name:'project test'});
			project = Projects.find({}).fetch();
			assert.equal(1, project.length);
			assert.equal('project test', project[0].name);
		});
		it('delete project', () => {
			Projects.insert({name:'project test'});
			project = Projects.find({}).fetch();
			var id = project[0]._id;
			Projects.remove({_id:id});

			project = Projects.find({}).fetch();
			assert.equal(0, project.length);
		});
		it('update project', () => {
			Projects.insert({name:'project test'});
			project = Projects.find({}).fetch();
			var id = project[0]._id;
			Projects.update({_id:id}, {$set: {name:'project test updated'}});

			project = Projects.find({}).fetch();
			assert.equal(1, project.length);
			assert.equal('project test updated', project[0].name);
		});
	});
});