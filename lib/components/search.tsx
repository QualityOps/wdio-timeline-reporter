import React from 'react';

// const handleKeyUp = () => {
//   const input = document.getElementById('search');
//   const filter = input.nodeValue.toUpperCase();
//   let specsContainers = document.querySelectorAll('[data-box-is="spec"]');

//   for (let i = 0; i < specsContainers.length; i++) {
//     const txtValue =
//       specsContainers[i].textContent ||
//       (specsContainers[i] as HTMLElement).innerText;
//     if (txtValue.toUpperCase().indexOf(filter) > -1) {
//       (specsContainers[i] as HTMLElement).style.display = '';
//     } else {
//       (specsContainers[i] as HTMLElement).style.display = 'none';
//     }
//   }
//   specsContainers = document.querySelectorAll('[data-box-is="spec"]');

//   const specsContainersAreVisible = Array.from(specsContainers).some(
//     element =>
//       (element as HTMLElement).offsetWidth > 0 &&
//       (element as HTMLElement).offsetHeight > 0
//   );

//   const noResultsMessage = document.querySelector('#no-results') as HTMLElement;
//   noResultsMessage.style.display = specsContainersAreVisible ? 'none' : 'block';
// };

const Search = () => {
  const handleKeyUp = () => {
    const input = document.getElementById('search');
    const filter = input.nodeValue.toUpperCase();
    let specsContainers = document.querySelectorAll('[data-box-is="spec"]');

    for (let i = 0; i < specsContainers.length; i++) {
      const txtValue =
        specsContainers[i].textContent ||
        (specsContainers[i] as HTMLElement).innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        (specsContainers[i] as HTMLElement).style.display = '';
      } else {
        (specsContainers[i] as HTMLElement).style.display = 'none';
      }
    }
    specsContainers = document.querySelectorAll('[data-box-is="spec"]');

    const specsContainersAreVisible = Array.from(specsContainers).some(
      element =>
        (element as HTMLElement).offsetWidth > 0 &&
        (element as HTMLElement).offsetHeight > 0
    );

    const noResultsMessage = document.querySelector(
      '#no-results'
    ) as HTMLElement;
    noResultsMessage.style.display = specsContainersAreVisible
      ? 'none'
      : 'block';
  };
  return (
    <div className="columns">
      <div
        className="column
            is-half"
      >
        <div className="control has-icons-left has-icons-right">
          <input
            id="search"
            // onKeyUp={handleKeyUp}
            className="input"
            type="text"
            placeholder="Free text search"
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
