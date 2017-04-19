import '../imports/api/tasks.js';
import {Projects, Stations} from '../imports/api/projects.js';

Meteor.startup(function () {

  ////////////////////////////////////////////////////////////////////
  // Create Test Secrets
  //
    
  if (Projects.find().fetch().length === 0) {
    Projects.insert({name:"PROJECT 1"});
    Projects.insert({name:"PROJECT 2"});
  }
  if (Stations.find().fetch().length === 0) {
    Stations.insert({name:"STATION 1.1",project:"PROJECT 1"});
    Stations.insert({name:"STATION 1.2",project:"PROJECT 1"});
    Stations.insert({name:"STATION 1.3",project:"PROJECT 1"});

    Stations.insert({name:"STATION 2.1",project:"PROJECT 2"});
    Stations.insert({name:"STATION 2.2",project:"PROJECT 2"});
  }
  
    if (Meteor.users.find().fetch().length === 0) {
    var users = [
        {name:"user1",email:"user1@example.com",roles:['manager','user'],groups:['PROJECT 1','PROJECT 2']},
        {name:"user2",email:"user2@example.com",roles:['user'],groups:['PROJECT 1','PROJECT 2']},
        {name:"user3",email:"user3@example.com",roles:['user'],groups:['PROJECT 1']}
	];
	

    _.each(users, function (userData) {
      var id,
          user;
      
      console.log(userData);

      id = Accounts.createUser({
        email: userData.email,
        password: "apple1",
        profile: { name: userData.name }
      });

      // email verification
      Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true}});
	  if(userData.groups!=null)
	  {
	      for(var i=0;i<userData.groups.length;i++)
		  {
    		  Roles.addUsersToRoles(id, userData.roles, userData.groups[i]);
		  }
	  }
	  else
	  {
		  Roles.addUsersToRoles(id, userData.roles);
	  }
    
    });
  }
  Accounts.validateNewUser(function (user) {
    var loggedInUser = Meteor.user();
    if (Roles.userIsInRole(loggedInUser, ['manager'], 'PROJECT 1')) {
      return true;
    }

    throw new Meteor.Error(403, "Not authorized to create new users");
  });
});
