// @flow
import React from 'react';

export default () => {
    const branches = [];
    for (let i = 0; i < 360; i += (360 / 5)) {
        branches.push(
            <g key={i} transform={`rotate(${i} 50 50)`}>
                <line x1="50" x2="50" y1="5" y2="35" stroke="#E7A022" strokeWidth="5" strokeLinecap="round" />
                <line x1="50" x2="50" y1="65" y2="85" stroke="#E86325" strokeWidth="5" strokeLinecap="round" />
            </g>
        );
    }

    return (
        <svg height="100" width="100">
            {branches}
        </svg>
    );
};
