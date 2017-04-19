
import { createStore } from 'redux';

console.log('Store start');
export const jbStore = createStore(reducer, 0);
var count = jbStore.getState();
console.log('store count is ' + count);

const defaultState = 0;
function reducer(state = defaultState, action) {
  switch (action.type) {
    case 'ADD':
	  console.log("add 1");
      return state + action.payload;
    default: 
	  console.log("add 2");
      return state;
  }
}
