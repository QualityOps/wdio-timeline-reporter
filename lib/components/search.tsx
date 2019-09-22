import React from 'react';

const Search = () => {
  return (
    <div className="columns">
      <div
        className="column
            is-half"
      >
        <div className="control has-icons-left has-icons-right">
          <input
            id="search"
            className="input"
            type="text"
            placeholder="Search for specs containing specific text e.g browser version"
          />
          <span className="icon is-small is-left">
            <i className="fas fa-search" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Search;
