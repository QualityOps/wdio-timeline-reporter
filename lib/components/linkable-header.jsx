import React from 'react';

const LinkableHeader = ({id, children, level = 1, styleName = ''}) => {
    const H = `h${level}`;

    return <H id={id} className={`subtitle is-${level} linkable-header ${styleName}`}>
        {id && <a href={`#${id}`} className="linkable-header__link">🔗</a>}
        {children}
    </H>
};

export const makeId = title => title ? title.replace(/ /g, '-') : null;

export default LinkableHeader;
