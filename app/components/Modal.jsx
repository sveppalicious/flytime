import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import validator from 'validator';

import AirlineLogo from './AirlineLogo';
import LoadingIndicator from 'components/LoadingIndicator';

import styles from './Modal.css';

export default class Modal extends Component {

  static get propTypes() {
    return {
      type: PropTypes.string,
      flight: PropTypes.object,
      isLoading: PropTypes.bool,
      modalActions: PropTypes.object,
      flightActions: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      emailInput: '',
    };
  }

  render() {
    const { flight, type, isLoading } = this.props;

    if (!flight && isLoading || !flight.get('date')) {
      return (
        <div className={styles.container} onClick={(event) => this.handleClose(event)}>
          <div className={styles.loadingModal}>
            <LoadingIndicator size={40} orange />
          </div>
        </div>
      );
    } else if (!flight) {
      return (
        <div className={styles.container} onClick={(event) => this.handleClose(event)}>
          <div className={styles.errorModal}>
            <span className={styles.errorCode}>404</span>
            <span className={styles.errorMessage}>Whoops, could not find requested flight.</span>
            <a
              href="#"
              onClick={(event) => this.handleClose(event)}
              className={styles.closeButton}
            >
              Close
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container} onClick={(event) => this.handleClose(event)}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          <a href="#" onClick={(event) => this.handleClose(event)} className={styles.close} />
          <div className={styles.map} />
          <div className={styles.details}>
            <AirlineLogo airline={flight.get('airline')} />
            <div className={styles.location}>
              {type === 'arrivals' ? flight.get('location') : 'Keflavik'}
              <div className={styles.arrow} />
              {type === 'arrivals' ? 'Keflavik' : flight.get('location')}
            </div>
            <div className={styles.flightDetails}>
              <div className={styles.flightDetails__itemGroup}>
                <div className={styles.flightDetails__item}>
                  <div className={styles.label}>Flight no.</div>
                  <div>{flight.get('flightNum')}</div>
                </div>
                <div className={styles.flightDetails__item}>
                  <div className={styles.label}>Scheduled</div>
                  <div>{flight.get('scheduled')}</div>
                </div>
              </div>
              {flight.get('status') && (
                <div className={styles.flightDetails__item}>
                  <div className={styles.label}>Status</div>
                  <div>{flight.get('status')}</div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.follow}>
            {flight.getIn(['follow', 'following']) ? (
              <div className={styles.isFollowing}>
                {flight.getIn(['follow', 'email'])} is following this flight
              </div>
            ) : (
              <input
                value={this.state.emailInput}
                onChange={(event) => this.setState({ emailInput: event.target.value })}
                placeholder="Enter your email address..."
                className={styles.followInput}
                autoFocus
                type="email"
              />
            )}
            {this.renderFollowButton()}
          </div>
        </div>
      </div>
    );
  }

  renderFollowButton() {
    const { flight } = this.props;
    if (flight.getIn(['follow', 'loading'])) {
      return (
        <div className={styles.loadingButton}>
          <LoadingIndicator size={26} />
        </div>
      );
    } else if (flight.getIn(['follow', 'following'])) {
      return (
        <a
          href="#"
          onClick={(event) => this.handleUnfollow(event)}
          className={styles.followButton}
        >
          Unfollow
        </a>
      );
    }

    return (
      <a
        href="#"
        onClick={(event) => this.handleFollow(event)}
        className={classNames(styles.followButton, {
          [styles['followButton--disabled']]: !validator.isEmail(this.state.emailInput),
        })}
      >
        Follow
      </a>
    );
  }

  handleClose(event) {
    event.preventDefault();
    this.props.modalActions.close();
    browserHistory.push(`/kef/${this.props.type}`);
  }

  handleFollow(event) {
    event.preventDefault();
    if (!validator.isEmail(this.state.emailInput)) {
      return;
    }
    this.props.flightActions.follow(this.props.type, this.props.flight.get('id'), this.state.emailInput);
  }

  handleUnfollow(event) {
    const { type, flight } = this.props;
    event.preventDefault();
    this.props.flightActions.unfollow(type, flight.get('id'), flight.getIn(['follow', 'email']));
  }
}
