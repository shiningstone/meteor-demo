import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import '../imports/startup/accounts-config.js';
import App from '../imports/ui/App.jsx';
import CountView from '../imports/ui/StoreView.jsx';

Meteor.startup(() => {
  render(<CountView />, document.getElementById('render-count'));
  render(<App />, document.getElementById('render-target'));
});
