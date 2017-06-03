// @flow
import React from 'react';

import Squircle from './squircle';

type Props = {
    images: Array<string>,
};

const Mosaic = (props: Props) => {
    const {
        images,
        ...other
    } = props;

    const children = [];
    switch (images.length) {
        case 0:
            children.push(
                <g key="placeholder" transform="translate(13, 13)">
                    <path fill="#fff" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
                </g>,
            );
            break;

        case 1:
            children.push(
                <image key="img-0" x="0" y="0" height="50" width="50" xlinkHref={props.images[0]} />,
            );
            break;

        case 2:
            children.push(
                <image key="img-0" x="-12.5" y="0" height="50" width="50" clipPath="url(#left)" xlinkHref={props.images[0]} />,
                <image key="img-1" x="12.5" y="0" height="50" width="50" clipPath="url(#right)" xlinkHref={props.images[1]} />,
            );
            break;

        case 3:
            children.push(
                <image key="img-0" x="-12.5" y="0" height="50" width="50" clipPath="url(#left)" xlinkHref={props.images[0]} />,
                <image key="img-1" x="25" y="0" height="25" width="25" clipPath="url(#right-1)" xlinkHref={props.images[1]} />,
                <image key="img-2" x="25" y="25" height="25" width="25" clipPath="url(#right-2)" xlinkHref={props.images[2]} />,
            );
            break;

        default:
            children.push(
                <image key="img-0" x="0" y="0" height="25" width="25" clipPath="url(#left-1)" xlinkHref={props.images[0]} />,
                <image key="img-1" x="0" y="25" height="25" width="25" clipPath="url(#left-2)" xlinkHref={props.images[1]} />,
                <image key="img-2" x="25" y="0" height="25" width="25" clipPath="url(#right-1)" xlinkHref={props.images[2]} />,
                <image key="img-3" x="25" y="25" height="25" width="25" clipPath="url(#right-2)" xlinkHref={props.images[3]} />,
            );
            break;
    }

    return (
        <Squircle {...other} width="40" height="40" zDepth={0}>
            <defs>
                <clipPath id="left">
                    <rect x="0" y="0" width="25" height="50" />
                </clipPath>
                <clipPath id="left-1">
                    <rect x="0" y="0" width="25" height="25" />
                </clipPath>
                <clipPath id="left-2">
                    <rect x="0" y="25" width="25" height="25" />
                </clipPath>
                <clipPath id="right">
                    <rect x="25" y="0" width="25" height="50" />
                </clipPath>
                <clipPath id="right-1">
                    <rect x="25" y="0" width="25" height="25" />
                </clipPath>
                <clipPath id="right-2">
                    <rect x="25" y="25" width="25" height="25" />
                </clipPath>
            </defs>
            <g clipPath="url(#round)">
                <rect x="0" y="0" width="50" height="50" fill="#757575" />
                {children}
            </g>
        </Squircle>
    );
};

export default Mosaic;
