import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Redirect, browserHistory } from 'react-router';
import ga from 'react-ga';

import configureStore from './utils/configureStore';
import App from './App';
import DevTools from './DevTools';

import 'global.css';

const store = configureStore();

ga.initialize(GA_TRACKING_CODE, { debug: __DEV__ });
browserHistory.listen((location) => ga.pageview(location.pathname));

if (typeof document !== 'undefined') {
  render(
    <Provider store={store}>
      <span>
        <Router history={browserHistory}>
          <Route path="/:airport/:type" component={App} />
          <Route path="/:airport/:type/:flightId" component={App} />
          <Redirect from="/kef" to="/kef/arrivals" />
          <Redirect from="/" to="/kef/arrivals" />
        </Router>
        <DevTools />
      </span>
    </Provider>,
    document.getElementById('app')
  );
}
