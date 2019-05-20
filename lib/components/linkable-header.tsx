import React from 'react';

export const LinkableHeaderH5 = ({
  id,
  children,
  level = 1,
  styleName = ''
}) => {
  return (
    <h5 id={id} className={`subtitle is-${level} linkable-header ${styleName}`}>
      {id && (
        <a href={`#${id}`} className="linkable-header__link">
          🔗
        </a>
      )}
      {children}
    </h5>
  );
};

export const LinkableHeaderH4 = ({
  id,
  children,
  level = 1,
  styleName = ''
}) => {
  return (
    <h4 id={id} className={`subtitle is-${level} linkable-header ${styleName}`}>
      {id && (
        <a href={`#${id}`} className="linkable-header__link">
          🔗
        </a>
      )}
      {children}
    </h4>
  );
};

export const makeId = title => (title ? title.replace(/ /g, '-') : null);
