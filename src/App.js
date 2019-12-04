import _ from 'lodash';
import moment from 'moment-timezone';
import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import './App.css';
import leaderboardData from './leaderboard.json';

class Member {
  constructor(id, userData) {
    this._id = id;
    this._userData = userData;
  }

  // Returns the id of this user.
  id() {
    return this._id;
  }

  // Returns the name of this member;
  name() {
    return this._userData.name;
  }

  // Returns the unix time this user finished the given problem.
  finishTime(day, part) {
    return _.get(this._userData, ['completion_day_level', day, part, 'get_star_ts']);
  }
}

const members = _.map(leaderboardData.members, (userData, id) => new Member(id, userData));

// Returns a formatted timestamp displaying the given finish time.
function formatFinishTime(finishTime) {
  return moment.unix(+finishTime).tz("America/New_York").format("MMM DD  HH:mm:ss");
}

class Leaderboard extends React.Component {
  renderMember(member, place, day, part) {
    return (
      <div className="leaderboard-entry" key={member.id()}>
          <span className="leaderboard-position">{place.toString().padStart(4, ' ') + ")"}</span>
          <span className="leaderboard-time"> {formatFinishTime(member.finishTime(day, part))}</span>
          {"  " + member.name()}
      </div>
    );
  }

  renderMemberList(day, part) {
    const memberList = _(members)
          .filter((member) => member.finishTime(day, part))
          .sortBy((member) => member.finishTime(day, part))
          .map((member, place) => this.renderMember(member, place, day, part))
          .value();

    return (
      <div>{memberList}</div>
    );
  }

  renderLinks() {
    const dayNum = 4;

    const links = _.range(1, dayNum+1).map((day) => {
      return (
        <span
            key={day}
            className="navbar-link"
            onClick={() => this.props.history.push(`/day/${day}`)}>
            {day}&nbsp;
        </span>
      );
    });

    return (
      <p>
          &nbsp;Per Day: {links}
      </p>
    );
  }

  render() {
    const day = this.props.match.params.day;

    return (
      <div>
          {this.renderLinks()}
          <p>&nbsp;First users to get <span className="leaderboard-daydesc-both">both stars</span> on Day {day}:</p>
          {this.renderMemberList(day, 2)}
          <p>&nbsp;First users to get <span className="leaderboard-daydesc-first">the first star</span> on Day {day}:</p>
          {this.renderMemberList(day, 1)}
      </div>
    );
  }
}

function App(props) {
  return (
    <BrowserRouter>
        <Switch>
            <Route path="/day/:day" component={Leaderboard}/>
            <Route render={newProps => <Redirect to={{pathname: "/day/1"}} /> } />
        </Switch>
    </BrowserRouter>
  );
}

export default App;
