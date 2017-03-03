// @flow
import React from 'react';
import transitions from 'material-ui/styles/transitions';

type Props = {
    children: React.Element<*>, // Children passed into the paper element.
    style?: Object, // Override the inline-styles of the root element.
    transitionEnabled: bool, // Set to false to disable CSS transitions for the squircle element.
    zDepth: number, // This number represents the zDepth of the squircle shadow.
};

type Context = {
    muiTheme: Object,
};

function getStyles(props: Props, context: Context) {
    const {
        transitionEnabled,
        zDepth,
    } = props;

    const {
        paper,
    } = context.muiTheme;

    const shadow = paper.zDepthShadows[zDepth - 1];

    return {
        root: {
            boxSizing: 'border-box',
            transition: transitionEnabled && transitions.easeOut(),
            filter: shadow &&
                shadow
                    .split(/,\s*\n+\s*/)
                    .map(str => `drop-shadow(${str})`)
                    .join(' '),
        },
    };
}

const Squircle = (props: Props, context: Context) => {
    const {
        children,
        style, // eslint-disable-line no-unused-vars
        transitionEnabled, // eslint-disable-line no-unused-vars
        zDepth, // eslint-disable-line no-unused-vars
        ...other
    } = props;

    const { prepareStyles } = context.muiTheme;
    const styles = getStyles(props, context);

    return (
        <svg {...other} viewBox="0 0 50 50" style={prepareStyles(Object.assign(styles.root, style))}>
            <defs>
                <clipPath id="squircle">
                    <path d="M 25,0 C 5,0 0,5 0,25 0,45 5,50 25,50 45,50 50,45 50,25 50,5 45,0 25,0 Z" />
                </clipPath>
            </defs>
            <g clipPath="url(#squircle)">
                {children}
            </g>
        </svg>
    );
};

Squircle.contextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

Squircle.defaultProps = {
    transitionEnabled: true,
    zDepth: 1,
};

export default Squircle;
